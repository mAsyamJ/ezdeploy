'use client';
import { ConnectButton } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { createThirdwebClient } from 'thirdweb';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
interface WalletConnectProps {
  onConnect?: () => void; // Optional callback for when wallet connects
}
export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e'
  });
  
  const wallets = [
    createWallet('io.metamask'),
    createWallet('com.coinbase.wallet'),
    createWallet('me.rainbow'),
    createWallet('io.rabby'),
    createWallet('io.zerion.wallet'),
  ];
  
  return (
    <div className="transform hover:scale-105 transition-transform">
      <ConnectButton
        client={client}
        wallets={wallets}
        theme='dark'
        connectModal={{ 
          size: 'compact',
          title: 'Connect Your Wallet',
          description: 'Connect to deploy smart contracts on the blockchain'
        }}
        onConnect={onConnect}
        style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontWeight: '500',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      />
    </div>
  );
}
