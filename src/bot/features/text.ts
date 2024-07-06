import { Composer } from 'grammy'
import { isAddress } from 'viem'
import { handleAddress, handlePromptChange } from '../handlers/address.js'
import { changePromptData } from '../callback-data/index.js'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.on('message:text', logHandle('handle-text'), (ctx) => {
  if (ctx.session.activeMethod === 'change-prompt') {
    return handlePromptChange(ctx)
  }
  const text = ctx.message.text

  if (isAddress(text, { strict: false })) {
    return handleAddress(ctx, text)
  }

  return ctx.reply(ctx.t('unhandled'))
})

feature.callbackQuery(
  changePromptData.filter(),
  logHandle('text-callback'),
  (ctx) => {
    const { id } = changePromptData.unpack(ctx.callbackQuery.data)

    ctx.session.activeMethod = 'change-prompt'
    ctx.session.activeParams = { id }
    return ctx.reply(ctx.t('address.change-prompt'))
  },
)

export { composer as textFeature }
