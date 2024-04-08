import { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket, FieldPacket } from 'mysql2/promise';
import cookie from 'cookie';

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

// Function to sanitize string
function sanitizeString(str: string): string {
  return str.replace(/[<>"'`]/g, ''); // removes only <, >, ", ', and `
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';

  if (req.method === 'GET') {
    let conn;
    try {
      conn = await pool.getConnection();

      const stmt = 'SELECT id, nomination, reason, phase FROM nominations';
      const [rows] = await conn.query<RowDataPacket[]>(stmt);

      // calculate unique phases from nominations
      const phases = Array.from(new Set(rows.map((row) => row.phase)));

      return res.status(200).json({ nominations: rows, phases });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error:
          'An error occurred while processing your request. Please try again.',
      });
    } finally {
      if (conn) conn.release();
    }
  } else if (req.method === 'DELETE') {
    if (!isAdminAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    const id = req.query.id;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    let conn;
    try {
      conn = await pool.getConnection();

      const stmt = 'DELETE FROM nominations WHERE id = ?';
      await conn.query(stmt, [id]);

      return res
        .status(200)
        .json({ message: 'Nomination successfully deleted.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error:
          'An error occurred while processing your request. Please try again.',
      });
    } finally {
      if (conn) conn.release();
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
