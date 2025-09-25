const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch'); // v2ならそのままrequire
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAS_URL = process.env.GAS_URL;

if (!BOT_TOKEN || !GAS_URL) {
  console.error("⚠️ BOT_TOKEN または GAS_URL が設定されていません！");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once('ready', () => {
  console.log(`✅ Bot is ready: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const payload = {
    channel_name: message.channel.name,
    message_id: message.id,
    author: message.author.username,
    content: message.content,
    timestamp: message.createdAt.toISOString()
  };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('GAS送信エラー:', err);
  }
});

client.login(BOT_TOKEN);
