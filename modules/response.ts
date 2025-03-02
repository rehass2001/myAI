import {
  Chat,
  AIProviders,
  ProviderName,
} from "@/types";
import {
  queueAssistantResponse,
  queueIndicator,
} from "@/actions/streaming";
import {
  DEFAULT_RESPONSE_MESSAGE,
} from "@/configuration/chat";
import {
  RESPOND_TO_HOSTILE_MESSAGE_SYSTEM_PROMPT,
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
        queueAssistantResponse({
          controller,
          providers,
          providerName: PROVIDER_NAME,
          messages: [],
          model_name: MODEL_NAME,
          systemPrompt,
          citations: [],
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

  static async respondToQuestion(
    chat: Chat,
    providers: AIProviders
  ): Promise<Response> {
    /**
     * Respond to the user when they send a QUESTION
     */
    const PROVIDER_NAME: ProviderName = QUESTION_RESPONSE_PROVIDER;
    const MODEL_NAME: string = QUESTION_RESPONSE_MODEL;

    const systemPrompt = RESPOND_TO_QUESTION_SYSTEM_PROMPT();
    
    return new Response(JSON.stringify({ message: "Processing question." }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  static async respondToRandomMessage(
    chat: Chat,
    providers: AIProviders
  ): Promise<Response> {
    /**
     * Respond to the user when they send a RANDOM message
     */
    const PROVIDER_NAME: ProviderName = RANDOM_RESPONSE_PROVIDER;
    const MODEL_NAME: string = RANDOM_RESPONSE_MODEL;

    const systemPrompt = RESPOND_TO_RANDOM_MESSAGE_SYSTEM_PROMPT();
    
    return new Response(JSON.stringify({ message: "Processing random message." }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}


