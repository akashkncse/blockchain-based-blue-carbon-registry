import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// 1. Create the wagmi config using the new getDefaultConfig method
const config = getDefaultConfig({
  appName: 'Carbon Credit Platform',
  projectId: 'c9114066fd3cca51f7f5bd53a3760929', // Get one from https://cloud.walletconnect.com
  chains: [polygonAmoy],
  ssr: false, // If your app is client-side only
});

// 2. Create a client for React Query
const queryClient = new QueryClient();

// 3. Render the app with the new providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);