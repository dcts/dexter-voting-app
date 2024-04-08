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
  const isUserAuthenticated = cookies.userToken === 'user-token-value';

  if (req.method === 'POST') {
    if (!isUserAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    let { nomination, reason, phase } = req.body; // Added phase

    // Sanitizing inputs
    nomination = sanitizeString(nomination);
    reason = sanitizeString(reason);

    if (
      !nomination ||
      typeof nomination !== 'string' ||
      nomination.length > 30 ||
      !reason ||
      typeof reason !== 'string' ||
      typeof phase !== 'number' || // Check if phase is a number
      phase < 0 // Check if phase is a positive number
    ) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    let conn;
    try {
      conn = await pool.getConnection();

      const stmt =
        'INSERT INTO nominations (nomination, reason, phase) VALUES (?, ?, ?)'; // Added phase
      await conn.query(stmt, [nomination, reason, phase]); // Added phase

      return res
        .status(200)
        .json({ message: 'Nomination successfully submitted.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        error:
          'An error occurred while processing your request. Please try again.',
      });
    } finally {
      if (conn) conn.release();
    }
  } else if (req.method === 'GET') {
    if (!isUserAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    let conn;
    try {
      conn = await pool.getConnection();

      const stmt = 'SELECT nomination, reason, phase FROM nominations';
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
  }
}
