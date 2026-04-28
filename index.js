const cheerio = require("cheerio");

const URL =
  "https://shop.amul.com/en/product/amul-chocolate-whey-protein-34-g-or-pack-of-60-sachets";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(msg) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg,
      }),
    });

    console.log("✅ Telegram sent");
  } catch (err) {
    console.error("❌ Telegram error:", err.message);
  }
}

async function checkStock() {
  try {
    const response = await fetch(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const pageText = $("body").text().toLowerCase();

    console.log("Page fetched successfully");

    const isOutOfStock =
      pageText.includes("sold out") ||
      pageText.includes("out of stock") ||
      pageText.includes("currently unavailable");

    if (!isOutOfStock) {
      console.log("🟢 IN STOCK DETECTED!");

      await sendTelegram(
        "🟢 Amul product is BACK IN STOCK!\nGo buy it quickly!"
      );
    } else {
      console.log("❌ Still out of stock");
    }
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

checkStock();
