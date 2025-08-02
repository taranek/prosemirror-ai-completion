import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";

import { defineBasicExtension } from "prosekit/basic";
import { createEditor, type NodeJSON, union, Editor } from "prosekit/core";
import { ProseKit } from "prosekit/react";
import { useMemo } from "react";
import { defineCompletion } from "@/extensions/CompletionExtension";
import { useStreamingCompletion } from "@/hooks/useStreamingCompletion";
import { useEditorEvent } from "@/hooks/useEditorEvent";

export function defineExtension() {
	return union(defineBasicExtension(), defineCompletion());
}
export type EditorExtension = ReturnType<typeof defineExtension>;

export type CompletionEditor = Editor<EditorExtension>;

export function ProseMirrorEditor({
	defaultContent,
}: {
	defaultContent?: NodeJSON;
}) {
	const editor = useMemo(() => {
		const extension = defineExtension();
		return createEditor({ extension, defaultContent });
	}, [defaultContent]);

	const { confirmCompletion, cancelCompletion } = useStreamingCompletion({
		editor,
	});

	useEditorEvent(editor, "keydown", (event: KeyboardEvent) => {
		if (event.key === "Tab") {
			event.preventDefault();
			confirmCompletion();
			return;
		}
		cancelCompletion();
	});

	useEditorEvent(editor, "focus", cancelCompletion);
	useEditorEvent(editor, "blur", cancelCompletion);

	return (
		<ProseKit editor={editor}>
			<div className="box-border h-full w-full min-h-36 overflow-y-hidden overflow-x-hidden rounded-md border border-solid border-gray-200 dark:border-gray-700 shadow flex flex-col bg-white dark:bg-gray-950 color-black dark:color-white">
				<div
					ref={editor.mount}
					className="ProseMirror box-border min-h-full px-10 h-fit py-8 outline-none outline-0 "
				/>
			</div>
		</ProseKit>
	);
}
