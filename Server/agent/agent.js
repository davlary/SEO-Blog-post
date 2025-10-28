// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { MemorySaver } from "@langchain/langgraph";
// import { z } from "zod";
// import { tool } from "@langchain/core/tools";
// import { Ollama } from "@langchain/ollama";

// // Small, safe tools the agent can call. Keep these minimal and self-contained so
// // the agent works out-of-the-box for marketing tasks.
// const weatherTool = tool(
//   async ({ query }) => {
//     console.log("[weatherTool] query:", query);
//     // TODO: replace with a real weather API if needed.
//     return `Weather for ${query}: sunny (placeholder)`;
//   },
//   {
//     name: "weather",
//     description: "Get the weather in a given location",
//     schema: z.object({ query: z.string().describe("The query to use in search") }),
//   }
// );

// const jsExecutor = tool(
//   async ({ code }) => {
//     // Intentionally not executing arbitrary code for safety. Return the code back
//     // so caller can review or run it locally.
//     console.log("[jsExecutor] code (not executed for safety):\n", code);
//     return { stdout: "(execution disabled)", stderr: null, code };
//   },
//   {
//     name: "run_javascript_code_tool",
//     description: `Run JavaScript code (runner disabled in repository). Returns the code and placeholder output.`,
//     schema: z.object({ code: z.string().describe("The code to run") }),
//   }
// );

// // Create an Ollama-backed model instance. The exact model name may vary on your
// // machine (qwen3, qwen-3, etc.) — change it to a model you have locally.
// const model = new Ollama({ model: "qwen3" });

// // Checkpoint saver for agent state (in-memory). Swap for persistent storage if needed.
// const checkpointSaver = new MemorySaver();

// // Factory that creates a React-style agent configured for marketing tasks.
// export function createMarketingAgent(opts = {}) {
//   const agent = createReactAgent({
//     llm: model,
//     tools: [weatherTool, jsExecutor],
//     checkpointSaver,
//     ...opts,
//   });

//   return agent;
// }

// // Helper: run a short marketing prompt and return the model/agent output.
// // This function tries to use the `agent.invoke` API when available and falls
// // back to `model.invoke` if the agent doesn't expose invoke.
// export async function runMarketingPrompt(prompt, options = {}) {
//   const agent = options.agent ?? createMarketingAgent();

//   if (agent && typeof agent.invoke === "function") {
//     const result = await agent.invoke({
//       max_token: options.max_token ?? "512",
//       messages: [{ role: "user", content: prompt }],
//     });
//     return result;
//   }

//   if (model && typeof model.invoke === "function") {
//     // some Ollama wrappers expose .invoke
//     return await model.invoke(prompt);
//   }

//   // As a last resort, try calling model.call or model.generate if available.
//   if (model && typeof model.call === "function") {
//     return await model.call(prompt);
//   }

//   throw new Error("No callable LLM found (model.invoke / model.call / agent.invoke)");
// }

// // A named export of the underlying Ollama model for advanced use.
// export { model };

// // Create and export a default agent instance for convenience (used by server).
// export const agent = createMarketingAgent();
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { MemorySaver } from "@langchain/langgraph";
// import { z } from "zod";
// import { tool } from "@langchain/core/tools";
// import { Ollama } from "@langchain/ollama";

// // Small, safe tools the agent can call. Keep these minimal and self-contained so
// // the agent works out-of-the-box for marketing tasks.
// const weatherTool = tool(
//   async ({ query }) => {
//     console.log("[weatherTool] query:", query);
//     // TODO: replace with a real weather API if needed.
//     return `Weather for ${query}: sunny (placeholder)`;
//   },
//   {
//     name: "weather",
//     description: "Get the weather in a given location",
//     schema: z.object({ query: z.string().describe("The query to use in search") }),
//   }
// );

// const jsExecutor = tool(
//   async ({ code }) => {
//     // Intentionally not executing arbitrary code for safety. Return the code back
//     // so caller can review or run it locally.
//     console.log("[jsExecutor] code (not executed for safety):\n", code);
//     return { stdout: "(execution disabled)", stderr: null, code };
//   },
//   {
//     name: "run_javascript_code_tool",
//     description: `Run JavaScript code (runner disabled in repository). Returns the code and placeholder output.`,
//     schema: z.object({ code: z.string().describe("The code to run") }),
//   }
// );

// // Create an Ollama-backed model instance. The exact model name may vary on your
// // machine (qwen3, qwen-3, etc.) — change it to a model you have locally.
// const model = new Ollama({ model: "qwen3" });

// // Checkpoint saver for agent state (in-memory). Swap for persistent storage if needed.
// const checkpointSaver = new MemorySaver();

// // Factory that creates a React-style agent configured for marketing tasks.
// export function createMarketingAgent(opts = {}) {
//   const agent = createReactAgent({
//     llm: model,
//     tools: [weatherTool, jsExecutor],
//     checkpointSaver,
//     ...opts,
//   });

//   return agent;
// }

// // Helper: run a short marketing prompt and return the model/agent output.
// // This function tries to use the `agent.invoke` API when available and falls
// // back to `model.invoke` if the agent doesn't expose invoke.
// export async function runMarketingPrompt(prompt, options = {}) {
//   const agent = options.agent ?? createMarketingAgent();

//   if (agent && typeof agent.invoke === "function") {
//     const result = await agent.invoke({
//       max_token: options.max_token ?? "512",
//       messages: [{ role: "user", content: prompt }],
//     });
//     return result;
//   }

//   if (model && typeof model.invoke === "function") {
//     // some Ollama wrappers expose .invoke
//     return await model.invoke(prompt);
//   }

//   // As a last resort, try calling model.call or model.generate if available.
//   if (model && typeof model.call === "function") {
//     return await model.call(prompt);
//   }

//   throw new Error("No callable LLM found (model.invoke / model.call / agent.invoke)");
// }

// // A named export of the underlying Ollama model for advanced use.
// export { model };

// // Create and export a default agent instance for convenience (used by server).
// export const agent = createMarketingAgent();
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { MemorySaver } from "@langchain/langgraph";
// import { z } from "zod";
// import { tool } from "@langchain/core/tools";
// import { Ollama } from "@langchain/ollama";

// // Small, safe tools the agent can call. Keep these minimal and self-contained so
// // the agent works out-of-the-box for marketing tasks.
// const weatherTool = tool(
//   async ({ query }) => {
//     console.log("[weatherTool] query:", query);
//     // TODO: replace with a real weather API if needed.
//     return `Weather for ${query}: sunny (placeholder)`;
//   },
//   {
//     name: "weather",
//     description: "Get the weather in a given location",
//     schema: z.object({ query: z.string().describe("The query to use in search") }),
//   }
// );

// const jsExecutor = tool(
//   async ({ code }) => {
//     // Intentionally not executing arbitrary code for safety. Return the code back
//     export { model };

// const model = new Ollama({ model: "quen3" });
// const res = await model.invoke("Hello, Ollama!");
// console.log(res);



// async function main() {
//   const stream = await ollama.chat({
//     model: 'qwen3',
//     messages: [{ role: 'user', content: 'What is 17 × 23?' }],
//     stream: true,
//      think: true,
//   })

//   let inThinking = false
//   let content = ''
//   let thinking = ''

//   for await (const chunk of stream) {
//     if (chunk.message.thinking) {
//       if (!inThinking) {
//         inThinking = true
//         process.stdout.write('Thinking:\n')
//       }
//       process.stdout.write(chunk.message.thinking)
//       // accumulate the partial thinking
//       thinking += chunk.message.thinking
//     } else if (chunk.message.content) {
//       if (inThinking) {
//         inThinking = false
//         process.stdout.write('\n\nAnswer:\n')
//       }
//       process.stdout.write(chunk.message.content)
//       // accumulate the partial content
//       content += chunk.message.content
//     }
//   }

//   // append the accumulated fields to the messages for the next request
//   new_messages = [{ role: 'assistant', thinking: thinking, content: content }]
// }

// main().catch(console.error)
// // const model = new ChatAnthropic({
// //     model: "claude-3.5-sonnet-latest",
// // });



// const checkpointSaver = new MemorySaver();

// export const agent =  createReactAgent({
//     llm: model,
//     tools: [weatherTool, jsExecutor],
//     checkpointSaver,
// })

// // const result = await agent.invoke({
// //     max_token: "1000",
// //     messages:[{
// //         role: "user",
// //         content: "What is the weather in Nigeria"
// //     }]
// // },{
// //     configurable: {thread_id: 42},
// // });

// // const followup = await agent.invoke({
// //     max_token: "1000",
// //     messages:[{
// //         role: "user",
// //         content: "What was it for?"
// //     }]
// // },{
// //     configurable: {thread_id: 42},
// // });


// // console.log(result.messages.at(-1)?.content);
// // console.info('followup: ', followup.messages.at(-1)?.content);
