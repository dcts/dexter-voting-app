import React, { useState } from 'react';
import Image from 'next/image';
import DexterLogo from 'public/dexterlogo.png';
import { GetServerSideProps } from 'next';
import { wsPort, webPort, siteDomain } from '../../config';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const { cookies } = req;

  const isAdminAuthenticated = cookies.adminToken === 'admin-token-value';

  // If the admin is already authenticated, redirect to dashboard
  if (isAdminAuthenticated) {
    return {
      redirect: {
        destination: '/admin/dashboard',
        permanent: false,
      },
    };
  }

  // If not authenticated, continue rendering the login page
  return { props: {} };
};

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch(`${siteDomain}${webPort}/api/adminLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      document.cookie = `adminToken=${data.token}; path=/`;
      window.location.href = '/admin/dashboard';
    } else {
      setErrorMessage(data.message);
    }
  };

  return (
    <div className="font-lexend font-semibold flex bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          className="mx-auto"
          src={DexterLogo}
          alt={'Dexter On Radix'}
          width={100}
        />

        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
          Hello, admin!
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
            </div>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-black"
              >
                Password
              </label>
            </div>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="bg-transparent hover:bg-black text-black font-semibold hover:text-white py-2 px-4 border-2 border-black hover:border-transparent"
            >
              Login to dashboard
            </button>
            {errorMessage && <p>{errorMessage}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
