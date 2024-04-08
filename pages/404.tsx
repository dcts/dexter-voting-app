// pages/404.tsx
import React from 'react';
import Header from '../components/Header';

const Custom404: React.FC = () => {
  return (
    <>
      <Header isLogged={false} />
      <div className="font-lexend bg-gradient-to-br from-dexterblue via-dextergreen to-dextermegagreen flex items-center justify-center h-screen text-2xl text-center">
        <div>
          <h1 className="text-6xl mb-4">404</h1>
          <p>Sorry, the page you are looking for does not exist.</p>
        </div>
      </div>
    </>
  );
};

export default Custom404;
