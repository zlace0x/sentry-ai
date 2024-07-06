import { getAddress } from 'viem'
import type { Context } from '../context.js'
import { changePromptData } from '../callback-data/change-prompt.js'
import { config } from '#root/config.js'

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
              text: ctx.t('address.add-prompt'),
              callback_data: changePromptData.pack({
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
