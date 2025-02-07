import  { makeWASocket, useMultiFileAuthState } from "baileys";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log("Reconnecting...");
            startBot();
        } else if (connection === "open") {
            console.log("Bot connected!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log(`Message from ${sender}: ${textMessage}`);

        if (textMessage?.toLowerCase() === "hello") {
            await sock.sendMessage(sender, { text: "Hello! How can I assist you?" });
        }
    });
}

startBot();
