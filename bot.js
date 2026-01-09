const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = "1202436098916089908";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const KEY_FILE = "./keys.json";

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) fs.writeFileSync(KEY_FILE, "{}");
  return JSON.parse(fs.readFileSync(KEY_FILE));
}

function saveKeys(data) {
  fs.writeFileSync(KEY_FILE, JSON.stringify(data, null, 2));
}

client.once("ready", () => {
  console.log("✅ Bot online");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const keys = loadKeys();

  // /link
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

  // /revoke KEY
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

client.login(TOKEN);
