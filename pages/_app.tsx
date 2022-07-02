import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { SSRProvider } from 'react-aria';
import 'react-datepicker/dist/react-datepicker.css';
import WithSubnavigation from '../components/Navbar';
import '../styles/globals.css';
import React from 'react';
import Head from 'next/head';
import Footer from '../components/Footer';

const theme = extendTheme({
  colors: {
    protBlue: {
      100: '#87b7fe',
      200: '#bed4f4',
      300: '#a2c5fa',
      400: '#0b57ee',
      900: '#4a5568',
      mediumHover: '#3a4351',
      darkHover: '#222833',
      lightHover: '#2f72f9',
      veryLightHover: '#8ab6f7',
    },
    blue: {
      500: '#87b7fe',
    },
    protBlack: {
      700: '#303a4e',
      800: '#1a202c',
    },
    protGray: {
      100: '#f5f5f5',
      300: '#e2e8f0',
      500: '#d9d9d9',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SSRProvider>
        <ChakraProvider theme={theme}>
          <Head>
            <title>PADA-ONE</title>
            <link
              rel="shortcut icon"
              href="/image/logo.png"
            />
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/image/logo.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/image/logo.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/image/logo.png"
            />
          </Head>
          <WithSubnavigation></WithSubnavigation>
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </SSRProvider>
    </>
  );
}

export default MyApp;
