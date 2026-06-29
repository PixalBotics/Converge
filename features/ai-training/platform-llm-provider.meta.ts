import type { PlatformLlmProvider } from "@/api/ai-training/platform-llm.api";

export type LlmProviderCode = PlatformLlmProvider["code"];

export const LLM_PROVIDER_ORDER: LlmProviderCode[] = ["GEMINI", "OPENAI", "GROQ"];

export const LLM_PROVIDER_META: Record<
  LlmProviderCode,
  {
    name: string;
    shortName: string;
    description: string;
    docsHint: string;
    supportsBaseUrl: boolean;
    defaultBaseUrl?: string;
  }
> = {
  GEMINI: {
    name: "Google Gemini",
    shortName: "Gemini",
    description: "Generation and embeddings for balanced website AI profiles.",
    docsHint: "Google AI Studio / Gemini API key",
    supportsBaseUrl: false,
  },
  OPENAI: {
    name: "OpenAI",
    shortName: "OpenAI",
    description: "GPT models for copilot and high-quality generation profiles.",
    docsHint: "OpenAI platform API key (sk-…)",
    supportsBaseUrl: false,
  },
  GROQ: {
    name: "Groq",
    shortName: "Groq",
    description: "Fast inference via OpenAI-compatible API for low-latency chatbot.",
    docsHint: "Groq console API key",
    supportsBaseUrl: true,
    defaultBaseUrl: "https://api.groq.com/openai/v1",
  },
};
