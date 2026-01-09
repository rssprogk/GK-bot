const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = "1459001827453309071";

const commands = [
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Generate a 24h GK key"),

  new SlashCommandBuilder()
    .setName("revoke")
    .setDescription("Revoke a GK key (admin)")
    .addStringOption(opt =>
      opt.setName("key")
        .setDescription("Key to revoke")
        .setRequired(true)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("⏳ Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered!");
  } catch (err) {
    console.error(err);
  }
})();
