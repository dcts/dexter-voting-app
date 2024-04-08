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

      // Get all votes.
      const [votes] = await conn.query<RowDataPacket[]>(
        'SELECT phase_id FROM voting',
      );

      if (!votes || votes.length === 0) {
        return res.status(200).json({ phaseIds: [] });
      } else {
        // Map over votes and return only the phase_ids, then create a set to get unique ids and convert it back to array
        const phaseIds = Array.from(
          new Set(votes.map((vote) => vote.phase_id)),
        );
        return res.status(200).json({ phaseIds });
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
