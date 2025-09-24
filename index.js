const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();  // .env の読み込み

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

// Bot 起動時
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// メッセージ受信時
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // スレッド情報
  const threadId = message.thread?.id || null;

  // 返信元メッセージ
  const parentId = message.reference?.messageId || null;

  // ロール判定（フリキャン事務か受講生か）
  const role = message.member?.roles?.cache.some(r => r.name === 'フリキャン事務')
    ? 'フリキャン事務'
    : 'フリキャン受講生';

  // GAS に送るデータ
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
    const text = await res.text();
    console.log('GASレスポンス:', text);
  } catch (err) {
    console.error('GAS送信エラー:', err);
  }
});

client.login(BOT_TOKEN);
