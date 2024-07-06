import { getAddress } from 'viem'
import { openai } from 'modelfusion'
import type { Context } from '../context.js'

import {
  changePromptData,
  deleteAddressData,
  queryAddressData,
} from '../callback-data/index.js'
import { clearMethodData } from '../callback-data/clear-method.js'
import { config } from '#root/config.js'

import { generateCorcelText } from '#root/modules/ai/ai.service.js'

export async function handleAddress(ctx: Context, token: string) {
  const address = getAddress(token, config.CHAIN_ID)
  let addr = await ctx.prisma.address.findUnique({
    where: {
      telegramId_address: {
        address,
        telegramId: ctx.from!.id,
      },
    },
  })

  if (!addr) {
    addr = await ctx.prisma.address.create({
      data: {
        telegramId: ctx.from!.id,
        address,
      },
    })

    await ctx.reply(ctx.t('address.added'))
  }

  return ctx.reply(
    ctx.t('address.summary', {
      address: addr.address,
      prompt: addr.prompt ?? '-',
      monitoringStatus: !addr.isPaused && !!addr.prompt ? '🟢' : '🔴',
    }),
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t('address.query'),
              callback_data: queryAddressData.pack({
                id: addr.id,
              }),
            },
            {
              text: ctx.t('address.add-prompt'),
              callback_data: changePromptData.pack({
                id: addr.id,
              }),
            },
            {
              text: ctx.t('address.remove'),
              callback_data: deleteAddressData.pack({
                id: addr.id,
              }),
            },
          ],
        ],
      },
    },
  )
}

export async function handlePromptChange(ctx: Context) {
  const addressId = ctx.session.activeParams?.id as number | undefined
  const prompt = ctx.message?.text

  if (!addressId || !prompt) {
    return ctx.reply(ctx.t('address.error'))
  }

  await ctx.prisma.address.update({
    where: { id: addressId },
    data: { prompt },
  })

  ctx.session.activeMethod = undefined
  ctx.session.activeParams = undefined

  return ctx.reply(ctx.t('address.changed-prompt'))
}

export async function handleQueryAddress(ctx: Context) {
  const addressId = ctx.session.activeParams?.id as number | undefined
  const address = await ctx.prisma.address.findUnique({
    where: { id: addressId },
  })

  if (!address) {
    return ctx.reply(ctx.t('address.error'), {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: ctx.t('address.query-stop'),
              callback_data: clearMethodData.pack({}),
            },
          ],
        ],
      },
    })
  }

  const message = await ctx.reply(ctx.t('address.querying'))

  const response = await generateCorcelText([
    openai.ChatMessage.system(
      `As a blockchain assistent monitoring the address ${address.address} you observed the following:`,
    ),
    openai.ChatMessage.user(
      `Given the address ${address.address} on the blockchain.`,
    ),
    openai.ChatMessage.user(
      `${ctx.message?.text ?? address.prompt ?? 'Show a summary'}`,
    ),
  ])

  if (response)
    return message.editText(response)
}
