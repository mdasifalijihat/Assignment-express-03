import { pool } from "../../db";

interface CreateBookingPayload {
  user_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
}

class BookingService {
  // ==============================
  // CREATE BOOKING
  // ==============================
  static async createBooking(payload: CreateBookingPayload) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check vehicle exists & availability
      const vehicleResult = await client.query(
        `SELECT * FROM vehicles WHERE id = $1`,
        [payload.vehicle_id]
      );
      const vehicle = vehicleResult.rows[0];
      if (!vehicle) throw new Error("Vehicle not found");
      if (vehicle.status !== "available")
        throw new Error("Vehicle not available");

      // Validate date range
      const start = new Date(payload.start_date);
      const end = new Date(payload.end_date);
      if (end <= start) throw new Error("End date must be after start date");

      // Calculate days & total cost
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const totalCost = days * Number(vehicle.price_per_day);

      // Create booking
      const bookingResult = await client.query(
        `INSERT INTO bookings
        (user_id, vehicle_id, start_date, end_date, total_cost)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`,
        [
          payload.user_id,
          payload.vehicle_id,
          payload.start_date,
          payload.end_date,
          totalCost,
        ]
      );

      // Update vehicle status
      await client.query(
        `UPDATE vehicles SET status = 'rented' WHERE id = $1`,
        [payload.vehicle_id]
      );

      await client.query("COMMIT");
      return bookingResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // ==============================
  // APPROVE BOOKING (pending → confirmed)
  // ==============================
  static async approveBooking(bookingId: number) {
    const bookingResult = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "pending")
      throw new Error("Only pending bookings can be approved");

    const result = await pool.query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *`,
      [bookingId]
    );
    return result.rows[0];
  }

  // ==============================
  // GET ALL BOOKINGS (ADMIN)
  // ==============================
  static async getAllBookings() {
    const result = await pool.query(
      `SELECT 
        b.*,
        u.name AS user_name,
        u.email,
        v.name AS vehicle_name,
        v.type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC`
    );
    return result.rows;
  }

  // ==============================
  // GET BOOKINGS BY USER
  // ==============================
  static async getBookingsByUser(userId: number) {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  // ==============================
  // CANCEL BOOKING
  // ==============================
  static async cancelBooking(bookingId: number, userId: number) {
    const bookingResult = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Unauthorized access");
    if (new Date(booking.start_date) <= new Date())
      throw new Error("Cannot cancel after rental start");

    await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [
      bookingId,
    ]);
    await pool.query(`UPDATE vehicles SET status = 'available' WHERE id = $1`, [
      booking.vehicle_id,
    ]);
    return { message: "Booking cancelled successfully" };
  }

  // ==============================
  // COMPLETE / RETURN BOOKING
  // ==============================
  static async completeBooking(bookingId: number) {
    const bookingResult = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking) throw new Error("Booking not found");

    await pool.query(`UPDATE bookings SET status = 'completed' WHERE id = $1`, [
      bookingId,
    ]);
    await pool.query(`UPDATE vehicles SET status = 'available' WHERE id = $1`, [
      booking.vehicle_id,
    ]);
    return { message: "Vehicle returned successfully" };
  }
}

export default BookingService;
