import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), async (ctx) => {
  await ctx.prisma.user.upsert({
    where: { telegramId: ctx.from.id },
    create: {
      telegramId: ctx.from.id,
      username: ctx.from.username,
    },
    update: {
      username: ctx.from.username,
      updatedAt: new Date(),
    },
  })

  return ctx.reply(ctx.t('welcome'))
})

export { composer as welcomeFeature }
