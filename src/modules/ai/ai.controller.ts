import { mistral } from '@ai-sdk/mistral'
import type { Api } from 'grammy'
import { convertToCoreMessages, generateText } from 'ai'
import { allTools } from './tools.js'
import { prisma } from '#root/prisma/index.js'
import type { Bot } from '#root/bot/index.js'

export async function runToolsAgainstQuery(
  bot: Api,
  address: string,
  query: any,
  telegramId: bigint | number,
) {
  const prompts = convertToCoreMessages([
    {
      role: 'assistant',
      content: `As a blockchain assistent monitoring the address ${address} you observed the following:`,
    },

    {
      role: 'user',
      content: `Given the address ${address} on the blockchain.`,
    },
    {
      role: 'user',
      content: query,
    },
  ])
  const toolsRun = await generateText({
    model: mistral('mistral-large-latest'),
    tools: allTools(bot, telegramId),
    maxToolRoundtrips: 5, // allow up to 5 tool roundtrips
    messages: prompts,
  })

  console.log('toolRun', JSON.stringify(toolsRun))
  return toolsRun.text
}

export async function runToolsAgainstEvent(
  bot: Bot,
  address: string,
  event: string,
) {
  console.log('event', event)
  console.log('address', address)
  const addr = await prisma.address.findMany({})

  console.log('matched', addr.length)

  for (const a of addr) {
    console.log('matching address', a.address)
    const prompts = convertToCoreMessages([
      {
        role: 'assistant',
        content: `As a blockchain assistent monitoring the address you observed the following:`,
      },

      {
        role: 'user',
        content: `Given the address ${address} on the blockchain.`,
      },
      {
        role: 'user',
        content: `Event occurred: ${event}`,
      },
      {
        role: 'user',
        content: `Notify condition: ${a.prompt}`,
      },
    ])

    const toolsRun = await generateText({
      model: mistral('mistral-large-latest'),
      tools: allTools(bot.api, a.telegramId),
      maxToolRoundtrips: 5, // allow up to 5 tool roundtrips

      messages: prompts,
    })

    console.log('toolRun', JSON.stringify(toolsRun))
    if (toolsRun.text) {
      await allTools(bot.api, a.telegramId).notifyUser.execute({
        message: toolsRun.text,
      })
      return toolsRun.text
    }
  }
}
