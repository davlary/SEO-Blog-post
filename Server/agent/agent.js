import {createReactAgent} from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from 'zod';
import { MemorySaver } from "@langchain/langgraph";

import {tool} from "@langchain/core/tools"

const weatherTool = tool(async ({query}) => {
    console.log('query', query);

    //TODO: implement the weather tool by fetching an API

    return 'The weather in Nigeria is sunny';
},{
    name: 'weather',
    description: 'Get the weather in a given location',
    schema: z.object({
        query: z.string().describe('The query to use in search'),
    }),
});

const model = new ChatAnthropic({
    model: "claude-3.5-sonnet-latest",
});

const checkpointSaver = new MemorySaver();

export const agent =  createReactAgent({
    llm: model,
    tools: [weatherTool],
    checkpointSaver,
})

// const result = await agent.invoke({
//     max_token: "1000",
//     messages:[{
//         role: "user",
//         content: "What is the weather in Nigeria"
//     }]
// },{
//     configurable: {thread_id: 42},
// });

// const followup = await agent.invoke({
//     max_token: "1000",
//     messages:[{
//         role: "user",
//         content: "What was it for?"
//     }]
// },{
//     configurable: {thread_id: 42},
// });


// console.log(result.messages.at(-1)?.content);
// console.info('followup: ', followup.messages.at(-1)?.content);
