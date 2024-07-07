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

export async function getAddressBalances(address: string, chain_id = 42161) {
  if (!config.CHAINBASE_API_KEY) {
    throw new Error('Missing CHAINBASE_API_KEY in config')
  }
  const res = await fetch(
    `https://api.chainbase.online/v1/account/tokens?chain_id=${chain_id}&address=${address}`,
    {
      method: 'GET',
      headers: { 'x-api-key': config.CHAINBASE_API_KEY },
    },
  )

  const { data } = await res.json()

  if (data) {
    return data.map(
      (token: any) =>
        `${token.symbol}, ${token.name}, Balance: ${token.balance}, value: ${
          token.current_usd_price ?? 'unknown'
        }`,
    )
  }
}
