import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { webhookCallback } from 'grammy'
import { getPath } from 'hono/utils/url'
import { requestId } from './middlewares/request-id.js'
import { logger } from './middlewares/logger.js'
import type { Env } from './environment.js'
import { decodeTxReceipt } from './ai-trigger/chain-events.js'
import type { Bot } from '#root/bot/index.js'
import { config } from '#root/config.js'
import { requestLogger } from '#root/server/middlewares/request-logger.js'
import { runToolsAgainstEvent } from '#root/modules/ai/ai.controller.js'

export function createServer(bot: Bot) {
  const server = new Hono<Env>()

  server.use(requestId())
  server.use(logger())

  if (config.isDev)
    server.use(requestLogger())

  server.onError(async (error, c) => {
    if (error instanceof HTTPException) {
      if (error.status < 500)
        c.var.logger.info(error)
      else c.var.logger.error(error)

      return error.getResponse()
    }

    // unexpected error
    c.var.logger.error({
      err: error,
      method: c.req.raw.method,
      path: getPath(c.req.raw),
    })
    return c.json(
      {
        error: 'Oops! Something went wrong.',
      },
      500,
    )
  })

  server.get('/', c => c.json({ status: true }))

  server.post(
    '/webhook',
    webhookCallback(bot, 'hono', {
      secretToken: config.BOT_WEBHOOK_SECRET,
    }),
  )

  server.post('/chain-event', async (c) => {
    const body = await c.req.json()
    c.var.logger.info({ event: body })

    const data = decodeTxReceipt(body)
    const text = await runToolsAgainstEvent(bot, data.address, data.event)

    return c.json({ status: true, text })
  })

  server.post('/event', async (c) => {
    const { body } = c.req.raw
    c.var.logger.info({ event: body })
    return c.json({ status: true })
  })

  return server
}

export type Server = Awaited<ReturnType<typeof createServer>>

export function createServerManager(server: Server) {
  let handle: undefined | ReturnType<typeof Bun.serve>
  return {
    start: (host: string, port: number) => {
      handle = Bun.serve({
        fetch: server.fetch,
        hostname: host,
        port,
      })
      return {
        url: handle.url,
      }
    },
    stop: () => handle?.stop(),
  }
}
