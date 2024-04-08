import type { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket, FieldPacket } from 'mysql2/promise';
import cookie from 'cookie';

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
  res: NextApiResponse,
) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';

  if (!isAdminAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized access.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    let query;
    switch (req.method) {
      case 'GET':
        const { phase_id } = req.query; // Extract phase_id from query parameters
        query = 'SELECT * FROM voting';

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
        break;
      case 'DELETE':
        const { id } = req.query; // Extract id from query parameters
        if (!id) {
          (res.status(400).json as any)({
            message: "Missing 'id' query parameter",
          });
          return;
        }
        query = `DELETE FROM voting WHERE id = ${mysql.escape(id)}`;
        await conn.query(query);
        (res.status(200).json as any)({
          message: `Successfully deleted log with id: ${id}`,
        });
        break;
      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        (res.status(405).json as any)({
          message: `Method ${req.method} Not Allowed`,
        });
    }
  } catch (error) {
    console.error(error);
    (res.status(500).json as any)({
      message: 'An error occurred while processing the request.',
    });
  } finally {
    if (conn) conn.release();
  }
}
