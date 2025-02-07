import { makeWASocket, useMultiFileAuthState } from "baileys";
import "dotenv/config";

async function sendMessage(text) {
  const { state } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      console.log("WhatsApp connection closed.");
    } else if (connection === "open") {
      try {
        const number = process.env.NO_WA;
        const jid = number + "@s.whatsapp.net";

        const sentMessage = await sock.sendMessage(jid, { text });
        console.log(
          "Message sent successfully!",
          sentMessage.message.extendedTextMessage.text
        );
        sock.end(new Error("Message sent, closing connection"));
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  });
}

export { sendMessage };
