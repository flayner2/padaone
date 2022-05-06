import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import WithSubnavigation from '../components/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WithSubnavigation></WithSubnavigation>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
