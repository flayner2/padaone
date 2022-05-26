import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import WithSubnavigation from '../components/Navbar';
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    protBlue: {
      100: '#87b7fe',
      300: '#a2c5fa',
      400: '#0b57ee',
      900: '#4a5568',
      darkHover: '#222833',
      lightHover: '#2f72f9',
      veryLightHover: '#8ab6f7',
    },
    blue: {
      500: '#87b7fe',
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
