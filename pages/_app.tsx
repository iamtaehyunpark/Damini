import type { AppProps } from 'next/app';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
