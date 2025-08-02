import { useEffect } from "react";
import type { Editor } from "prosekit/core";

export function useEditorEvent<EventName extends keyof HTMLElementEventMap>(
	editor: Editor,
	event: EventName,
	callback: (event: HTMLElementEventMap[EventName]) => void,
) {
	useEffect(() => {
		const editorElement = editor.view.dom;
		editorElement.addEventListener(event, callback);
		return () => {
			editorElement.removeEventListener(event, callback);
		};
	}, [editor, event, callback]);
}
