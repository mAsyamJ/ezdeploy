
'use client';
import { useState, useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { useActiveAccount } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import { Chain } from 'thirdweb/chains';
import { getContract, readContract, writeContract } from 'thirdweb/contract';
// Define the metadata interface
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: any; // Allow for additional properties
}
interface NFTMetadataViewerProps {
  onBack?: () => void;
}
export default function NFTMetadataViewer({ onBack }: NFTMetadataViewerProps) {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  
  // Input states
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [selectedChain, setSelectedChain] = useState<Chain>(sepolia);
  
  // Metadata states
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [originalMetadata, setOriginalMetadata] = useState<NFTMetadata | null>(null);
  const [tokenURI, setTokenURI] = useState('');
  
  // Editing states
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedImageUrl, setEditedImageUrl] = useState('');
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [supportsMetadataUpdate, setSupportsMetadataUpdate] = useState(false);
  
  const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e',
  });
  
  // Available chains for selection
  const chains = [
    { name: 'Sepolia (Testnet)', chain: sepolia },
    { name: 'Base Sepolia (Testnet)', chain: baseSepolia },
    { name: 'Ethereum Mainnet', chain: ethereum },
    { name: 'Polygon Mainnet', chain: polygon },
  ];
  
  // Reset states when changing contract or token
  useEffect(() => {
    setMetadata(null);
    setOriginalMetadata(null);
    setTokenURI('');
    setEditedName('');
    setEditedDescription('');
    setEditedImageUrl('');
    setError(null);
    setSuccess(null);
    setSupportsMetadataUpdate(false);
  }, [contractAddress, tokenId, selectedChain]);
  
  // Update edited fields when metadata changes
  useEffect(() => {
    if (metadata) {
      setEditedName(metadata.name || '');
      setEditedDescription(metadata.description || '');
      setEditedImageUrl(metadata.image || '');
    }
  }, [metadata]);
  
  // Function to fetch tokenURI from contract
  const fetchTokenURI = async () => {
    if (!contractAddress || !tokenId) {
      setError('Contract address and token ID are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create contract instance
      const contract = getContract({
        client,
        chain: selectedChain,
        address: contractAddress,
      });
      
      // Check if contract supports tokenURI function
      try {
        const uri = await readContract({
          contract,
          method: 'tokenURI',
          params: [BigInt(tokenId)],
        });
        
        setTokenURI(uri as string);
        
        // Check if contract supports setTokenURI function
        try {
          // Just check if the function exists, don't actually call it
          const abi = await contract.getAbi();
          const hasSetTokenURI = abi.some(item => 
            item.type === 'function' && 
            (item.name === 'setTokenURI' || item.name === 'setURI')
          );
          setSupportsMetadataUpdate(hasSetTokenURI);
        } catch (e) {
          setSupportsMetadataUpdate(false);
        }
        
        // Fetch metadata from URI
        await fetchMetadata(uri as string);
      } catch (e) {
        setError('Failed to fetch tokenURI. Make sure the contract implements the ERC721Metadata interface.');
        setIsLoading(false);
      }
    } catch (e) {
      setError('Failed to connect to contract. Please check the contract address and network.');
      setIsLoading(false);
    }
  };
  
  // Function to fetch metadata from URI
  const fetchMetadata = async (uri: string) => {
    try {
      // Handle ipfs:// URIs
      let url = uri;
      if (uri.startsWith('ipfs://')) {
        url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMetadata(data);
      setOriginalMetadata(data);
      setIsLoading(false);
      setSuccess('Metadata loaded successfully');
    } catch (e) {
      setError('Failed to fetch metadata from URI. The URI might be invalid or inaccessible.');
      setIsLoading(false);
    }
  };
  
  // Function to update metadata on-chain
  const updateMetadata = async () => {
    if (!address || !contractAddress || !tokenId) {
      setError('Wallet connection, contract address, and token ID are required');
      return;
    }
    
    if (!supportsMetadataUpdate) {
      setError('This contract does not support metadata updates');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create contract instance
      const contract = getContract({
        client,
        chain: selectedChain,
        address: contractAddress,
      });
      
      // Create new metadata object
      const updatedMetadata: NFTMetadata = {
        ...originalMetadata,
        name: editedName,
        description: editedDescription,
        image: editedImageUrl,
      };
      
      // Upload metadata to IPFS or your preferred storage
      // For this example, we'll assume the contract has a setTokenURI function
      // that accepts a tokenId and a new URI
      
      // In a real implementation, you would:
      // 1. Upload the updated metadata to IPFS or your storage
      // 2. Get the new URI
      // 3. Call setTokenURI with the new URI
      
      // Mock implementation - in reality, you'd need to upload the metadata first
      try {
        await writeContract({
          contract,
          method: 'setTokenURI',
          params: [BigInt(tokenId), tokenURI], // In reality, this would be the new URI
          account: activeAccount,
        });
        
        setSuccess('Metadata updated on-chain successfully');
      } catch (e) {
        setError('Failed to update metadata on-chain. The contract might not support this operation or you might not have permission.');
      }
      
      setIsLoading(false);
    } catch (e) {
      setError('Failed to update metadata');
      setIsLoading(false);
    }
  };
  
  return (
    <div className='w-full'>
      <div className='glassmorphic rounded-xl p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
            NFT Metadata Viewer
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className='btn-secondary'
            >
              Back
            </button>
          )}
        </div>
        
        <div className='space-y-6'>
          {/* Input Section */}
          <div className='p-4 bg-white bg-opacity-50 rounded-xl shadow-sm'>
            <h3 className='text-lg font-semibold text-indigo-800 mb-4'>Fetch NFT Metadata</h3>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-indigo-700 mb-1'>
                  Contract Address
                </label>
                <input
                  type='text'
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                  placeholder='0x...'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-indigo-700 mb-1'>
                  Token ID
                </label>
                <input
                  type='text'
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                  placeholder='1'
                  required
                />
              </div>
            </div>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-indigo-700 mb-1'>
                Chain
              </label>
              <select
                value={selectedChain.id}
                onChange={(e) => {
                  const chain = chains.find(
                    (c) => c.chain.id === Number(e.target.value)
                  )?.chain;
                  if (chain) setSelectedChain(chain);
                }}
                className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
              >
                {chains.map((chain) => (
                  <option key={chain.chain.id} value={chain.chain.id}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={fetchTokenURI}
              disabled={!contractAddress || !tokenId || isLoading}
              className={`px-4 py-2 rounded-lg ${
                !contractAddress || !tokenId || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'btn-primary'
              } text-white font-medium`}
            >
              {isLoading ? 'Loading...' : 'Fetch Metadata'}
            </button>
          </div>
          
          {/* Status Messages */}
          {error && (
            <div className='p-4 bg-red-50 rounded-lg border border-red-200'>
              <p className='text-red-700'>{error}</p>
            </div>
          )}
          
          {success && (
            <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
              <p className='text-green-700'>{success}</p>
            </div>
          )}
          
          {/* Metadata Display */}
          {metadata && (
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-indigo-800 mb-4'>NFT Metadata</h3>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Image Preview */}
                <div className='bg-white bg-opacity-50 p-6 rounded-xl shadow-sm'>
                  <h4 className='text-md font-medium text-indigo-800 mb-3'>Image Preview</h4>
                  {metadata.image ? (
                    <img
                      src={metadata.image}
                      alt={metadata.name || 'NFT Image'}
                      className='max-w-full h-auto rounded-lg shadow-md'
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                      }}
                    />
                  ) : (
                    <div className='w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Metadata Details */}
                <div className='bg-white bg-opacity-50 p-6 rounded-xl shadow-sm'>
                  <h4 className='text-md font-medium text-indigo-800 mb-3'>Token Details</h4>
                  
                  <div className='space-y-3'>
                    <div className='p-3 bg-white bg-opacity-70 rounded-lg'>
                      <span className='font-medium text-indigo-700'>Name:</span> {metadata.name || 'N/A'}
                    </div>
                    <div className='p-3 bg-white bg-opacity-70 rounded-lg'>
                      <span className='font-medium text-indigo-700'>Description:</span> {metadata.description || 'N/A'}
                    </div>
                    <div className='p-3 bg-white bg-opacity-70 rounded-lg'>
                      <span className='font-medium text-indigo-700'>Token URI:</span> 
                      <div className='mt-1 font-mono text-sm break-all'>{tokenURI || 'N/A'}</div>
                    </div>
                    
                    {/* Attributes */}
                    {metadata.attributes && metadata.attributes.length > 0 && (
                      <div className='p-3 bg-white bg-opacity-70 rounded-lg'>
                        <span className='font-medium text-indigo-700'>Attributes:</span>
                        <div className='mt-2 grid grid-cols-2 gap-2'>
                          {metadata.attributes.map((attr, index) => (
                            <div key={index} className='bg-white p-2 rounded-md text-sm'>
                              <span className='font-medium text-indigo-700'>{attr.trait_type}:</span> {attr.value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Metadata Editor */}
          {metadata && (
            <div className='mb-6 bg-white bg-opacity-50 p-6 rounded-xl shadow-sm'>
              <h3 className='text-lg font-semibold text-indigo-800 mb-3'>Edit Metadata</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Make changes to the metadata below. Note that these changes are local only unless you update the metadata on-chain.
                {supportsMetadataUpdate 
                  ? ' This contract supports metadata updates.' 
                  : ' This contract does not appear to support metadata updates.'}
              </p>
              
              <div className='space-y-4'>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-indigo-700 mb-1'>
                    Name
                  </label>
                  <input
                    type='text'
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                  />
                </div>
                
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-indigo-700 mb-1'>
                    Description
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                    rows={4}
                  />
                </div>
                
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-indigo-700 mb-1'>
                    Image URL
                  </label>
                  <input
                    type='text'
                    value={editedImageUrl}
                    onChange={(e) => setEditedImageUrl(e.target.value)}
                    className='w-full p-2 border border-indigo-200 rounded-lg text-gray-700 bg-white bg-opacity-70 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all'
                  />
                </div>
                
                {/* Preview of edited image */}
                {editedImageUrl && editedImageUrl !== metadata.image && (
                  <div className='mb-4'>
                    <label className='block text-sm font-medium text-indigo-700 mb-1'>
                      New Image Preview
                    </label>
                    <img
                      src={editedImageUrl}
                      alt="New image preview"
                      className='mt-1 max-w-xs h-auto rounded-lg shadow-md'
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
                
                {/* Update Button */}
                <button
                  onClick={updateMetadata}
                  disabled={!address || !supportsMetadataUpdate || isLoading}
                  className={`px-4 py-2 rounded-lg ${
                    !address || !supportsMetadataUpdate || isLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'btn-secondary'
                  } text-white font-medium`}
                >
                  {isLoading ? 'Updating...' : 'Update Metadata On-Chain'}
                </button>
                
                {!supportsMetadataUpdate && (
                  <p className='text-sm text-amber-600 mt-2'>
                    This contract does not appear to support on-chain metadata updates.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}