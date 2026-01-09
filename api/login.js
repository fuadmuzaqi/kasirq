import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { accessCode } = req.body;
  // Ambil kode dari environment variable Vercel
  const MASTER_CODE = process.env.ACCESS_CODE || "fuadeli"; 
  const JWT_SECRET = process.env.JWT_SECRET;

  if (accessCode === MASTER_CODE) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
    return res.status(200).json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: "Kode Salah" });
}
