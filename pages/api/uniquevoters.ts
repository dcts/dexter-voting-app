import { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket, FieldPacket } from 'mysql2/promise';

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
  const { phaseId } = req.query; // extract phaseId from request query

  if (req.method === 'GET') {
    let conn;
    try {
      conn = await pool.getConnection();

      //   // Retrieve the unique 'username' from the 'voting' table
      //   let query = 'SELECT DISTINCT username FROM voting';
      //   const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.execute(query);

      // Retrieve the unique 'username' from the 'voting' table for a specific phaseId
      let query = 'SELECT DISTINCT username FROM voting WHERE phase_id = ?';
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        query,
        [phaseId],
      );

      const usernames = rows.map((row: any) => row.username);

      return res.status(200).json({ usernames });
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
