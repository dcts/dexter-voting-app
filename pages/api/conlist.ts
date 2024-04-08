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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';
  let conn;

  try {
    conn = await pool.getConnection();
    if (req.method === 'GET') {
      const query = 'SELECT id, name, skills FROM conlist';
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        query,
      );

      const conlist = rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        skills: row.skills,
      }));

      return res.status(200).json({ conlist });
    } else if (req.method === 'POST') {
      if (!isAdminAuthenticated) {
        return res.status(401).json({ error: 'Unauthorized access.' });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Missing contributor id.' });
      }

      const deleteQuery = 'DELETE FROM conlist WHERE id = ?';
      await conn.execute(deleteQuery, [id]);

      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        'SELECT MAX(id) as maxId FROM conlist',
      );
      const maxId = rows[0].maxId || 0;

      return res
        .status(200)
        .json({ message: 'Contributor deleted successfully.' + id });
    } else if (req.method === 'PUT') {
      if (!isAdminAuthenticated) {
        return res.status(401).json({ error: 'Unauthorized access.' });
      }

      const { name, skills, wallet } = req.body;

      if (!name || !skills || !wallet) {
        return res.status(400).json({ error: 'Missing contributor data.' });
      }

      const query =
        'INSERT INTO conlist (name, skills, wallet) VALUES (?, ?, ?)';
      await conn.execute(query, [name, skills, wallet]);

      return res
        .status(201)
        .json({ message: 'Contributor created successfully.' });
    } else {
      return res.status(405).json({ error: 'Invalid request method.' });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: 'An error occurred while processing your request.' });
  } finally {
    if (conn) conn.release();
  }
}
