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

    if (req.method === "GET") {
      const r = await client.execute("SELECT * FROM products ORDER BY name ASC");
      return res.status(200).json(r.rows);
    }

    if (req.method === "POST") {
      const { id, name, buy, sell, stock, sku } = req.body;
      await client.execute({
        sql: "INSERT OR REPLACE INTO products (id, name, buy, sell, stock, sku) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, name, buy, sell, stock, sku]
      });
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      await client.execute({ sql: "DELETE FROM products WHERE id = ?", args: [req.query.id] });
      return res.status(200).json({ success: true });
    }
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized atau DB Error" });
  }
}
