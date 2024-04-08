// pages${siteDomain}${webPort}/api/conlist.ts
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

      const name = req.query.name;

      if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
      }

      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT ID FROM conlist WHERE Name = ?',
        [name],
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No matching records found.' });
      } else {
        const ID = rows[0].ID;
        return res.status(200).json({ ID });
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
