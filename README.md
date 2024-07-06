<h1 align="center">🤖 Sentry AI</h1>

AI wallet monitor, get notified based on wallet activity and positions.
For each wallet you monitor set a prompt on what you wish to be notified on.

Usecases:
- Monitor DAO's Multi-Sig
- Watch your uniswap V3 LP positions
- Monitor whales movements

## Architecture

This project is built using the following technologies

1. Chainbase - Profiles initial wallet address

2.

## Development

 **Launching the Bot**

  You can run your bot in both development and production modes.

  **Setup**
  ```bash
  cp .env.examples .env
  ```

  **Development Mode:**

    Install the required dependencies:
    ```bash
    bun install
    ```
    Run migrations:
    ```bash
    npx prisma migrate dev
    ```
    Start the bot in watch mode (auto-reload when code changes):
    ```bash
    bun dev
    ```

  **Production Mode:**

  Install only production dependencies (no development dependencies):
  ```bash
  bun install --only=prod
  ```

    Set `NODE_ENV` environment variable to `production` in your `.env` file. <br />
    Update `BOT_WEBHOOK` with the actual URL where your bot will receive updates. <br />
    Update `BOT_WEBHOOK_SECRET` with a random secret token. <br />
    Update `DATABASE_URL` with a production database.

    ```dotenv
    NODE_ENV=production
    BOT_WEBHOOK=<server_url>/webhook
    BOT_WEBHOOK_SECRET=<random_secret_value>
    DATABASE_URL=<production_db_url>
    ```

    Run migrations:
    ```bash
    npx prisma migrate deploy
    ```

    Start the bot in production mode:
    ```bash
    bun start # with type checking (requires development dependencies)
    # or
    bun start:force # skip type checking and start
    ```

### List of Available Commands

- `bun lint` — Lint source code.
- `bun format` — Format source code.
- `bun typecheck` — Run type checking.
- `bun dev` — Start the bot in development mode.
- `bun start` — Start the bot.
- `bun start:force` — Starts the bot without type checking.

### Directory Structure

```
project-root/
  ├── locales # Localization files
  └── src
      ├── bot # Contains the code related to the bot
      │   ├── callback-data # Callback data builders
      │   ├── features      # Implementations of bot features
      │   ├── filters       # Update filters
      │   ├── handlers      # Update handlers
      │   ├── helpers       # Utility functions
      │   ├── keyboards     # Keyboard builders
      │   ├── middlewares   # Middleware functions
      │   ├── i18n.ts       # Internationalization setup
      │   ├── context.ts    # Context object definition
      │   └── index.ts      # Bot entry point
      ├── server # Contains the code related to the web server
      │   └── index.ts # Web server entry point
      ├── config.ts # Application config
      ├── logger.ts # Logging setup
      └── main.ts   # Application entry point
```

## Environment Variables

<table>
<thead>
  <tr>
    <th>Variable</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>NODE_ENV</td>
    <td>String</td>
    <td>Specifies the application environment. (<code>development</code> or <code>production</code>)</td>
  </tr>
  <tr>
    <td>BOT_TOKEN</td>
    <td>
        String
    </td>
    <td>
        Telegram Bot API token obtained from <a href="https://t.me/BotFather">@BotFather</a>.
    </td>
  </tr>
  <tr>
    <td>DATABASE_URL</td>
    <td>
        String
    </td>
    <td>
        Database connection.
    </td>
  </tr>
    <tr>
    <td>LOG_LEVEL</td>
    <td>
        String
    </td>
    <td>
        <i>Optional.</i>
        Specifies the application log level. <br/>
        For example, use <code>info</code> for general logging. View the <a href="https://github.com/pinojs/pino/blob/master/docs/api.md#level-string">Pino documentation</a> for more log level options. <br/>
        Defaults to <code>info</code>.
    </td>
  </tr>
  <tr>
    <td>BOT_MODE</td>
    <td>
        String
    </td>
    <td>
        <i>Optional.</i>
        Specifies method to receive incoming updates (<code>polling</code> or <code>webhook</code>).<br/>
        Default depends on <code>NODE_ENV</code> (<code>polling</code> for <code>development</code>, <code>webhook</code> for <code>production</code>).
    </td>
  </tr>
  <tr>
    <td>BOT_WEBHOOK</td>
    <td>
        String
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i>
        Webhook endpoint URL, used to configure webhook.
    </td>
  </tr>
  <tr>
    <td>BOT_WEBHOOK_SECRET</td>
    <td>
        String
    </td>
    <td>
        <i>Optional in <code>polling</code> mode.</i>
        A secret token that is used to ensure that a request is sent from Telegram, used to configure webhook.
    </td>
  </tr>
  <tr>
    <td>BOT_SERVER_HOST</td>
    <td>
        String
    </td>
    <td>
        <i>Optional.</i> Specifies the server hostname. <br/>
        Defaults to <code>0.0.0.0</code>.
    </td>
  </tr>
  <tr>
    <td>BOT_SERVER_PORT</td>
    <td>
        Number
    </td>
    <td>
        <i>Optional.</i> Specifies the server port. <br/>
        Defaults to <code>80</code>.
    </td>
  </tr>
  <tr>
    <td>BOT_ALLOWED_UPDATES</td>
    <td>
        Array of String
    </td>
    <td>
        <i>Optional.</i> A JSON-serialized list of the update types you want your bot to receive. See <a href="https://core.telegram.org/bots/api#update">Update</a> for a complete list of available update types. <br/>
        Defaults to an empty array (all update types except <code>chat_member</code>, <code>message_reaction</code> and <code>message_reaction_count</code>).
    </td>
  </tr>
  <tr>
    <td>BOT_ADMINS</td>
    <td>
        Array of Number
    </td>
    <td>
        <i>Optional.</i>
        Administrator user IDs.
        Use this to specify user IDs that have special privileges, such as executing <code>/setcommands</code>. <br/>
        Defaults to an empty array.
    </td>
  </tr>
</tbody>
</table>
