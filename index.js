const axios = require("axios");
const cheerio = require("cheerio");

const URL =
  "https://shop.amul.com/en/product/amul-chocolate-whey-protein-34-g-or-pack-of-60-sachets";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const OUT_OF_STOCK_TEXT = "Out of Stock";

async function sendTelegram(msg) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: msg,
  });
}

async function checkStock() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const text = $("body").text();

    if (!text.includes(OUT_OF_STOCK_TEXT)) {
      console.log("IN STOCK");
      await sendTelegram("🟢 Amul product is BACK IN STOCK! Buy fast!");
    } else {
      console.log("Still out of stock");
    }
  } catch (err) {
    console.error(err.message);
  }
}

checkStock();
