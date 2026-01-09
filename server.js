const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());

const KEY_FILE = "./keys.json";

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) fs.writeFileSync(KEY_FILE, "{}");
  return JSON.parse(fs.readFileSync(KEY_FILE));
}

app.post("/verify", (req, res) => {
  const { key, device } = req.body;
  const keys = loadKeys();

  if (!keys[key]) {
    return res.json({ ok: false, reason: "invalid" });
  }

  const data = keys[key];

  if (data.revoked) {
    return res.json({ ok: false, reason: "revoked" });
  }

  if (Date.now() > data.expires) {
    return res.json({ ok: false, reason: "expired" });
  }

  console.log("✅ Verified:");
  console.log("Discord:", data.discord);
  console.log("Device:", device);

  return res.json({
    ok: true,
    discord: data.discord,
    expires: data.expires
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});