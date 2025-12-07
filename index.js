import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Must match the verify token you put in Meta config
const VERIFY_TOKEN = "ugpmhelptoken";

// Your WhatsApp Cloud API phone number ID (from the Meta screen)
const PHONE_NUMBER_ID = "879745488561219";

// Access token will be provided by Render as an env variable
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Webhook verification (Meta calls this once when you click Verify)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.from) {
      const from = message.from;
      const userText = message.text?.body || "";

      console.log("Incoming from", from, ":", userText);

      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: `UGPM Help Bot received: ${userText}`,
          },
        },
      });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err.response?.data || err);
    res.sendStatus(500);
  }
});

// Render will set PORT for you; default to 3000 for local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UGPM Help Bot running on port ${PORT}`);
});
