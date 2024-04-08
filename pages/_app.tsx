import '../styles/globals.css';
import type { AppProps } from 'next/app';
import RootLayout from '../components/layout';
import toast, { Toaster } from 'react-hot-toast';

function Dexter({ Component, pageProps }: AppProps) {
  console.error = function () {};

  return (
    <RootLayout>
      <Component {...pageProps} />
      <Toaster position="bottom-center" reverseOrder={false} />
    </RootLayout>
  );
}

export default Dexter;
