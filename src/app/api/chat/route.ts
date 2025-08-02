import { streamText, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	const result = streamText({
		model: openai("gpt-4o"),
		system: `Your task is to provide completion for the document. 
    Complete the current sentence or start a new one based on the context provided in the JSON object.
    Do not add more than 2 sentences to the document.
    Pay attention to the context and structure of the document.
    Prepend your response with space if you're starting a new sentence to ensure it fits seamlessly into the document.
    Respond with a completion text only as a string. Always return a string, not a stringified JSON. No quotes.
    `,
		messages,
	});

	return result.toDataStreamResponse();
}
