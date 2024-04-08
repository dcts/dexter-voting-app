// pages${siteDomain}${webPort}/api/phase-control.ts
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

  if (req.method === 'GET') {
    let conn;
    try {
      conn = await pool.getConnection();

      // Get the currently active phase.
      const [activePhase] = await conn.query<RowDataPacket[]>(
        'SELECT id FROM phases WHERE status = 1',
      );

      if (!activePhase || activePhase.length === 0) {
        return res.status(200).json({ activePhase: null });
      } else {
        return res.status(200).json({ activePhase: activePhase[0].id });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: 'An error occurred while processing your request.' });
    } finally {
      if (conn) conn.release();
    }
  } else if (req.method === 'POST') {
    if (!isAdminAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized access.' });
    }

    const { phaseNumber, phaseAction } = req.body;

    if (!phaseNumber || !phaseAction) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    let conn;
    try {
      conn = await pool.getConnection();

      let phaseQuery = 'SELECT id FROM phases WHERE id = ?';
      const [phaseRows] = await conn.query<RowDataPacket[]>(phaseQuery, [
        phaseNumber,
      ]);

      let newPhaseInfo;

      if (!phaseRows || phaseRows.length === 0) {
        phaseQuery = 'INSERT INTO phases (id, name, status) VALUES (?, ?, ?)';
        await conn.query(phaseQuery, [phaseNumber, `Phase ${phaseNumber}`, 0]);

        newPhaseInfo = [{ id: phaseNumber }];
      }

      let phaseStatus = phaseAction === 'start' ? 1 : 0;

      if (phaseStatus === 1) {
        // Set all phases status to 0
        const resetPhasesStmt = 'UPDATE phases SET status = 0';
        await conn.query(resetPhasesStmt);
      }

      const updateStmt = 'UPDATE phases SET status = ? WHERE id = ?';
      await conn.query(updateStmt, [phaseStatus, phaseNumber]);

      return res
        .status(200)
        .json({ message: `Phase ${phaseNumber} successfully updated.` });
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
