// exchange.js
import { getDb } from "./connection.js";

// Fixed exchange rate (you can change later)
const NAIRA_TO_DOLLAR_RATE = 1500; // ₦1500 = $1

/**
 * Convert Naira to Dollar
 */
export async function exchangeNairaToDollar(username, nairaAmount) {
  const db = getDb();
  const users = db.collection("users");

  if (nairaAmount <= 0) {
    throw new Error("Invalid exchange amount");
  }

  const user = await users.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.amount < nairaAmount) {
    throw new Error("Insufficient balance");
  }

  const dollars = nairaAmount / NAIRA_TO_DOLLAR_RATE;

  await users.updateOne(
    { username },
    {
      $inc: {
        amount: -nairaAmount,
        dollars: dollars
      }
    }
  );

  return {
    nairaDebited: nairaAmount,
    dollarsCredited: dollars
  };
}

/**
 * Convert Dollar to Naira
 */
export async function exchangeDollarToNaira(username, dollarAmount) {
  const db = getDb();
  const users = db.collection("users");

  if (dollarAmount <= 0) {
    throw new Error("Invalid exchange amount");
  }

  const user = await users.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  if ((user.dollars || 0) < dollarAmount) {
    throw new Error("Insufficient dollar balance");
  }

  const naira = dollarAmount * NAIRA_TO_DOLLAR_RATE;

  await users.updateOne(
    { username },
    {
      $inc: {
        dollars: -dollarAmount,
        amount: naira
      }
    }
  );

  return {
    dollarsDebited: dollarAmount,
    nairaCredited: naira
  };
}
