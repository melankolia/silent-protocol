import { makeWASocket, useMultiFileAuthState } from "baileys";
import "dotenv/config";

async function connectWA() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open") {
      console.log("WhatsApp connected!");
      process.exit();
    }
  });
}

connectWA();
