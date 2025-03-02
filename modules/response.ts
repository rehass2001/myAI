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
  static async respondToQuestion(
    chat: Chat,
    providers: AIProviders,
    index: any
  ): Promise<Response> {
    /**
     * Determine the response based on user intent
     */
    if (chat.intention && chat.intention.type === "music_recommendation") {
      return this.respondToMusicRequest(chat);
    }

    const PROVIDER_NAME: ProviderName = QUESTION_RESPONSE_PROVIDER;
    const MODEL_NAME: string = QUESTION_RESPONSE_MODEL;
    
    return new Response(JSON.stringify({ message: "Processing other types of queries." }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  static async respondToMusicRequest(chat: Chat): Promise<Response> {
    /**
     * Fetch music recommendations based on user mood
     */
    const mood = chat.messages[chat.messages.length - 1].content.toLowerCase();
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
}


