# counting

A Discord counting game bot. Users count up in sequence in a channel, but cannot count twice in a row. If someone counts out of order or repeats, the count resets. Every 10th number triggers a celebration message. The game state is saved per channel in a database.

---

## Features

- **Simple counting game**: Users type the next number in sequence in a Discord channel.
- **Prevents double-counting**: No user can count twice in a row.
- **Automatic reset**: Wrong numbers or double-counting reset the count to 0.
- **Celebration messages**: Every 10th number triggers a special message.
- **Persistent state**: Game state is saved in a database per channel.
- **Localization**: All messages are defined in `src/locales/en-US.json` (add more locales as needed).

---

## Setup Instructions

### 1. Create a Discord Application and Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click "New Application".
2. Name your application and save.
3. Go to the "Bot" tab and click "Add Bot".
4. **Copy the Application (Client) ID and Token**—you'll need these for your `.env` file.
5. Under "Privileged Gateway Intents", enable **Message Content Intent** (required for reading message content).
6. Under "OAuth2 > URL Generator", select:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Message History`
   - Copy the generated URL and use it to invite the bot to your server.

### 2. Clone the repository

```sh
# Replace <your-username> and <your-repo> with your GitHub info
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 3. Install dependencies

```sh
npm install
```

### 4. Set up the database

This bot uses a MySQL/MariaDB database to store the counting state. Import the provided schema:

```sh
# Replace with your DB credentials and database name
mysql -u <db_user> -p <db_name> < schema.sql
```

This creates the `counting_state` table required for the bot to function.

### 5. Configure environment variables

Copy `.env.example` to `.env` if it exists, or create a `.env` file. Set your Discord bot token, client ID, and database credentials:

```env
DISCORD_TOKEN=your-app-token
DISCORD_CLIENT_ID=your-client-id
LOG_LEVEL=info
DB_HOST=localhost
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
```

### 6. Run the bot

```sh
node counting.mjs
```

---

## How the Counting Game Works

- Type the next number in sequence in the channel.
- You cannot count twice in a row—wait for someone else!
- If you enter the wrong number or count twice, the count resets to 0.
- Every 10th number, a celebration message appears.
- The game state is saved, so you can continue anytime.

All game logic is handled in [`src/events/messageCreate.mjs`](src/events/messageCreate.mjs).

All user-facing messages are defined in [`src/locales/en-US.json`](src/locales/en-US.json). You can add more languages by creating additional files in `src/locales/`.

---

## Folder Structure

```text
src/
  events/      # Event handlers (main logic: messageCreate.mjs)
  locales/     # Locale JSON files (main: en-US.json)
  ...          # Other core logic files
schema.sql     # Database schema
.env           # Environment variables (not committed)
```

---

## License

MIT
