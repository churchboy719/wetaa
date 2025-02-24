import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  await connectDB();

  const { cashierId, isActive } = req.body;

  try {
    const cashier = await Cashier.findByIdAndUpdate(cashierId, { isActive }, { new: true });
    res.status(200).json({ cashier });
  } catch (error) {
    res.status(500).json({ message: "Error updating cashier" });
  }
}
