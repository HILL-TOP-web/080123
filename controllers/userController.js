import { users } from "../database/connection.js";
import { ObjectId } from "mongodb";

export const getUserBalance = async (req, res) => {
  const { userId } = req.params;
  const user = await users.findOne({ _id: new ObjectId(userId) });

  if (!user) return res.json({ balance: 0 });

  res.json({ balance: user.balance });
};
