import {
  Chat,
  Chunk,
  Source,
  CoreMessage,
  AIProviders,
  ProviderName,
  Citation,
} from "@/types";
import {
  convertToCoreMessages,
  embedHypotheticalData,
  generateHypotheticalData,
  getSourcesFromChunks,
  searchForChunksUsingEmbedding,
  getContextFromSources,
  getCitationsFromChunks,
  buildPromptFromContext,
} from "@/utilities/chat";
import {
  queueAssistantResponse,
  queueError,
  queueIndicator,
} from "@/actions/streaming";
import {
  HISTORY_CONTEXT_LENGTH,
  DEFAULT_RESPONSE_MESSAGE,
} from "@/configuration/chat";
import { stripMessagesOfCitations } from "@/utilities/chat";
import {
  RESPOND_TO_HOSTILE_MESSAGE_SYSTEM_PROMPT,
  RESPOND_TO_QUESTION_BACKUP_SYSTEM_PROMPT,
  RESPOND_TO_QUESTION_SYSTEM_PROMPT,
  RESPOND_TO_RANDOM_MESSAGE_SYSTEM_PROMPT,
} from "@/configuration/prompts";
import {
  RANDOM_RESPONSE_PROVIDER,
  RANDOM_RESPONSE_MODEL,
  HOSTILE_RESPONSE_PROVIDER,
  HOSTILE_RESPONSE_MODEL,
  QUESTION_RESPONSE_PROVIDER,
  QUESTION_RESPONSE_MODEL,
  HOSTILE_RESPONSE_TEMPERATURE,
  QUESTION_RESPONSE_TEMPERATURE,
  RANDOM_RESPONSE_TEMPERATURE,
} from "@/configuration/models";

/**
 * ResponseModule is responsible for collecting data and building a response
 */
export class ResponseModule {
  static async respondToRandomMessage(
    chat: Chat,
    providers: AIProviders
  ): Promise<Response> {
    /**
     * Respond to the user when they send a RANDOM message
     */
    const PROVIDER_NAME: ProviderName = RANDOM_RESPONSE_PROVIDER;
    const MODEL_NAME: string = RANDOM_RESPONSE_MODEL;

    const stream = new ReadableStream({
      async start(controller) {
        queueIndicator({
          controller,
          status: "Coming up with an answer",
          icon: "thinking",
        });
        const systemPrompt = RESPOND_TO_RANDOM_MESSAGE_SYSTEM_PROMPT();
        const mostRecentMessages: CoreMessage[] = await convertToCoreMessages(
          stripMessagesOfCitations(chat.messages.slice(-HISTORY_CONTEXT_LENGTH))
        );

        const citations: Citation[] = [];
        queueAssistantResponse({
          controller,
          providers,
          providerName: PROVIDER_NAME,
          messages: mostRecentMessages,
          model_name: MODEL_NAME,
          systemPrompt,
          citations,
          error_message: DEFAULT_RESPONSE_MESSAGE,
          temperature: RANDOM_RESPONSE_TEMPERATURE,
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  static async respondToHostileMessage(
    chat: Chat,
    providers: AIProviders
  ): Promise<Response> {
    /**
     * Respond to the user when they send a HOSTILE message
     */
    const PROVIDER_NAME: ProviderName = HOSTILE_RESPONSE_PROVIDER;
    const MODEL_NAME: string = HOSTILE_RESPONSE_MODEL;

    const stream = new ReadableStream({
      async start(controller) {
        queueIndicator({
          controller,
          status: "Coming up with an answer",
          icon: "thinking",
        });
        const systemPrompt = RESPOND_TO_HOSTILE_MESSAGE_SYSTEM_PROMPT();
        const citations: Citation[] = [];
        queueAssistantResponse({
          controller,
          providers,
          providerName: PROVIDER_NAME,
          messages: [],
          model_name: MODEL_NAME,
          systemPrompt,
          citations,
          error_message: DEFAULT_RESPONSE_MESSAGE,
          temperature: HOSTILE_RESPONSE_TEMPERATURE,
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  static async respondToMusicRequest(chat: Chat): Promise<Response> {
    /**
     * Fetch music recommendations based on user mood
     */
    const mood = chat.messages[chat.messages.length - 1].content.toLowerCase(); // User's last message

    try {
      const response = await fetch(`https://my-ai-six-neon.vercel.app/api/music-recommendation?mood=${mood}`);
      const data = await response.json();

      if (data.error) {
        return new Response(JSON.stringify({ message: "Sorry, I couldn't find music for that mood." }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const recommendations = data.recommendations
        .map((track: any) => `${track.name} by ${track.artist} - [Listen](${track.url})`)
        .join("\n");

      return new Response(JSON.stringify({ message: `Here are some songs for your mood:\n${recommendations}` }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching music:", error);
      return new Response(JSON.stringify({ message: "Error retrieving music recommendations." }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  static async respondToQuestion(
    chat: Chat,
    providers: AIProviders,
    index: any
  ): Promise<Response> {
    /**
     * Determine the response based on user intent
     */
    if (chat.intention?.type === "music_recommendation") {
      return this.respondToMusicRequest(chat);
    }

    const PROVIDER_NAME: ProviderName = QUESTION_RESPONSE_PROVIDER;
    const MODEL_NAME: string = QUESTION_RESPONSE_MODEL;

    // Continue handling other cases as normal...
  }
}


