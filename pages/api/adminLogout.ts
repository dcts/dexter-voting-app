//

import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type LogoutResponse = {
  success: boolean;
  message?: string;
};

export default function adminLogout(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>,
) {
  if (req.method === 'POST') {
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('adminToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Immediately expires the cookie
        path: '/',
      }),
    );

    res.status(200).json({ success: true, message: 'User logout successful!' });
  } else {
    // Handle unsupported methods
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
