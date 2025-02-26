import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('add', logHandle('command-add'), (ctx) => {
  return ctx.reply(ctx.t('command.add-prompt'))
})

export { composer as addPromptFeature }
