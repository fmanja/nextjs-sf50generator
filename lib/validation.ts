import { z } from "zod";

/**
 * Validation schemas for API inputs
 * These schemas ensure type safety, prevent injection attacks, and limit input sizes
 */

// Maximum lengths to prevent DoS attacks
const MAX_SCENARIO_LENGTH = 5000; // characters
const MAX_CHAT_MESSAGE_LENGTH = 2000; // characters
const MAX_CONVERSATION_HISTORY_LENGTH = 50; // messages

/**
 * Schema for chat message validation
 */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(MAX_CHAT_MESSAGE_LENGTH, `Content cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters`)
    .trim(),
});

/**
 * Schema for initial recommendation request
 */
export const recommendNOASchema = z.object({
  scenario: z
    .string()
    .min(1, "Scenario is required")
    .max(MAX_SCENARIO_LENGTH, `Scenario cannot exceed ${MAX_SCENARIO_LENGTH} characters`)
    .trim(),
});

/**
 * Schema for conversational update request
 */
export const chatNOASchema = z.object({
  originalScenario: z
    .string()
    .min(1, "Original scenario is required")
    .max(MAX_SCENARIO_LENGTH, `Original scenario cannot exceed ${MAX_SCENARIO_LENGTH} characters`)
    .trim(),
  conversationHistory: z
    .array(chatMessageSchema)
    .min(1, "Conversation history must contain at least one message")
    .max(MAX_CONVERSATION_HISTORY_LENGTH, `Conversation history cannot exceed ${MAX_CONVERSATION_HISTORY_LENGTH} messages`),
});

/**
 * Type exports for use in API routes
 */
export type RecommendNOAInput = z.infer<typeof recommendNOASchema>;
export type ChatNOAInput = z.infer<typeof chatNOASchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

