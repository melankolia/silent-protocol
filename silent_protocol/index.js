import axios from "axios";
import prompt from "prompt-sync"
import "dotenv/config";


const positionUrl =
  "https://ceremony-backend.silentprotocol.org/ceremony/position";
const pingUrl = "https://ceremony-backend.silentprotocol.org/ceremony/ping";
const waUrl = `${process.env.WA_URL}/send-message`

function loadToken() {
  try {
    return prompt()('Enter your Token: ');
  } catch (error) {
    console.error(`Error loading tokens: ${error.message}`);
    return [];
  }
}

async function sendMessage(message) {
  try {
    console.log("starting Send Whatsaap Message: ")
    const response = await axios.post(waUrl, {
      number: process.env.NO_WA,
      message
    });

    console.log("Success Send Whatsaap Message: ")
    return response.data
  } catch (err) {
    console.error(err)
  }

}

async function getPosition(token) {
  try {
    const response = await axios.get(positionUrl, {
      headers: getHeaders(token),
    });

    if (response.status === 200) {
      const data = response.data;
      console.log(
        `[Token ${token.slice(0, 6)}...] Position: Behind ${
          data.behind
        }, Time Remaining: ${data.timeRemaining}`
      );
      return data;
    }

    console.log(
      `[Token ${token.slice(0, 6)}...] Failed to fetch position. Status: ${
        response.status
      }`
    );
  } catch (error) {
    console.error(
      `[Token ${token.slice(0, 6)}...] Error fetching position: ${
        error.message
      }`
    );
  }
}

function getHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "*/*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  };
}

async function pingServer(token) {
  try {
    const response = await axios.get(pingUrl, { headers: getHeaders(token) });

    if (response.status === 200) {
      const data = response.data;
      console.log(
        `[Token ${token.slice(0, 6)}...] Ping Status: ${JSON.stringify(data)}`
      );
      return data;
    }

    console.log(
      `[Token ${token.slice(0, 6)}...] Failed to ping. Status: ${
        response.status
      }`
    );
  } catch (error) {
    console.error(
      `[Token ${token.slice(0, 6)}...] Error pinging: ${error.message}`
    );
  }
}

async function runAutomation(token) {
  let isSent = false;

  async function loop() {
    const data = await getPosition(token);
    await pingServer(token);

    console.log({ data })

    if (data?.behind <= 5 && !isSent) {
      await sendMessage("Your position is 5, please be READY!");
      isSent = true;
    }
    else if ((data?.behind % 1000 == 0) & (data?.behind > 0)) {
      await sendMessage("Your Position : " + data?.behind);
    }
  }

  loop(); // Run immediately
  setInterval(loop, 10 * 1000); // Repeat every 10 seconds
}

async function silentProtocol() {
  let token = null;

  while (!token) {
    token = loadToken();
  }

  if (!token) {
    console.log("No token available. Exiting.");
    return;
  }

  try {
    runAutomation(token);
  } catch (error) {
    console.error(error);
  }
}

silentProtocol();
