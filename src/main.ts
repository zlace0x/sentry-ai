#!/usr/bin/env tsx

import process from 'node:process'
import { prisma } from './prisma/index.js'
import { createBot } from '#root/bot/index.js'
import { config } from '#root/config.js'
import { logger } from '#root/logger.js'
import { createServer, createServerManager } from '#root/server/index.js'

function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false
  const handleShutdown = async () => {
    if (isShuttingDown)
      return
    isShuttingDown = true
    logger.info('Shutdown')
    await cleanUp()
  }
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}

async function startPolling() {
  logger.info('Starting bot (polling)...')
  const bot = createBot(config.BOT_TOKEN, {
    prisma,
  })

  const server = createServer(bot)
  const serverManager = createServerManager(server)

  // start server
  const info = await serverManager.start(
    config.BOT_SERVER_HOST,
    config.BOT_SERVER_PORT,
  )

  logger.info({
    msg: 'Server started',
    url: info.url,
  })

  // graceful shutdown
  onShutdown(async () => {
    await bot.stop()
    await serverManager.stop()
  })

  // connect to database
  await prisma.$connect()

  // start bot
  await bot.start({
    allowed_updates: config.BOT_ALLOWED_UPDATES,
    onStart: ({ username }) =>
      logger.info({
        msg: 'Bot running...',
        username,
      }),
  })
}

async function startWebhook() {
  logger.info('Starting bot (webhook)...')

  const bot = createBot(config.BOT_TOKEN, {
    prisma,
  })

  const server = createServer(bot)
  const serverManager = createServerManager(server)

  // graceful shutdown
  onShutdown(async () => {
    await serverManager.stop()
  })

  // connect to database
  await prisma.$connect()

  // to prevent receiving updates before the bot is ready
  await bot.init()

  // start server
  const info = await serverManager.start(
    config.BOT_SERVER_HOST,
    config.BOT_SERVER_PORT,
  )

  logger.info({
    msg: 'Server started',
    url: info.url,
  })

  // set webhook
  await bot.api.setWebhook(config.BOT_WEBHOOK, {
    allowed_updates: config.BOT_ALLOWED_UPDATES,
    secret_token: config.BOT_WEBHOOK_SECRET,
  })

  logger.info({
    msg: 'Webhook was set',
    url: config.BOT_WEBHOOK,
  })
}

try {
  if (config.BOT_MODE === 'webhook')
    await startWebhook()
  else if (config.BOT_MODE === 'polling')
    await startPolling()
}
catch (error) {
  logger.error(error)
  process.exit(1)
}
