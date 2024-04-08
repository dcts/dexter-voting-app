import { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

type LoginRequestBody = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
};

export default function adminLogin(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  if (req.method === 'POST') {
    const { email, password } = req.body as LoginRequestBody;

    // Replace with your actual admin credentials
    const hardcodedAdmin = {
      email: 'admin@dexternominations.space',
      password: 'p$3j$vD67!Lc',
    };

    // Perform admin authentication logic here
    if (
      email === hardcodedAdmin.email &&
      password === hardcodedAdmin.password
    ) {
      // Authentication successful
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('adminToken', 'admin-token-value', {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development', // secure in production
          sameSite: 'strict',
          maxAge: 86400, // 1 day in seconds
          path: '/',
        }),
      );

      res
        .status(200)
        .json({ success: true, message: 'Admin login successful!' });
    } else {
      // Authentication failed
      res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' });
    }
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', 'POST');
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
