import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost"; 
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "1234";
const DB_NAME = process.env.DB_NAME || "timeslot";

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});