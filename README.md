# 🚗 Vehicle Rental System - Database Design & SQL Queries

## 📖 Project Overview
This project is a **Vehicle Rental System** database designed to handle real-world vehicle rental operations.  
It manages **Users, Vehicles, and Bookings**, ensuring proper **relationships, constraints, and business logic**.  

The database design is **normalized** and supports:

- Unique users (email-based)  
- Vehicle availability & types  
- Bookings linking users and vehicles  
- Booking statuses and total cost calculations  

---

## 🗂 Business Requirements

### Users
- Stores **Admin** or **Customer** roles  
- Name, email (unique), password, phone  
- Users can make multiple bookings

### Vehicles
- Stores vehicle name, type (car/bike/truck), model  
- Unique registration number  
- Rental price per day  
- Availability status (`available`, `rented`, `maintenance`)

### Bookings
- Links **User → Booking → Vehicle**  
- Start date, end date  
- Status: `pending`, `confirmed`, `completed`, `cancelled`  
- Total cost calculated based on rental days × price per day

---

## 📊 Entity Relationship Diagram (ERD)

### Relationship Summary
- **One to Many:** User → Bookings  
- **Many to One:** Bookings → Vehicle  
- **One to One (logical):** Each booking connects exactly one user and one vehicle  

### Keys
- **Primary Keys (PK)** for all tables (`id`)  
- **Foreign Keys (FK)** for relationships (`user_id`, `vehicle_id`)  

> ERD created using Lucidchart: [Shareable ERD Link](#)  

---

## 📁 Database Tables

### Users
| Field | Type | Notes |
|-------|------|-------|
| id | SERIAL | Primary Key |
| name | VARCHAR(100) | Required |
| email | VARCHAR(100) | Unique, required |
| password | VARCHAR(255) | Hashed, required |
| phone | VARCHAR(20) | Required |
| role | VARCHAR(20) | 'admin' or 'customer' |

### Vehicles
| Field | Type | Notes |
|-------|------|-------|
| id | SERIAL | Primary Key |
| vehicle_name | VARCHAR(100) | Required |
| type | VARCHAR(20) | car/bike/truck |
| model | VARCHAR(50) | Optional |
| registration_number | VARCHAR(50) | Unique, required |
| daily_rent_price | NUMERIC(10,2) | Required |
| availability_status | VARCHAR(20) | 'available', 'rented', 'maintenance' |

### Bookings
| Field | Type | Notes |
|-------|------|-------|
| id | SERIAL | Primary Key |
| user_id | INT | Foreign Key → Users(id) |
| vehicle_id | INT | Foreign Key → Vehicles(id) |
| rent_start_date | DATE | Required |
| rent_end_date | DATE | Required |
| total_cost | NUMERIC(10,2) | Calculated |
| status | VARCHAR(20) | pending/confirmed/completed/cancelled |

---

## 📝 Sample SQL Queries

### 1️⃣ JOIN - Retrieve booking info with customer & vehicle name

```sql
SELECT b.id AS booking_id,
       u.name AS customer_name,
       v.vehicle_name,
       b.rent_start_date,
       b.rent_end_date,
       b.total_cost,
       b.status
FROM bookings b
INNER JOIN users u ON b.user_id = u.id
INNER JOIN vehicles v ON b.vehicle_id = v.id;

2️⃣ NOT EXISTS - Vehicles never booked
SELECT *
FROM vehicles v
WHERE NOT EXISTS (
    SELECT 1 
    FROM bookings b 
    WHERE b.vehicle_id = v.id
);

3️⃣ WHERE - Available vehicles of specific type
SELECT *
FROM vehicles
WHERE type = 'car' 
  AND availability_status = 'available';

4️⃣ GROUP BY + HAVING - Vehicles with more than 2 bookings
SELECT v.vehicle_name,
       COUNT(b.id) AS total_bookings
FROM vehicles v
JOIN bookings b ON v.id = b.vehicle_id
GROUP BY v.vehicle_name
HAVING COUNT(b.id) > 2;

⚡ Setup Instructions (PostgreSQL)

Install PostgreSQL

Create database:

CREATE DATABASE vehicle_rental;


Create tables (Users, Vehicles, Bookings) with constraints as shown above

Insert sample data to test queries