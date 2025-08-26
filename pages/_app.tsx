import type { AppProps } from 'next/app';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/globals.css';
import dynamic from 'next/dynamic';

const SessionGate = dynamic(() => import('@/components/SessionGate'), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionGate>
      <Component {...pageProps} />
    </SessionGate>
  );
}
