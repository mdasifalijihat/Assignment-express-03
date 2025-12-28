import { Pool } from "pg";
import config from "../config/env";

export const pool = new Pool({
  connectionString: config.connection_str,
  ssl: {
    rejectUnauthorized: false,
  },
});

const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) CHECK (type IN ('car', 'bike', 'truck')) NOT NULL,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        price_per_day NUMERIC(10,2) CHECK (price_per_day > 0),
        status VARCHAR(20) CHECK (
          status IN ('available', 'rented', 'maintenance')
        ) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_cost NUMERIC(10,2) CHECK (total_cost > 0),
        status VARCHAR(20) CHECK (
          status IN ('pending', 'confirmed', 'completed', 'cancelled')
        ) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (end_date > start_date)
      );
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database init failed", error);
    process.exit(1); 
  }
};

export default initDB;
