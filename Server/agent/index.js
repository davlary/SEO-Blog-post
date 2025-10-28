// import { runMarketingPrompt } from "./agent.impl.js";

// async function main() {
//   const prompt = `You are a marketing assistant. Write a short SEO-friendly blog intro (2-3 sentences) about how small businesses can use local SEO to increase foot traffic.`;

//   try {
//     const result = await runMarketingPrompt(prompt, { max_token: "256" });

//     // The result shape depends on the underlying LLM wrapper. We try to
//     // print common properties if present, otherwise print the raw result.
//     if (result && result.messages) {
//       console.log("Agent messages: ", result.messages.map((m) => m.content).join('\n'));
//     } else if (result && result.output) {
//       console.log("Model output:", result.output);
//     } else {
//       console.log("Result:", result);
//     }
//   } catch (err) {
//     console.error("Error running marketing prompt:", err);
//   }
// }

// main();
// // index.js is a quick sample runner. Run `npm start` to execute this file.