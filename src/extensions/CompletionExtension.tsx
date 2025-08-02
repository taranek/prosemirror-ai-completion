import {
	defineCommands,
	defineNodeSpec,
	type Extension,
	type Union,
	union,
} from "@prosekit/core";
import type { Node } from "@prosekit/pm/model";
import { TextSelection } from "@prosekit/pm/state";

interface CompletionAttrs {
	id: string;
	value: string;
	kind: string;
}

/**
 * @internal
 */
type CompletionSpecExtension = Extension<{
	Nodes: {
		completion: CompletionAttrs;
	};
}>;

/**
 * @public
 */
export function defineCompletionSpec(): CompletionSpecExtension {
	return defineNodeSpec<"completion", CompletionAttrs>({
		name: "completion",
		atom: true,
		group: "inline",
		attrs: {
			id: { validate: "string" },
			value: { validate: "string" },
			kind: { default: "", validate: "string" },
		},
		inline: true,
		draggable: false,
		selectable: false,
		leafText: (node) => (node.attrs as CompletionAttrs).value.toString(),
		parseDOM: [
			{
				tag: `span[data-completion]`,
				getAttrs: (dom: HTMLElement): CompletionAttrs => ({
					id: dom.getAttribute("data-id") || "",
					kind: dom.getAttribute("data-completion") || "",
					value: dom.textContent || "",
				}),
			},
		],
		toDOM(node) {
			return [
				"span",
				{
					"data-id": (node.attrs as CompletionAttrs).id.toString(),
					"data-completion": (node.attrs as CompletionAttrs).kind.toString(),
				},
				(node.attrs as CompletionAttrs).value.toString(),
			];
		},
	});
}

/**
 * @internal
 */
type CompletionCommandsExtension = Extension<{
	Commands: {
		insertCompletion: [attrs: CompletionAttrs];
		updateCompletion: [id: string, value: string];
		cancelCompletion: [id: string];
		confirmCompletion: [id: string];
	};
}>;

/**
 * Helper function to remove completions from the document
 * @param tr - The transaction to apply deletions to
 * @param doc - The document to search
 * @param excludeId - Optional completion ID to exclude from removal
 * @returns Array of removed completion positions for position adjustment
 */
function removeCompletions(
	tr: any,
	doc: any,
	excludeId?: string
): { pos: number; size: number }[] {
	const completionsToRemove: { pos: number; size: number }[] = [];

	doc.descendants((node: any, pos: number) => {
		if (node.type.name === "completion") {
			if (!excludeId || node.attrs.id !== excludeId) {
				completionsToRemove.push({ pos, size: node.nodeSize });
			}
		}
	});

	// Remove completions in reverse order to maintain correct positions
	completionsToRemove.reverse().forEach(({ pos, size }) => {
		tr.delete(pos, pos + size);
	});

	return completionsToRemove;
}

export function defineCompletionCommands(): CompletionCommandsExtension {
	return defineCommands({
		insertCompletion: (attrs: CompletionAttrs) => {
			return (state, dispatch) => {
				if (!dispatch) return false;

				const { selection, doc } = state;
				const currentPos = selection.from;
				const tr = state.tr;

				// Remove all existing completions first
				removeCompletions(tr, doc);

				// Insert the new completion at the current cursor position
				const completionNode = state.schema.nodes.completion.create(attrs);
				tr.insert(currentPos, completionNode);

				// Keep the cursor at the original position (before the completion)
				tr.setSelection(TextSelection.create(tr.doc, currentPos));

				dispatch(tr);
				return true;
			};
		},
		updateCompletion: (id: string, value: string) => {
			return (state, dispatch) => {
				const { doc, selection } = state;
				let targetCompletionPos = -1;

				// Find the target completion position
				doc.descendants((node, pos) => {
					if (node.type.name === "completion" && node.attrs.id === id) {
						targetCompletionPos = pos;
						return false;
					}
				});

				if (targetCompletionPos !== -1 && dispatch) {
					const tr = state.tr;

					// Remove other completions and get position adjustments
					const removedCompletions = removeCompletions(tr, doc, id);
					
					// Adjust target position based on removals before it
					removedCompletions.forEach(({ pos, size }) => {
						if (pos < targetCompletionPos) {
							targetCompletionPos -= size;
						}
					});

					// Update the target completion
					const currentNode = doc.nodeAt(targetCompletionPos);
					if (currentNode) {
						tr.setNodeMarkup(targetCompletionPos, undefined, {
							...currentNode.attrs,
							value: value,
						});

						// Preserve the cursor position (should be before the completion)
						if (selection.from <= targetCompletionPos) {
							tr.setSelection(TextSelection.create(tr.doc, selection.from));
						}

						dispatch(tr);
						return true;
					}
				}
				return false;
			};
		},
		cancelCompletion: (id: string) => {
			return (state, dispatch) => {
				const { doc } = state;
				let completionPos = -1;
				let completionNode: Node | null = null;

				doc.descendants((node, pos) => {
					if (node.type.name === "completion" && node.attrs.id === id) {
						completionPos = pos;
						completionNode = node;
						return false;
					}
				});

				if (completionPos !== -1 && completionNode && dispatch) {
					const tr = state.tr;
					tr.delete(completionPos, completionPos + completionNode.nodeSize);
					dispatch(tr);
					return true;
				}
				return false;
			};
		},
		confirmCompletion: (id: string) => {
			return (state, dispatch) => {
				const { doc } = state;
				let completionPos = -1;
				let completionNode: Node | null = null;

				doc.descendants((node, pos) => {
					if (node.type.name === "completion" && node.attrs.id === id) {
						completionPos = pos;
						completionNode = node;
						return false;
					}
				});

				if (completionPos !== -1 && completionNode && dispatch) {
					const tr = state.tr;
					const completionValue = completionNode.attrs.value;

					// Replace the completion node with a text node containing the completion value
					tr.replaceWith(
						completionPos,
						completionPos + completionNode.nodeSize,
						state.schema.text(completionValue),
					);

					// Move cursor to the end of the inserted text
					const newCursorPos = completionPos + completionValue.length;
					tr.setSelection(TextSelection.create(tr.doc, newCursorPos));

					dispatch(tr);
					return true;
				}
				return false;
			};
		},
	});
}

/**
 * @internal
 */
type CompletionExtension = Union<
	[CompletionSpecExtension, CompletionCommandsExtension]
>;

/**
 * @public
 */
export function defineCompletion(): CompletionExtension {
	return union(defineCompletionSpec(), defineCompletionCommands());
}
