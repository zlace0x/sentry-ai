import type { OpenAIChatMessage } from 'modelfusion'
import { config } from '#root/config.js'

export async function generateCorcelText(prompts: OpenAIChatMessage[]) {
  const url = 'https://api.corcel.io/v1/text/cortext/chat'
  const options = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': `Bearer ${config.CORCEL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.1,
      max_tokens: 500,
      messages: prompts,
      stream: false,
    }),
  }

  try {
    const data = await fetch(url, options)
    const response = await data.json()

    return response[0].choices[0].delta.content
  }
  catch (e) {
    console.error(e)
  }
}
