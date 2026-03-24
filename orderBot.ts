const Binance = require("binance-api-node").default;
const cron = require("node-cron");

import * as dotenv from "dotenv";


dotenv.config();

const client = Binance({
    apiKey: process.env.BINANCE_API_KEY_TEST,
    apiSecret: process.env.BINANCE_SECRET_KEY_TEST,
    httpBase: "https://testnet.binance.vision",
  });

const SYMBOL = "ETHUSDT";
const ORDER_AMOUNT_USD = 10;
const PRICE_OFFSET = 1; // Place order $0.10 below market price

async function placeLimitOrder() {
    try {
      const allPrices = await client.prices() as unknown as { [key: string]: string };
      const rawPrice = allPrices[SYMBOL];
  
      if (!rawPrice) {
        throw new Error(`Could not find price for ${SYMBOL}`);
      }
  
      const marketPrice = parseFloat(rawPrice);
  
      if (isNaN(marketPrice) || marketPrice <= 0) {
        throw new Error(`Invalid price received: ${rawPrice}`);
      }
  
      const limitPrice = parseFloat((marketPrice - PRICE_OFFSET).toFixed(2));
      const quantity = (ORDER_AMOUNT_USD / limitPrice).toFixed(4); // ✅ 4 decimal places for ETHUSDT
  
      console.log(`[${new Date().toISOString()}] 📈 Market Price: $${marketPrice.toFixed(2)}`);
      console.log(`[${new Date().toISOString()}] 🎯 Limit Price:  $${limitPrice.toFixed(2)} (market - $${PRICE_OFFSET})`);
      console.log(`[${new Date().toISOString()}] 📦 Quantity:     ${quantity} ETH`);
  
      const order = await client.order({
        symbol: SYMBOL,
        side: "BUY",
        type: "LIMIT",
        quantity,
        price: limitPrice.toFixed(2),
        timeInForce: "GTC",
      });
  
      console.log(`[${new Date().toISOString()}] ✅ Order placed:`);
      console.log(`  Order ID: ${order.orderId}`);
      console.log(`  Status:   ${order.status}`);
      console.log(`  Price:    $${limitPrice.toFixed(2)}`);
      console.log(`  Quantity: ${quantity} ETH`);
      console.log(`  Total:    ~$${ORDER_AMOUNT_USD}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ Error:`, error);
    }
  }

  console.log(`[${new Date().toISOString()}] 🚀 Bot started — placing order now then every 10 minutes...`);
  placeLimitOrder();
  
  // Then repeat every 10 minutes
  // Cron format: "*/10 * * * *" = at every 10th minute
  cron.schedule("*/10 * * * *", () => {
    console.log(`[${new Date().toISOString()}] ⏰ Cron triggered — placing order...`);
    placeLimitOrder();
  });