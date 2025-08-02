"use client";

import { ProseMirrorEditor } from "@/components/ProseKitCompletionExample";

export default function Home() {
	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-2 row-start-2 items-center sm:items-start w-full max-w-[900px]">
				<h1 className="text-4xl font-bold">Prosemirror AI assistant</h1>
				<p className="text-gray-500 mb-5">
					Use AI to assist with your Prosemirror editor. Type something in the
					editor and wait for the AI to complete your thoughts. Press{" "}
					<code>Tab</code> to confirm the completion.
				</p>
				<ProseMirrorEditor />
			</main>
		</div>
	);
}
