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
  if (req.method === 'GET') {
    const phaseIdParam = req.query.phaseId as string;
    const phaseId = parseInt(phaseIdParam, 10);
    let conn;
    try {
      conn = await pool.getConnection();

      // Retrieve the phase ID with status = 1 from the "phases" table
      let query = 'SELECT id FROM phases WHERE status = 1 LIMIT 1';
      const [phaseRow]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        query,
      );

      if (!phaseRow || !phaseRow.length) {
        return res.status(404).json({ error: 'No active phase found.' });
      }

      const activePhaseId = phaseRow[0].id;

      // Use the selected phaseId if provided, otherwise use the active phaseId
      const selectedPhaseId = isNaN(phaseId) ? activePhaseId : phaseId;

      // Retrieve contributors and their points for the specified phase from the "voting" table
      query =
        'SELECT contributor_name, SUM(points) AS points_sum FROM voting WHERE phase_id = ? GROUP BY contributor_name';
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        query,
        [selectedPhaseId],
      );

      const [total]: [RowDataPacket[], FieldPacket[]] = await conn.execute(
        'SELECT SUM(points) AS total_points FROM voting WHERE phase_id = ?',
        [selectedPhaseId],
      );

      const totalPoints = total[0].total_points;
      const totalTokens = 95000;

      const contributors = rows.map((row: any) => ({
        contributor_name: row.contributor_name,
        points_sum: row.points_sum,
        tokensAllocated: (row.points_sum / totalPoints) * totalTokens,
        phase_id: selectedPhaseId,
      }));

      return res.status(200).json({ contributors, phaseId: selectedPhaseId });
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
