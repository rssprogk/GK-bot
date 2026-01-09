// server.js (merged bot + API)

const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const express = require("express");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = "1202436098916089908";
const PORT = process.env.PORT || 3000;

const KEY_FILE = "./keys.json";

// ===== EXPRESS SERVER FOR KEY VERIFICATION =====
const app = express();
app.use(express.json());

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) fs.writeFileSync(KEY_FILE, "{}");
  return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(data) {
  fs.writeFileSync(KEY_FILE, JSON.stringify(data, null, 2));
}

// POST /verify endpoint for AHK macro
app.post("/verify", (req, res) => {
  const { key, device } = req.body;
  const keys = loadKeys();

  if (keys[key] && !keys[key].revoked && keys[key].expires > Date.now()) {
    return res.json({
      ok: true,
      discord: keys[key].discord
    });
  } else {
    return res.json({ ok: false });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌐 Key server running on port ${PORT}`);
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const keys = loadKeys();

  // /link command
  if (interaction.commandName === "link") {
    const key = "GK-" + uuidv4().slice(0, 8).toUpperCase();
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    keys[key] = {
      discord: interaction.user.tag,
      discordId: interaction.user.id,
      expires,
      revoked: false
    };

    saveKeys(keys);

    await interaction.reply({
      content:
        `🔑 **Your GK key (24h)**\n` +
        `\`${key}\`\n` +
        `⏰ Expires <t:${Math.floor(expires / 1000)}:R>`,
      ephemeral: true
    });
  }

  // /revoke command
  if (interaction.commandName === "revoke") {
    if (interaction.user.id !== ADMIN_ID) {
      return interaction.reply({ content: "❌ Admin only", ephemeral: true });
    }

    const key = interaction.options.getString("key");
    if (!keys[key]) {
      return interaction.reply({ content: "❌ Key not found", ephemeral: true });
    }

    keys[key].revoked = true;
    saveKeys(keys);

    await interaction.reply(`🚫 Key revoked: \`${key}\``);
  }
});

// Login bot
client.login(TOKEN);
