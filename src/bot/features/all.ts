import { Composer } from 'grammy'
import { handleAddress } from '../handlers/address.js'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('all', logHandle('command-all'), async (ctx) => {
  const addresses = await ctx.prisma.address.findMany({
    where: {
      telegramId: ctx.from.id,
    },
  })

  if (addresses.length === 0) {
    return ctx.reply(ctx.t('all.no-addresses'))
  }

  for (const address of addresses) {
    await handleAddress(ctx, address.address)
  }
})

export { composer as allPromptFeature }
