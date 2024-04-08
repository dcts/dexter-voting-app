// pages${siteDomain}${webPort}/api/voting.ts
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

      // Get the number of rows in the voting table.
      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT COUNT(*) as rowCount FROM voting',
      );

      if (!rows || rows.length === 0) {
        return res.status(200).json({ rowCount: 0 });
      } else {
        const rowCount = Number(rows[0].rowCount);
        return res.status(200).json({ rowCount });
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
