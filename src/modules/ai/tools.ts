import { tool } from 'ai'
import { z } from 'zod'
import type { Api } from 'grammy'
import { getAddressBalances } from './ai.service.js'
import { logger } from '#root/logger.js'

export function allTools(bot: Api, telegramId: bigint | number) {
  return {
    getBalance: tool({
      description: 'Get the balance of an address',
      parameters: z.object({
        address: z.string().describe('The address to get the balance of'),
      }),
      execute: async ({ address }) => {
        return getAddressBalances(address)
      },
    }),
    notifyUser: tool({
      description: 'Notify a user',
      parameters: z.object({
        message: z.string().describe('The message to send to the user'),
      }),
      execute: async ({ message }) => {
        // Notify the user
        return bot.sendMessage(`${telegramId}`, message)
      },
    }),
    doNothing: tool({
      description: 'Do nothing',
      parameters: z.object({
        reason: z
          .string()
          .describe(
            'Reason for doing nothing. Eg. IRRELEVANT, NOT NEEDED, etc.',
          ),
      }),
      execute: async ({ reason }) => {
        logger.info(`Doing nothing because ${reason}`)
      },
    }),
  }
}
