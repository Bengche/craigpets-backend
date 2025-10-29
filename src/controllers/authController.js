import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "craigpets-demo-secret";

export function login(req, res) {
  const { email, password } = req.body ?? {};

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res
      .status(500)
      .json({ message: "Admin credentials are not configured" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const token = jwt.sign({ email, role: "admin" }, secret, { expiresIn: "8h" });

  return res.json({
    token,
    expiresIn: 8 * 60 * 60,
    user: {
      email,
      role: "admin",
    },
  });
}
