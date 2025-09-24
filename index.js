// Discord.js と fetch のみ使用
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const GAS_URL   = process.env.GAS_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot 起動時
client.once('ready', () => {
  console.log(`Bot is ready: ${client.user.tag}`);
});

// メッセージ受信時
client.on('messageCreate', async message => {
  if (message.author.bot) return; // 自分や他Botの反応を防止

  // 軽量化のため必要最低限のデータだけ送信
  const payload = {
    channel_name: message.channel.name,
    message_id: message.id,
    author: message.author.username,
    content: message.content,
    timestamp: message.createdAt.toISOString(),
  };

  // GAS に非同期送信（失敗しても Bot 停止しない）
  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('GAS送信エラー:', err));
});

// Discord にログイン
client.login(BOT_TOKEN);
