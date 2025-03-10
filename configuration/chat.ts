import { OWNER_NAME, AI_NAME } from "./identity";

export const INITIAL_MESSAGE: string = `🥑 Hey, I’m ChefMate, ${AI_NAME}, ${OWNER_NAME}'s AI kitchen recipe developer! Got a fridge full of ‘nothing to eat’? Challenge accepted. Toss me some ingredients, and I’ll turn them into magic. Let’s get cooking! 👨‍🍳✨`;
export const DEFAULT_RESPONSE_MESSAGE: string = `Uh-oh! My kitchen timer just ran out. ⏳ Please try again later.`;
export const WORD_CUTOFF: number = 8000; // Number of words until bot says it needs a break
export const WORD_BREAK_MESSAGE: string = `Hold up, ChefMate needs a break! Even robots need to stir the pot once in a while.`;
export const HISTORY_CONTEXT_LENGTH: number = 7; // Number of messages to use for context when generating a response
