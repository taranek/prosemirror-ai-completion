"use client";

import { ProseMirrorEditor } from "@/components/ProseKitCompletionExample";
import { CompletionExplainer } from "@/components/CompletionExplainer";

export default function Home() {
	return (
		<div className="font-sans flex justify-center items-start justify-items-center min-h-[100dvh] p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-5 row-start-2 items-center sm:items-start w-full max-w-[900px]">
				<h1 className="text-4xl font-bold">Prosemirror AI assistant</h1>
				<p className="mb-2 text-foreground-50">
					Use AI to assist with your Prosemirror editor. Type something in the
					editor and wait for the AI to complete your thoughts.
				</p>
				
				<CompletionExplainer />
				
				<ProseMirrorEditor />
			</main>
		</div>
	);
}
