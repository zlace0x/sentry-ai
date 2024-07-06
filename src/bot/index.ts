import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrate } from '@grammyjs/hydrate'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import type { BotConfig, StorageAdapter } from 'grammy'
import { Bot as TelegramBot, session } from 'grammy'
import type {
  Context,
  SessionData,
} from '#root/bot/context.js'
import {
  createContextConstructor,
} from '#root/bot/context.js'
import {
  addPromptFeature,
  adminFeature,
  allPromptFeature,
  languageFeature,
  textFeature,
  unhandledFeature,
  welcomeFeature,
} from '#root/bot/features/index.js'
import { errorHandler } from '#root/bot/handlers/index.js'
import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import { updateLogger } from '#root/bot/middlewares/index.js'
import { config } from '#root/config.js'
import { logger } from '#root/logger.js'
import type { PrismaClientX } from '#root/prisma/index.js'

interface Options {
  prisma: PrismaClientX
  sessionStorage?: StorageAdapter<SessionData>
  config?: Omit<BotConfig<Context>, 'ContextConstructor'>
}

export function createBot(token: string, options: Options) {
  const { sessionStorage, prisma } = options
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger, prisma }),
  })
  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isDev)
    protectedBot.use(updateLogger())

  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(
    session({
      initial: () => ({}),
      storage: sessionStorage,
    }),
  )
  protectedBot.use(i18n)

  // Handlers
  protectedBot.use(welcomeFeature)
  protectedBot.use(adminFeature)
  protectedBot.use(addPromptFeature)
  protectedBot.use(allPromptFeature)
  protectedBot.use(textFeature)

  if (isMultipleLocales)
    protectedBot.use(languageFeature)

  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
