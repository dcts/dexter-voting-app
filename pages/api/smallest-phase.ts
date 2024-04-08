// pages${siteDomain}${webPort}/api/phase-ids.ts
import { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket } from 'mysql2/promise';

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

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
  if (req.method === 'GET') {
    let conn;
    try {
      conn = await pool.getConnection();

      // Get the smallest phase_id.
      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT MIN(phase_id) AS smallestPhaseId FROM voting',
      );

      if (!rows || rows.length === 0) {
        return res.status(200).json({ smallestPhaseId: null });
      } else {
        const smallestPhaseId = rows[0].smallestPhaseId;
        return res.status(200).json({ smallestPhaseId });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: 'An error occurred while processing your request.' });
    } finally {
      if (conn) conn.release();
    }
  } else {
    return res.status(405).json({ error: 'Invalid request method.' });
  }
}
