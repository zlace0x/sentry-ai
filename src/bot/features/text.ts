import { Composer } from 'grammy'
import { isAddress } from 'viem'
import {
  handleAddress,
  handlePromptChange,
  handleQueryAddress,
} from '../handlers/address.js'
import {
  changePromptData,
  deleteAddressData,
  queryAddressData,
} from '../callback-data/index.js'
import { clearMethodData } from '../callback-data/clear-method.js'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.on('message:text', logHandle('handle-text'), (ctx) => {
  if (ctx.session.activeMethod === 'change-prompt') {
    return handlePromptChange(ctx)
  }

  if (ctx.session.activeMethod === 'query-address') {
    return handleQueryAddress(ctx)
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
feature.callbackQuery(
  deleteAddressData.filter(),
  logHandle('delete-callback'),
  async (ctx) => {
    const { id } = deleteAddressData.unpack(ctx.callbackQuery.data)

    await ctx.prisma.address.delete({
      where: { id },
    })

    return ctx.reply(ctx.t('address.deleted'))
  },
)

feature.callbackQuery(
  queryAddressData.filter(),
  logHandle('query-callback'),
  (ctx) => {
    const { id } = queryAddressData.unpack(ctx.callbackQuery.data)

    ctx.session.activeMethod = 'query-address'
    ctx.session.activeParams = { id }
    return ctx.reply(ctx.t('address.query-address-prompt'))
  },
)

feature.callbackQuery(
  clearMethodData.filter(),
  logHandle('clear-callback'),
  (ctx) => {
    ctx.session.activeMethod = undefined
    ctx.session.activeParams = undefined

    return ctx.answerCallbackQuery()
  },
)
export { composer as textFeature }
