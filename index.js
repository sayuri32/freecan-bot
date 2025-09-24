const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAS_URL = process.env.GAS_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// 起動時
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// メッセージ受信時
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const threadId = message.thread?.id || null;
  const parentId = message.reference?.messageId || null;

  const role = message.member?.roles?.cache.some(r => r.name === 'フリキャン事務')
    ? 'フリキャン事務'
    : 'フリキャン受講生';

  const payload = {
    channel_name: message.channel.name,
    channel_id: message.channel.id,
    thread_id: threadId,
    parent_id: parentId,
    message_id: message.id,
    author: message.author.username,
    role: role,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
  };

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('GASレスポンス:', await res.text());
  } catch (err) {
    console.error('GAS送信エラー:', err);
  }
});

// Express Pingサーバー追加（スリープ回避用）
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(PORT, () => console.log(`Ping server running on port ${PORT}`));

client.login(BOT_TOKEN);
