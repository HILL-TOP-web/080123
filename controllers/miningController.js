import { users } from "../database/connection.js";
import { ObjectId } from "mongodb";

export const mineSKD = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $inc: { balance: amount } },
    { returnDocument: "after", upsert: true }
  );

  res.json({ balance: result.value.balance });
};
