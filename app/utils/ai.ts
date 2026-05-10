import { openai, createOpenAI } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

/**
 * Returns the appropriate AI model provider based on environment variables.
 * Supports OpenAI (default), OpenRouter, Ollama, Anthropic, and custom OpenAI-compatible endpoints.
 */
export function getModel(modelName?: string) {
  const provider = process.env.AI_PROVIDER || "openai";
  const defaultModel = modelName || process.env.OPENAI_MODEL || "gpt-4o";

  console.log(`🤖 AI Provider: ${provider}, Model: ${defaultModel}`);

  // 1. OpenAI (Official)
  if (provider === "openai") {
    return openai(defaultModel);
  }

  // 2. Anthropic (Official)
  if (provider === "anthropic") {
    return anthropic(defaultModel);
  }

  // 3. OpenRouter (OpenAI-compatible)
  if (provider === "openrouter") {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
    });
    return openrouter(defaultModel);
  }

  // 4. Ollama (Local OpenAI-compatible)
  if (provider === "ollama") {
    const ollama = createOpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      apiKey: process.env.OLLAMA_API_KEY || "ollama", // Usually not required for local
    });
    return ollama(defaultModel);
  }

  // 5. Custom OpenAI-compatible endpoint
  if (provider === "custom") {
    if (!process.env.AI_BASE_URL) {
      console.warn("AI_PROVIDER is set to 'custom' but AI_BASE_URL is missing. Falling back to OpenAI.");
      return openai(defaultModel);
    }
    const custom = createOpenAI({
      baseURL: process.env.AI_BASE_URL,
      apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
    });
    return custom(defaultModel);
  }

  // Fallback to OpenAI
  return openai(defaultModel);
}
