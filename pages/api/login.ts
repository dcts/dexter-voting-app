// /pages${siteDomain}${webPort}/api/login.ts

import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type LoginRequestBody = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  // Additional user or admin data if needed
};

// User Login Endpoint
export default function userLogin(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  if (req.method === 'POST') {
    const { email, password } = req.body as LoginRequestBody;

    // Replace with your actual user credentials
    const hardcodedUser = {
      email: 'user@user.com',
      password: 'DeXterC0ntr1but0rs2024!',
    };

    // Perform user authentication logic here
    if (email === hardcodedUser.email && password === hardcodedUser.password) {
      // Authentication successful
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('userToken', 'user-token-value', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 86400, // 1 day in seconds
          path: '/',
        }),
      );

      res
        .status(200)
        .json({ success: true, message: 'User login successful!' });
    } else {
      // Authentication failed
      res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }
  } else {
    // Handle unsupported methods
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
