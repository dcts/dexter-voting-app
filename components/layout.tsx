import React, { useEffect } from 'react';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import Footer from '../components/Footer';
import toast, { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Head>
        <title>DeXter on Radix</title>
        <meta name="description" content="Dexter" />
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>

      <main className="overflow-x-hidden">{children}</main>

      <Footer />
    </div>
  );
}
