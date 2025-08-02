import { useCallback, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useDebouncedCallback } from "use-debounce";
import type { ProseMirrorNode } from "prosekit/pm/model";
import { useDocChange } from "prosekit/react";
import { jsonFromNode } from "@prosekit/core";
import { Editor, NodeJSON } from "prosekit/core";
import { defineCompletion } from "@/extensions/CompletionExtension";

const trimQuotesFromStartAndEnd = (str: string) => {
	const quotes = ['"', "'", "`"];
	if (quotes.some((quote) => str.startsWith(quote) && str.endsWith(quote))) {
		return str.slice(1, -1);
	}
	return str;
};

export type EditorExtension = ReturnType<typeof defineCompletion>;

export type CompletionEditor = Editor<EditorExtension>;

interface UseStreamingCompletionProps {
	editor: CompletionEditor;
}

const traverseContext = (content: NodeJSON[]) => {
	if (content.length === 0) {
		return content;
	}
	if (content[content.length - 1]?.content) {
		return traverseContext(content[content.length - 1].content);
	}
	return content;
};

export function useStreamingCompletion({
	editor,
}: UseStreamingCompletionProps) {
	const [currentCompletionId, setCurrentCompletionId] = useState<string | null>(
		null,
	);

	const { messages, append, status } = useChat({
		api: "/api/chat",
	});

	const handleDocChange = useDebouncedCallback((doc: ProseMirrorNode) => {
		const json = jsonFromNode(doc);
		const messageContent = traverseContext(json?.content);

		if (messageContent?.[messageContent.length - 1]?.type === "completion") {
			return;
		}
		append({
			role: "user",
			content: JSON.stringify(json),
		});
	}, 800);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (
			lastMessage &&
			lastMessage.role === "assistant" &&
			status === "streaming" &&
			editor.focused
		) {
			const completionId = lastMessage.id;

			// If this is a new completion, insert it
			if (currentCompletionId !== completionId) {
				setCurrentCompletionId(completionId);
				editor.commands.insertCompletion({
					id: completionId,
					value: trimQuotesFromStartAndEnd(lastMessage.content),
					kind: "user",
				});
			} else {
				// Update existing completion with new content
				editor.commands.updateCompletion(
					completionId,
					trimQuotesFromStartAndEnd(lastMessage.content),
				);
			}
		}
	}, [messages, status, currentCompletionId, editor, setCurrentCompletionId]);

	const cancelCompletion = useCallback(() => {
		if (currentCompletionId) {
			editor.commands.cancelCompletion(currentCompletionId);
		}
		setCurrentCompletionId(null);
	}, [editor, currentCompletionId]);

	const confirmCompletion = useCallback(() => {
		if (currentCompletionId) {
			editor.commands.confirmCompletion(currentCompletionId);
			setCurrentCompletionId(null);
		}
	}, [editor, currentCompletionId]);

	useDocChange(handleDocChange, { editor });

	return {
		cancelCompletion,
		confirmCompletion,
	};
}
