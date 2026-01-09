import { createClient } from "@libsql/client";
import jwt from "jsonwebtoken";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    // Verifikasi Token JWT
    jwt.verify(token, process.env.JWT_SECRET);

    // Ambil Setting (GET)
    if (req.method === "GET") {
      const r = await client.execute("SELECT * FROM settings WHERE id = 1");
      return res.status(200).json(r.rows[0] || {});
    }

    // Update Setting (POST)
    if (req.method === "POST") {
      const { name, address, phone, paper } = req.body;
      await client.execute({
        sql: "UPDATE settings SET name = ?, address = ?, phone = ?, paper = ? WHERE id = 1",
        args: [name, address, phone, paper]
      });
      return res.status(200).json({ success: true });
    }

    // Reset Data (DELETE) - Opsional untuk fitur Reset
    if (req.method === "DELETE") {
      await client.execute("DELETE FROM sales");
      await client.execute("DELETE FROM products");
      return res.status(200).json({ success: true });
    }

  } catch (e) {
    return res.status(401).json({ error: "Unauthorized atau DB Error: " + e.message });
  }
}
