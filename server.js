// Basic WhatsApp Cloud API bot for UGPM

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Your webhook verification
app.get("/webhook", (req, res) => {
  const verify_token = "ugpmhelptoken"; // must match Meta verify token

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === verify_token) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Handle incoming messages
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value;

    if (message?.messages) {
      const phone_number_id = message.metadata.phone_number_id;
      const from = message.messages[0].from;
      const text = message.messages[0].text?.body || "";

      console.log("Incoming message:", text);

      await sendReply(phone_number_id, from, "UGPM Help Bot: I received your message!");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling message:", err);
    res.sendStatus(500);
  }
});

// Function to send a reply
async function sendReply(phone_number_id, to, msg) {
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    data: {
      messaging_product: "whatsapp",
      to,
      text: { body: msg }
    }
  });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UGPM Bot running on port ${PORT}`));
