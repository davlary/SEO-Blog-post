import { Ollama } from "@langchain/ollama";

// Lightweight wrapper around the Ollama model. We avoid creating a LangGraph
// ReactAgent here because the project's installed LangGraph LLM wrapper may not
// implement bindTools required by createReactAgent. This keeps behavior
// predictable: runMarketingPrompt calls the Ollama model directly.

// Adjust the `model` name to match a model installed in your local Ollama
// installation (for example: qwen3, qwen-3).
export const model = new Ollama({ model: "qwen3" });

export async function runMarketingPrompt(prompt, options = {}) {
  // If the Ollama wrapper exposes `invoke`, use it.
  if (model && typeof model.invoke === "function") {
    return await model.invoke(prompt);
  }

  // Fallback to `call` if available.
  if (model && typeof model.call === "function") {
    return await model.call(prompt);
  }

  throw new Error("No callable method found on the Ollama model (invoke/call)");
}

// For compatibility with code that expects `agent`, export a small helper
export const agent = {
  invoke: async (opts = {}) => {
    // Accept both { messages: [{role, content}] } and a raw prompt string
    if (typeof opts === "string") return await runMarketingPrompt(opts);
    if (opts.messages && Array.isArray(opts.messages)) {
      const last = opts.messages.at(-1);
      return await runMarketingPrompt(last?.content ?? "");
    }
    return await runMarketingPrompt(opts.prompt ?? "");
  },
};
