import Binance from "binance-api-node";
import * as dotenv from "dotenv";

dotenv.config();

const client = (Binance as any)({
  apiKey: process.env.BINANCE_API_KEY_TEST,
  apiSecret: process.env.BINANCE_SECRET_KEY_TEST,
  httpBase: "https://testnet.binance.vision",
});

async function checkOrders() {
  // Open orders
  const openOrders = await client.openOrders({ symbol: "ETHUSDT" });
  console.log(`📋 Open Orders (${openOrders.length}):`);
  if (openOrders.length === 0) {
    console.log("  No open orders\n");
  } else {
    openOrders.forEach((o: any) => {
      console.log(`  ID: ${o.orderId} | Price: $${o.price} | Qty: ${o.origQty} | Status: ${o.status}`);
    });
  }

  // Completed trades
  const trades = await client.myTrades({ symbol: "ETHUSDT" });
  console.log(`✅ Completed Trades (${trades.length}):`);
  if (trades.length === 0) {
    console.log("  No completed trades");
  } else {
    trades.forEach((t: any) => {
      const total = (parseFloat(t.price) * parseFloat(t.qty)).toFixed(4);
      console.log(`  ID:         ${t.orderId}`);
      console.log(`  Price:      $${t.price}`);
      console.log(`  Qty:        ${t.qty} ETH`);
      console.log(`  Total:      $${total} USDT`);
      console.log(`  Fee:        ${t.commission} ${t.commissionAsset}`); // e.g. "0.00000462 ETH" or "0.00750000 BNB"
      console.log(`  Maker:      ${t.isMaker ? "Yes" : "No"}`);          // maker = limit order filled, taker = market order
      console.log(`  Time:       ${new Date(t.time).toISOString()}`);
      console.log(`  ---`);
    });
  }
}

checkOrders();