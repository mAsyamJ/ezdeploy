
'use client';
import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import { Chain } from 'thirdweb/chains';
import NFTMetadataViewer from './NFTMetadataViewer';
// Define types for contract data
interface ContractData {
  address: string;
  name: string;
  contractType: string;
  chain: Chain;
  deploymentTimestamp: number;
}
interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function Dashboard({ isOpen, onClose }: DashboardProps) {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractData[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('contracts');
  const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e',
  });
  // Available chains for filtering
  const chains = [
    { name: 'All Chains', id: 'all' },
    { name: 'Sepolia (Testnet)', chain: sepolia, id: sepolia.id.toString() },
    { name: 'Base Sepolia (Testnet)', chain: baseSepolia, id: baseSepolia.id.toString() },
    { name: 'Ethereum Mainnet', chain: ethereum, id: ethereum.id.toString() },
    { name: 'Polygon Mainnet', chain: polygon, id: polygon.id.toString() },
  ];
  // Mock function to fetch deployed contracts
  const fetchDeployedContracts = async () => {
    if (!address) {
      setContracts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // This is a mock implementation
      // In a real app, you would use ThirdWeb SDK to fetch actual deployed contracts
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockContracts: ContractData[] = [
        {
          address: '0x1234567890123456789012345678901234567890',
          name: 'My ERC20 Token',
          contractType: 'ERC20',
          chain: sepolia,
          deploymentTimestamp: Date.now() - 86400000, // 1 day ago
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          name: 'Cool NFT Collection',
          contractType: 'ERC721',
          chain: baseSepolia,
          deploymentTimestamp: Date.now() - 172800000, // 2 days ago
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          name: 'Game Items',
          contractType: 'ERC1155',
          chain: ethereum,
          deploymentTimestamp: Date.now() - 259200000, // 3 days ago
        },
        {
          address: '0x4567890123456789012345678901234567890123',
          name: 'Reward Points',
          contractType: 'ERC20',
          chain: polygon,
          deploymentTimestamp: Date.now() - 345600000, // 4 days ago
        },
        {
          address: '0x5678901234567890123456789012345678901234',
          name: 'Art Collection',
          contractType: 'ERC721',
          chain: sepolia,
          deploymentTimestamp: Date.now() - 432000000, // 5 days ago
        },
      ];
      
      setContracts(mockContracts);
    } catch (err) {
      console.error('Error fetching deployed contracts:', err);
      setError('Failed to fetch your deployed contracts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch contracts when the dashboard opens or wallet changes
  useEffect(() => {
    if (isOpen) {
      fetchDeployedContracts();
    }
  }, [isOpen, address]);
  // Filter contracts based on selected chain and search query
  useEffect(() => {
    let filtered = [...contracts];
    
    // Filter by chain
    if (selectedChain !== 'all') {
      filtered = filtered.filter(contract => 
        contract.chain.id.toString() === selectedChain
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.name.toLowerCase().includes(query) || 
        contract.address.toLowerCase().includes(query) ||
        contract.contractType.toLowerCase().includes(query)
      );
    }
    
    setFilteredContracts(filtered);
  }, [contracts, selectedChain, searchQuery]);
  
  // Function to copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Address copied to clipboard!');
    });
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className={`fixed top-0 right-0 h-full glassmorphic transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-40 w-96 overflow-y-auto border-l border-indigo-100`}>
      <div className="p-6 border-b border-indigo-100">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Dashboard</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Dashboard Tabs */}
        <div className="mb-6 border-b border-indigo-100">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${activeTab === 'contracts' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' 
                  : 'text-gray-500 hover:text-indigo-500 transition-colors'}`}
                onClick={() => setActiveTab('contracts')}
              >
                My Contracts
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${activeTab === 'metadata' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium' 
                  : 'text-gray-500 hover:text-indigo-500 transition-colors'}`}
                onClick={() => setActiveTab('metadata')}
              >
                NFT Metadata Viewer
              </button>
            </li>
          </ul>
        </div>
        
        {/* Contracts Tab Content */}
        {activeTab === 'contracts' && (
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-indigo-700 mb-1">Filter by Chain</label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-1">Search Contracts</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or address"
                  className="w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            {/* Contract List */}
            <div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-4">Your Deployed Contracts</h3>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
                  {error}
                </div>
              ) : !address ? (
                <div className="bg-amber-50 p-4 rounded-lg text-amber-700 border border-amber-200">
                  Please connect your wallet to view your deployed contracts.
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200">
                  {contracts.length === 0 
                    ? "You haven't deployed any contracts yet." 
                    : "No contracts match your current filters."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContracts.map((contract) => (
                    <div key={contract.address} className="card bg-white bg-opacity-70 p-4 hover:bg-opacity-90">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-indigo-900">{contract.name}</h4>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-500 font-mono">
                              {contract.address.substring(0, 6)}...{contract.address.substring(38)}
                            </p>
                            <button 
                              onClick={() => copyToClipboard(contract.address)}
                              className="ml-2 text-indigo-500 hover:text-indigo-700 transition-colors"
                              title="Copy address"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contract.contractType === 'ERC20' ? 'bg-green-100 text-green-800' :
                          contract.contractType === 'ERC721' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {contract.contractType}
                        </span>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Chain: {contract.chain.name}</p>
                        <p>Deployed: {formatDate(contract.deploymentTimestamp)}</p>
                      </div>
                      
                      <div className="mt-3 flex space-x-3">
                        <button 
                          onClick={() => copyToClipboard(contract.address)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          Copy Address
                        </button>
                        <a 
                          href={`https://${contract.chain.id === 11155111 ? 'sepolia.' : contract.chain.id === 84532 ? 'sepolia.base' : contract.chain.id === 137 ? 'polygon' : ''}${contract.chain.id === 137 ? 'scan.com' : 'etherscan.io'}/address/${contract.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Refresh Button */}
            {address && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={fetchDeployedContracts}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg ${
                    isLoading ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'
                  } text-white font-medium`}
                >
                  {isLoading ? 'Refreshing...' : 'Refresh Contracts'}
                </button>
              </div>
            )}
          </>
        )}
        
        {/* NFT Metadata Viewer Tab Content */}
        {activeTab === 'metadata' && (
          <div className="mt-2">
            <NFTMetadataViewer />
          </div>
        )}
      </div>
    </div>
  );
}
