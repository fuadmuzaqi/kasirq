import { createClient } from "@libsql/client";
import jwt from "jsonwebtoken";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);

    if (req.method === "POST") {
      const { id, date, total, bayar, items } = req.body;
      const tx = await client.transaction("write");
      try {
        await tx.execute({
          sql: "INSERT INTO sales (id, date, total, bayar, items) VALUES (?, ?, ?, ?, ?)",
          args: [id, date, total, bayar, JSON.stringify(items)]
        });
        for (let item of items) {
          await tx.execute({
            sql: "UPDATE products SET stock = stock - ? WHERE id = ?",
            args: [item.qty, item.productId]
          });
        }
        await tx.commit();
        return res.status(200).json({ success: true });
      } catch (err) {
        await tx.rollback();
        throw err;
      }
    }

    if (req.method === "GET") {
      const { month } = req.query;
      const r = await client.execute({
        sql: "SELECT * FROM sales WHERE date LIKE ? ORDER BY date DESC",
        args: [month + "%"]
      });
      return res.status(200).json(r.rows.map(row => ({ ...row, items: JSON.parse(row.items) })));
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
}
