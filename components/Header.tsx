import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DexterLogo from 'public/dexterlogo.png';
import { wsPort, webPort, siteDomain } from '../config';

type HeaderProps = {
  isLogged: boolean;
};

const Header: React.FC<HeaderProps> = ({ isLogged }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    fetch(`${siteDomain}${webPort}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        window.location.href = '/login'; // Redirect to login page
      })
      .catch((err) => console.error(err));
  };

  return (
    <header className="py-10 font-lexend font-normal absolute w-full z-10">
      <nav className="container mx-auto px-8 md:px-12 py-1">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex justify-between items-center">
            <div>
              <Link href={`${siteDomain}${webPort}`}>
                <Image src={DexterLogo} alt={'DexterLogo'} width={100} />
              </Link>
            </div>

            <div className="flex md:hidden">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="toggle menu"
                onClick={() => setIsOpen(!isOpen)}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <div
            className={`${
              isOpen ? 'block bg-white' : 'hidden md:flex'
            } text-black items-center`}
          >
            <div className="md:flex">
              <Link href={`${siteDomain}${webPort}`}>
                <p className="px-3 py-2 font-lexend font-semibold text-center hover:border-b hover:border-black  cursor-pointer">
                  Vote
                </p>
              </Link>
              <Link href={`${siteDomain}${webPort}/nominations`}>
                <p className="px-3 py-2 font-lexend font-semibold text-center hover:border-b hover:border-black  cursor-pointer">
                  Nominations
                </p>
              </Link>
              <Link href={`${siteDomain}${webPort}/history`}>
                <p className="px-3 py-2 font-lexend font-semibold text-center hover:border-b hover:border-black cursor-pointer">
                  History
                </p>
              </Link>
              <Link href={`${siteDomain}${webPort}/info`}>
                <p className="px-3 py-2 font-lexend font-semibold text-center hover:border-b hover:border-black  cursor-pointer">
                  Info
                </p>
              </Link>
              {isLogged ? (
                <div className="flex justify-center items-center">
                  <div className="flex flex-row-reverse items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 font-lexend font-normal center hover:border-b hover:border-black  cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <div className="flex flex-row-reverse items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 font-lexend font-normal center hover:border-b hover:border-black  cursor-pointer"
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
