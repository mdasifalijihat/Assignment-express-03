import { pool } from "../../db";

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: "admin" | "customer";
}

class UserService {
  static async getAllUsers() {
    const result = await pool.query(
      `SELECT id, name, email, phone, role, created_at FROM users`
    );
    return result.rows;
  }

  static async getUserById(userId: number) {
    const result = await pool.query(
      `SELECT id, name, email, phone, role FROM users WHERE id = $1`,
      [userId]
    );

    if (!result.rows.length) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  static async updateUser(userId: number, payload: UpdateUserPayload) {
    const allowedFields: (keyof UpdateUserPayload)[] = [
      "name",
      "phone",
      "role",
    ];

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key of allowedFields) {
      if (payload[key] !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(payload[key]);
        index++;
      }
    }

    if (!fields.length) {
      throw new Error("No valid fields to update");
    }

    const result = await pool.query(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING id, name, email, phone, role;
      `,
      [...values, userId]
    );

    if (!result.rows.length) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  static async deleteUser(userId: number) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const bookingCheck = await client.query(
        `
        SELECT id FROM bookings
        WHERE user_id = $1
        AND status IN ('pending', 'confirmed')
        `,
        [userId]
      );

      if (bookingCheck.rows.length > 0) {
        throw new Error("User has active bookings");
      }

      const deleteResult = await client.query(
        `DELETE FROM users WHERE id = $1`,
        [userId]
      );

      if (!deleteResult.rowCount) {
        throw new Error("User not found");
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export default UserService;
