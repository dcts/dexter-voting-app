import type { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

type AdminLog = {
  id: number;
  username: string;
  contributor_name: string;
  points: number;
  phase_id: number;
};

type DataResponse = {
  adminLogs: AdminLog[];
};

const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPass,
  waitForConnections: true,
  database: dbName,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DataResponse>,
) {
  let conn;
  try {
    conn = await pool.getConnection();
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      (res.status(405).json as any)({
        message: `Method ${req.method} Not Allowed`,
      });
      return;
    }

    const { phase_id } = req.query; // Extract phase_id from query parameters
    let query = 'SELECT * FROM voting';

    // If phase_id exists in the query parameters, modify the query to filter by phase_id
    if (phase_id) {
      query += ` WHERE phase_id = ${mysql.escape(phase_id)}`;
    }

    const [rows] = await conn.query<RowDataPacket[]>(query);
    const adminLogs = rows.map((row) => ({
      id: row.id,
      username: row.username,
      contributor_name: row.contributor_name,
      points: row.points,
      phase_id: row.phase_id,
    }));
    res.status(200).json({ adminLogs });
  } catch (error) {
    console.error(error);
    (res.status(500).json as any)({
      message: 'An error occurred while processing the request.',
    });
  } finally {
    if (conn) conn.release();
  }
}
