import { pool } from "../../db";

export interface VehiclePayload {
  name: string;
  type: "car" | "bike" | "truck";
  registration_number: string;
  price_per_day: number;
  status?: "available" | "rented" | "maintenance";
}

class VehicleService {
  // ==============================
  // CREATE VEHICLE (ADMIN)
  // ==============================
  static async createVehicle(payload: VehiclePayload) {
    const {
      name,
      type,
      registration_number,
      price_per_day,
      status = "available",
    } = payload;

    const result = await pool.query(
      `
      INSERT INTO vehicles
      (name, type, registration_number, price_per_day, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [name, type, registration_number, price_per_day, status]
    );

    return result.rows[0];
  }

  // ==============================
  // GET ALL VEHICLES
  // ==============================
  static async getAllVehicles() {
    const result = await pool.query(
      `SELECT * FROM vehicles ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // ==============================
  // GET VEHICLE BY ID
  // ==============================
  static async getVehicleById(vehicleId: number) {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
      vehicleId,
    ]);
    return result.rows[0];
  }

  // ==============================
  // UPDATE VEHICLE (ADMIN)
  // ==============================
  static async updateVehicle(
    vehicleId: number,
    payload: Partial<VehiclePayload>
  ) {
    const allowedFields = [
      "name",
      "type",
      "registration_number",
      "price_per_day",
      "status",
    ];

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    for (const key of allowedFields) {
      if ((payload as any)[key] !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push((payload as any)[key]);
        index++;
      }
    }

    if (!fields.length) return null;

    const result = await pool.query(
      `
      UPDATE vehicles
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
      `,
      [...values, vehicleId]
    );

    return result.rows[0];
  }

  // ==============================
  // DELETE VEHICLE (ADMIN)
  // ==============================
  static async deleteVehicle(vehicleId: number) {
    const bookingCheck = await pool.query(
      `
      SELECT id FROM bookings
      WHERE vehicle_id = $1
      AND status IN ('pending', 'confirmed')
      `,
      [vehicleId]
    );

    if (bookingCheck.rows.length > 0) {
      throw new Error("Vehicle has active bookings");
    }

    await pool.query(`DELETE FROM vehicles WHERE id = $1`, [vehicleId]);

    return { message: "Vehicle deleted successfully" };
  }
}

export default VehicleService;
