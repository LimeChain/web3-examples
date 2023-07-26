import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { sepolia } from 'wagmi/chains';

import Election from '../pages/Election';

import Header from './layout/Header';
import Footer from './layout/Footer';

function App() {
  const { publicClient, webSocketPublicClient } = configureChains(
    [sepolia],
    [infuraProvider({ apiKey: '7e97ae83d8ee45fb816ddf90f5c29cdc' })],
  );

  const config = createConfig({
    autoConnect: true,
    publicClient,
    webSocketPublicClient,
  });

  return (
    <BrowserRouter>
      <WagmiConfig config={config}>
        <div className="wrapper">
          <Header />
          <div className="main">
            <Routes>
              <Route path="/" element={<Election />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </WagmiConfig>
    </BrowserRouter>
  );
}

export default App;
