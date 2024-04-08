import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { wsPort, webPort, siteDomain } from '../../config';

import Header from '../../components/Header';

type LoginProps = {
  isAuthenticated: boolean; // add this line
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const { cookies } = req;

  const isAuthenticated = cookies.userToken === 'user-token-value';

  // If the admin is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // If not authenticated, continue rendering the login page
  return { props: { isAuthenticated } };
};

// const Login: React.FC = () => {

const Login: React.FC<LoginProps> = ({ isAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const email = 'user@user.com'; // Static email value

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`${siteDomain}${webPort}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      document.cookie = `userToken=${data.token}; path=/`; // Set the userToken cookie
      window.location.href = '/'; // Redirect to the results page or perform any other desired action
    } else {
      // Login failed
      setErrorMessage(data.message);
    }
  };

  return (
    <>
      <Header isLogged={isAuthenticated} />
      <div className="font-lexend font-semibold flex bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm sm:py-10">
          <h2 className="font-lexend font-semibold  mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
            Input password to take part in the Community Contribution
            Nominations
          </h2>
        </div>

        <div className="font-lexend font-normal mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            <div>
              <button
                type="submit"
                className="bg-transparent hover:bg-black text-black font-semibold hover:text-white py-2 px-4 border-2 border-black hover:border-transparent"
              >
                Start Voting
              </button>
            </div>
          </form>
        </div>
        <p className="mt-20 text-black text-center">
          To obtain the password visit
          <Link
            className="underline"
            href={'https://t.me/dexter_discussion/'}
            target="_blank"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6 inline-block align-middle ml-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
              />
            </svg>
            DeXter&apos;s Telegram Channel.
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
