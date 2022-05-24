import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import WithSubnavigation from '../components/Navbar';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    protBlue: {
      100: '#87b7fe',
      300: '#0b57ee',
      400: '#a2c5fa',
      900: '#4a5568',
      darkHover: '#222833',
    },
    protBlack: {
      100: '#1a202c',
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
    <ChakraProvider theme={theme}>
      <WithSubnavigation></WithSubnavigation>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
