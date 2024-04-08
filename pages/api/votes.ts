// pages${siteDomain}${webPort}/api/votes.ts
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
  return str.replace(/[^\w]/g, '').replace(/[@\s]/g, '');
}

// Function to sanitize votes
function sanitizeVotes(
  votes: { contributorName: string; points: number }[],
): { contributorName: string; points: number }[] {
  return votes.map((vote) => {
    return {
      contributorName: sanitizeString(vote.contributorName),
      points: Number(vote.points),
    };
  });
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

    let { username, votes } = req.body;

    // Sanitizing inputs
    username = sanitizeString(username);
    votes = sanitizeVotes(votes);

    if (
      !username ||
      typeof username !== 'string' ||
      username.length > 30 ||
      !votes ||
      !Array.isArray(votes)
    ) {
      return res.status(400).json({ error: 'Invalid request data.' });
    }

    for (let vote of votes) {
      if (
        !vote ||
        typeof vote !== 'object' ||
        typeof vote.contributorName !== 'string' ||
        typeof vote.points !== 'number'
      ) {
        return res.status(400).json({ error: 'Invalid vote data.' });
      }
    }

    let conn;
    try {
      conn = await pool.getConnection();

      const phaseQuery = 'SELECT id FROM phases WHERE status = 1';
      const [rows, fields] = await conn.query<RowDataPacket[]>(phaseQuery);

      if (!rows || rows.length === 0) {
        return res.status(400).json({
          error: "The Nomination phase hasn't started yet! Come back later.",
        });
      }

      const phaseId = rows[0].id;

      const checkUserQuery =
        'SELECT COUNT(*) as count FROM voting WHERE username = ? AND phase_id = ?';
      const [userRows, userFields] = await conn.query<RowDataPacket[]>(
        checkUserQuery,
        [username, phaseId],
      );

      // If a matching record is found, return an error
      if (userRows[0].count > 0) {
        return res
          .status(400)
          .json({ error: 'You already voted in this phase.' });
      }

      const stmt =
        'INSERT INTO voting (username, contributor_name, points, phase_id) VALUES (?, ?, ?, ?)';

      for (const vote of votes) {
        // Check if username and contributor name are the same
        if (username === vote.contributorName) {
          return res.status(400).json({
            error:
              'You cannot vote for yourself! Remove your nomination and try again.',
          });
        }

        await conn.query(stmt, [
          username,
          vote.contributorName,
          vote.points,
          phaseId,
        ]);
      }

      return res.status(200).json({ message: 'Votes successfully submitted.' });
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
    return res.status(405).json({ error: 'Invalid request method.' });
  }
}
