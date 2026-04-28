const puppeteer = require("puppeteer");
const axios = require("axios");

const URL =
  "https://shop.amul.com/en/product/amul-chocolate-whey-protein-34-g-or-pack-of-60-sachets";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(msg) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    await axios.post(url, {
      chat_id: CHAT_ID,
      text: msg,
    });

    console.log("✅ Telegram sent");
  } catch (err) {
    console.error("❌ Telegram error:", err.message);
  }
}

async function checkStock() {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });

    // Get visible text + button text
    const content = await page.evaluate(() => {
      return document.body.innerText.toLowerCase();
    });

    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button"))
        .map((b) => b.innerText.toLowerCase())
        .join(" ");
    });

    console.log("Page loaded successfully");

    const isOutOfStock =
      content.includes("sold out") ||
      content.includes("out of stock") ||
      content.includes("currently unavailable");

    const hasBuyButton =
      buttons.includes("add to cart") || buttons.includes("buy now");

    if (!isOutOfStock && hasBuyButton) {
      console.log("🟢 IN STOCK DETECTED!");

      await sendTelegram(
        "🟢 Amul product is BACK IN STOCK!\nGo buy now!\n" + URL
      );
    } else {
      console.log("❌ Still out of stock");
    }

    await browser.close();
  } catch (err) {
    console.error("❌ ERROR:", err.message);

    if (browser) await browser.close();

    process.exit(1);
  }
}

checkStock();
