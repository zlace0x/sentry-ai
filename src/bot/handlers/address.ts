import { getAddress } from 'viem'
import type { Context } from '../context.js'
import { config } from '#root/config.js'

export async function handleAddress(ctx: Context) {
  const text = ctx.message?.text
  if (!text) {
    return ctx.reply(ctx.t('address.invalid'))
  }

  const address = getAddress(text, config.CHAIN_ID)
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

  return ctx.reply(ctx.t('address.summary', {
    address: addr.address,
    monitoringStatus: !addr.isPaused ? '🟢' : '🔴',
  }), {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: ctx.t('address.query'),
            callback_data: `query-${addr.id}`,
          },
        ],
      ],
    },
  })
}
