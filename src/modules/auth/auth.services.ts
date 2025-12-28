import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db";

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: "admin" | "customer";
}

class AuthService {
  static async signup(payload: SignupPayload) {
    const { name, email, password, phone, role = "customer" } = payload;

    // Check existing user
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered");
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `
      INSERT INTO users (name, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role;
      `,
      [name, email.toLowerCase(), hashedPassword, phone, role]
    );

    return result.rows[0];
  }

  static async signin(email: string, password: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email.toLowerCase(),
    ]);

    const user = result.rows[0];
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export default AuthService;
