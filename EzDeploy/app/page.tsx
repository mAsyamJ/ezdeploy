
'use client';
import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import WalletConnect from './components/WalletConnect';
import ModularContractDeployer from './components/ModularContractDeployer';
import PrebuiltContractDeployer from './components/PrebuiltContractDeployer';
import ViewContract from './components/ViewContract';
import Navbar from './components/Navbar';
import {
  ChainOption,
  ActiveComponent,
} from './types';
export default function Home() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(null);
  const [viewContractAddress, setViewContractAddress] = useState('');
  const [viewContractChain, setViewContractChain] = useState(sepolia);
  const [viewContractError, setViewContractError] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [modalContractType, setModalContractType] = useState<string | null>(null);
  const chains = [
    { name: 'Sepolia (Testnet)', chain: sepolia },
    { name: 'Base Sepolia (Testnet)', chain: baseSepolia },
    { name: 'Ethereum Mainnet', chain: ethereum },
    { name: 'Polygon Mainnet', chain: polygon },
  ];
  // Function to reset back to card view
  const resetView = () => {
    setActiveComponent(null);
    setViewContractAddress('');
    setViewContractChain(sepolia);
    setViewContractError('');
  };
  // Function to handle contract deployment
  const handleDeploy = (contractType: string) => {
    if (!address) {
      setShowConnectModal(true);
      setModalContractType(contractType);
    } else {
      setActiveComponent(contractType as ActiveComponent);
    }
  };
  // Callback for when wallet connects
  const handleWalletConnect = () => {
    setShowConnectModal(false);
    if (modalContractType) {
      setActiveComponent(modalContractType as ActiveComponent);
      setModalContractType(null);
    }
  };
  // Use useEffect to close the modal when address becomes available
  useEffect(() => {
    if (address && showConnectModal) {
      setShowConnectModal(false); // Close the modal if the user is connected
      if (modalContractType) {
        setActiveComponent(modalContractType as ActiveComponent); // Set the active component
      }
    }
  }, [address, showConnectModal, modalContractType]);
  // Use useEffect to reset to home page when wallet disconnects
  useEffect(() => {
    if (!address && activeComponent) {
      setActiveComponent(null); // Reset to home page if disconnected
    }
  }, [address, activeComponent]);
  return (
    <main className='min-h-screen bg-gray-50 pt-[90px] pb-12'> {/* Added padding top to account for navbar */}
      <Navbar />
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold text-black'>
              Deploy Smart Contracts
            </h1>
            <WalletConnect onConnect={handleWalletConnect} />
          </div>
          {!activeComponent && (
            <div className='space-y-10'>
              {/* SECTION 1: Industry-Specific Contracts */}
              <div>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border border-blue-200 rounded-xl shadow mb-6'>
                  <h2 className='text-2xl font-semibold text-black'>
                    Industry-Specific Contracts
                  </h2>
                  <p className='text-gray-600'>
                    Pre-configured contracts tailored for specific industries and use cases
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow hover:shadow-xl transition-all duration-300 hover:scale-105'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      Gaming NFT Collection
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Optimized for in-game assets with metadata for game attributes
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow hover:shadow-xl transition-all duration-300 hover:scale-105'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      Membership Token
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      ERC721 with access control for membership and subscription services
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow hover:shadow-xl transition-all duration-300 hover:scale-105'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      Real Estate Token
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Fractional ownership with revenue distribution for property investments
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SECTION 2: Advanced Options */}
              <div>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border border-blue-200 rounded-xl shadow mb-6'>
                  <h2 className='text-2xl font-semibold text-black'>
                    Advanced Options
                  </h2>
                  <p className='text-gray-600'>
                    Fully customizable contract deployment with advanced features
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow hover:shadow-xl transition-all duration-300 hover:scale-105'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      Modular Contract
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Customize and deploy a modular contract with flexible options
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                  <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200 shadow hover:shadow-xl transition-all duration-300 hover:scale-105'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      Popular Contract
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Choose from pre-configured popular contracts for quick deployment
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('prebuilt')}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SECTION 3: Standard Contract Types */}
              <div>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border border-blue-200 rounded-xl shadow mb-6'>
                  <h2 className='text-2xl font-semibold text-black'>
                    Standard Contract Types
                  </h2>
                  <p className='text-gray-600'>
                    Deploy standard token contracts with basic configuration
                  </p>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg p-6 border border-purple-200 transition-transform duration-300 hover:scale-102'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      ERC20 Token
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Standard fungible token for cryptocurrencies and utility tokens
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                  <div className='bg-gradient-to-br from-pink-50 to-red-100 rounded-lg p-6 border border-pink-200 transition-transform duration-300 hover:scale-102'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      ERC721 NFT
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Non-fungible token for unique digital assets and collectibles
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                  <div className='bg-gradient-to-br from-green-50 to-teal-100 rounded-lg p-6 border border-green-200 transition-transform duration-300 hover:scale-102'>
                    <h3 className='text-xl font-semibold text-black mb-2'>
                      ERC1155 Multi-Token
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      Multi-token standard for both fungible and non-fungible tokens
                    </p>
                    <div className='flex justify-end'>
                      <button
                        onClick={() => handleDeploy('modular')}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show the selected component */}
          {address && activeComponent === 'modular' && (
            <div>
              <ModularContractDeployer onBack={resetView} />
            </div>
          )}
          {address && activeComponent === 'prebuilt' && (
            <div>
              <PrebuiltContractDeployer onBack={resetView} />
            </div>
          )}
          {address && activeComponent === 'view' && (
            <div>
              <ViewContract
                contractAddress={viewContractAddress}
                chain={viewContractChain}
                name=""
                imageUrl=""
                creator=""
                onBack={resetView}
              />
            </div>
          )}
          
          {/* Connection modal */}
          {!address && showConnectModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg relative">
                <h2 className="text-xl font-bold mb-4 mt-3 text-black text-center">Connect Your Wallet</h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-red-700 hover:bg-white text-white hover:text-red-700 border-2 border-red-700 hover:border-red-700 rounded-full font-medium transition-colors"
                >
                  X
                </button>
                <div className='flex justify-center'>
                  <WalletConnect onConnect={handleWalletConnect} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
// Compare this snippet from EzDeploy/app/types.ts: