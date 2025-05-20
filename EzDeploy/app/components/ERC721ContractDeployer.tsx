'use client';
import { useState, useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { deployModularContract } from 'thirdweb/modules';
import { upload, resolveScheme } from "thirdweb/storage";
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import { Chain } from 'thirdweb/chains';
import ViewContract from './ViewContract';
interface ERC721ContractDeployerProps {
  onBack?: () => void;
}
export default function ERC721ContractDeployer({ onBack }: ERC721ContractDeployerProps) {
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const address = activeAccount?.address;
  
  const { data: balanceData, isLoading: isBalanceLoading } = useWalletBalance({
    client: createThirdwebClient({
      clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e',
    }),
    chain: sepolia,
    address,
  });
  
  // Basic NFT Information
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [baseURI, setBaseURI] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // NFT Features
  const [isMintable, setIsMintable] = useState(true);
  const [isBurnable, setIsBurnable] = useState(false);
  const [isPausable, setIsPausable] = useState(false);
  const [isUpdatableURI, setIsUpdatableURI] = useState(false);
  const [hasAccessControl, setHasAccessControl] = useState(false);
  const [hasSupplyTracking, setHasSupplyTracking] = useState(true);
  const [hasRoyalties, setHasRoyalties] = useState(false);
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5);
  const [isSoulbound, setIsSoulbound] = useState(false);
  const [isUpgradeable, setIsUpgradeable] = useState(false);
  
  // Additional ERC721 Features
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [hasPermit, setHasPermit] = useState(false);
  const [isCapped, setIsCapped] = useState(false);
  const [maxSupply, setMaxSupply] = useState('10000');
  
  // Deployment settings
  const [ownerAddress, setOwnerAddress] = useState('');
  const [primarySaleRecipient, setPrimarySaleRecipient] = useState('');
  const [selectedChain, setSelectedChain] = useState(sepolia);
  const [contractAddress, setContractAddress] = useState('');
  const [deployError, setDeployError] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showViewContract, setShowViewContract] = useState(false);
  const [urlUploadMessage, setUrlUploadMessage] = useState('');
  
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
  
  useEffect(() => {
    if (address) {
      setOwnerAddress(address);
      setPrimarySaleRecipient(address);
      setRoyaltyRecipient(address);
    }
  }, [address]);
  
  // Function to copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Address copied to clipboard!');
    });
  };
  
  const deployContract = async () => {
    if (!address) {
      setDeployError('Please connect your wallet first.');
      return;
    }
    
    if (!activeWallet) {
      setDeployError('No active wallet found. Please ensure your wallet is connected.');
      return;
    }
    
    if (!name || !symbol) {
      setDeployError('Name and Symbol are required.');
      return;
    }
    
    // Check wallet balance
    if (isBalanceLoading) {
      setDeployError('Checking wallet balance, please wait...');
      return;
    }
    
    setIsDeploying(true);
    setDeployError('');
    setContractAddress('');
    
    try {
      // Upload image using ThirdWeb storage
      let uploadedImageUrl = '';
      if (image) {
        try {
          setUrlUploadMessage('Uploading image...');
          const uri = await upload({ client, files: [image] });
          // Resolve the ipfs:// URI to an https:// URI
          const resolvedUri = await resolveScheme({
            client,
            uri,
          });
          uploadedImageUrl = resolvedUri;
          setImageUrl(uploadedImageUrl);
        } catch (error) {
          setDeployError("Image upload failed. Check your network or Thirdweb setup and try again.");
          setIsDeploying(false);
          throw new Error("Image upload failed. Please try again.");
        }
      }
      
      // Prepare contract parameters
      const contractParams = {
        name,
        symbol,
        description: description || undefined,
        image: uploadedImageUrl || undefined,
        owner: ownerAddress || address,
        primarySaleRecipient: primarySaleRecipient || address,
        royaltyRecipient: hasRoyalties ? (royaltyRecipient || address) : undefined,
        royaltyBps: hasRoyalties ? BigInt(royaltyPercentage * 100) : undefined,
        baseURI: baseURI || undefined,
        // Additional parameters would be added here based on selected features
      };
      
      // Deploy the contract
      const deployedAddress = await deployModularContract({
        chain: selectedChain,
        client,
        account: activeAccount,
        core: 'ERC721',
        params: contractParams,
        // Modules would be added here based on selected features
      });
      
      setContractAddress(deployedAddress);
      setIsDeploying(false);
    } catch (err: any) {
      setIsDeploying(false);
      setDeployError('Deployment failed: ' + err.message);
    }
  };
  
  const resetForm = () => {
    setContractAddress('');
    setName('');
    setSymbol('');
    setDescription('');
    setBaseURI('');
    setImage(null);
    setImageUrl('');
    setOwnerAddress(address || '');
    setPrimarySaleRecipient(address || '');
    setRoyaltyRecipient(address || '');
    setRoyaltyPercentage(5);
    setDeployError('');
    setIsDeploying(false);
    
    // Reset NFT features
    setIsMintable(true);
    setIsBurnable(false);
    setIsPausable(false);
    setIsUpdatableURI(false);
    setHasAccessControl(false);
    setHasSupplyTracking(true);
    setHasRoyalties(false);
    setIsSoulbound(false);
    setIsUpgradeable(false);
    setHasSnapshot(false);
    setHasPermit(false);
    setIsCapped(false);
    setMaxSupply('10000');
  };
  
  return (
    <div className='max-w-4xl mx-auto px-4'>
      {!contractAddress && (
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-black'>
              Configure ERC721 NFT Contract
            </h2>
            {onBack && (
              <button
                onClick={onBack}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium'
              >
                Back
              </button>
            )}
          </div>
          
          <div className='space-y-4'>
            {/* Basic NFT Information */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Basic NFT Information</h3>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Collection Name (required) *
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='My Awesome NFTs'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Collection Symbol (required) *
                </label>
                <input
                  type='text'
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='AWESOME'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='Describe your NFT collection'
                  rows={3}
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Base URI (Optional)
                </label>
                <input
                  type='text'
                  value={baseURI}
                  onChange={(e) => setBaseURI(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='ipfs://QmYourCID/'
                />
                <p className='text-xs text-gray-700 mt-1'>
                  The base URI for all token metadata. Individual token URIs will be baseURI + tokenId.
                </p>
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Collection Image
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
                {image && (
                  <div className='mt-2'>
                    <img
                      src={URL.createObjectURL(image)}
                      alt='Preview'
                      className='max-w-[200px] h-auto'
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* NFT Features */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>NFT Features</h3>
              
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='mintable'
                    checked={isMintable}
                    onChange={(e) => setIsMintable(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='mintable' className='text-black'>
                    Mintable - Allow creating new NFTs after deployment
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='burnable'
                    checked={isBurnable}
                    onChange={(e) => setIsBurnable(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='burnable' className='text-black'>
                    Burnable - Allow NFT holders to burn (destroy) their tokens
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='pausable'
                    checked={isPausable}
                    onChange={(e) => setIsPausable(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='pausable' className='text-black'>
                    Pausable - Allow pausing all token transfers in emergencies
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='updatableURI'
                    checked={isUpdatableURI}
                    onChange={(e) => setIsUpdatableURI(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='updatableURI' className='text-black'>
                    Updatable Token URIs - Allow changing NFT metadata after minting
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='accessControl'
                    checked={hasAccessControl}
                    onChange={(e) => setHasAccessControl(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='accessControl' className='text-black'>
                    Access Control - Role-based permissions for contract functions
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='supplyTracking'
                    checked={hasSupplyTracking}
                    onChange={(e) => setHasSupplyTracking(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='supplyTracking' className='text-black'>
                    Supply Tracking - Keep count of all minted NFTs
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='capped'
                    checked={isCapped}
                    onChange={(e) => setIsCapped(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='capped' className='text-black'>
                    Capped Supply - Set maximum token supply
                  </label>
                </div>
                
                {isCapped && (
                  <div className='ml-6 mt-2'>
                    <label className='block text-sm font-medium text-black'>
                      Maximum Supply
                    </label>
                    <input
                      type='text'
                      value={maxSupply}
                      onChange={(e) => setMaxSupply(e.target.value)}
                      className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                      placeholder='10000'
                    />
                  </div>
                )}
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='snapshot'
                    checked={hasSnapshot}
                    onChange={(e) => setHasSnapshot(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='snapshot' className='text-black'>
                    Snapshot - Track historical balances
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='permit'
                    checked={hasPermit}
                    onChange={(e) => setHasPermit(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='permit' className='text-black'>
                    Permit - Gasless approvals with signatures
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='royalties'
                    checked={hasRoyalties}
                    onChange={(e) => setHasRoyalties(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='royalties' className='text-black'>
                    ERC2981 Royalties - Collect fees on secondary sales
                  </label>
                </div>
                
                {hasRoyalties && (
                  <div className='ml-6 space-y-3'>
                    <div>
                      <label className='block text-sm font-medium text-black'>
                        Royalty Recipient Address
                      </label>
                      <input
                        type='text'
                        value={royaltyRecipient}
                        onChange={(e) => setRoyaltyRecipient(e.target.value)}
                        className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                        placeholder='0x...'
                      />
                      <p className='text-xs text-gray-700 mt-1'>
                        The address that will receive royalties from secondary sales.
                      </p>
                    </div>
                    
                    <div>
                      <label className='block text-sm font-medium text-black'>
                        Royalty Percentage
                      </label>
                      <input
                        type='number'
                        min="0"
                        max="100"
                        value={royaltyPercentage}
                        onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                        className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                        placeholder='5'
                      />
                      <p className='text-xs text-gray-700 mt-1'>
                        The percentage of sales to collect as royalties (e.g., 5 for 5%).
                      </p>
                    </div>
                  </div>
                )}
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='soulbound'
                    checked={isSoulbound}
                    onChange={(e) => setIsSoulbound(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='soulbound' className='text-black'>
                    Soulbound (Non-transferable) - NFTs cannot be transferred after minting
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='upgradeable'
                    checked={isUpgradeable}
                    onChange={(e) => setIsUpgradeable(e.target.checked)}
                    className='mr-2'
                  />
                  <label htmlFor='upgradeable' className='text-black'>
                    Upgradeable Contract - Allow updating contract logic in the future
                  </label>
                </div>
              </div>
            </div>
            
            {/* Deployment Settings */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Deployment Settings</h3>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Owner Address
                </label>
                <input
                  type='text'
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder='Owner Address'
                  className='mt-1 block w-full p-2 border rounded-md text-black'
                  required
                />
                <p className='text-xs text-gray-700 mt-1'>
                  The address that will own and control the contract.
                </p>
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Primary Sale Recipient
                </label>
                <input
                  type='text'
                  value={primarySaleRecipient}
                  onChange={(e) => setPrimarySaleRecipient(e.target.value)}
                  placeholder='Primary Sale Recipient'
                  className='mt-1 block w-full p-2 border rounded-md text-black'
                  required
                />
                <p className='text-xs text-gray-700 mt-1'>
                  The address that will receive the primary sale proceeds.
                </p>
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Chain *
                </label>
                <p className='text-xs text-gray-700 mt-1'>
                  Select a network to deploy this contract on. We recommend
                  starting with a testnet
                </p>
                <select
                  required
                  value={selectedChain.id}
                  onChange={(e) => {
                    const chain = chains.find(
                      (c) => c.chain.id === Number(e.target.value)
                    )?.chain;
                    if (chain) setSelectedChain(chain);
                  }}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                >
                  {chains.map((chain) => (
                    <option key={chain.chain.id} value={chain.chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Deploy Button */}
            <button
              onClick={deployContract}
              disabled={!address || !name || !symbol || isDeploying}
              className={`px-4 py-2 rounded-lg ${
                !address || !name || !symbol || isDeploying
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium`}
            >
              {isDeploying ? <>Deploying...</> : 'Deploy NFT Contract'}
            </button>
          </div>
        </div>
      )}
      
      {/* Deployment in Progress Message */}
      {isDeploying && (
        <div className='p-4 bg-blue-50 rounded-lg mt-4'>
          <h4 className='text-blue-700 font-semibold'>Deploying contract... Please wait... This may take a few minutes.</h4>
          <p className='text-blue-600'>
            Your wallet will prompt you to sign the transaction.
          </p>
        </div>
      )}
      
      {/* Success Message */}
      {contractAddress && !isDeploying && (
        <div className='p-4 bg-green-50 rounded-lg'>
          <p className='text-green-700'>
            Contract deployed at:{' '}
            <code className='bg-green-100 px-2 py-1 rounded'>
              {contractAddress}
            </code>
            <button
              onClick={() => copyToClipboard(contractAddress)}
              className="ml-2 text-green-700 hover:text-green-900"
              title="Copy address"
            >
              📋
            </button>
          </p>
          <div className='mt-2 flex space-x-2 gap-4'>
            <button
              onClick={() => setShowViewContract(true)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              View Contract
            </button>
            <button
              onClick={resetForm}
              className='mt-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium'
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      {deployError && (
        <div className='p-4 bg-red-50 rounded-lg mt-4'>
          <p className='text-red-700'>{deployError}</p>
        </div>
      )}
      
      {showViewContract && (
        <ViewContract
          contractAddress={contractAddress}
          chain={selectedChain}
          name={name}
          imageUrl={imageUrl}
          creator={ownerAddress || address || ''}
          onBack={() => setShowViewContract(false)}
        />
      )}
    </div>
  );
}
// Add any additional helper functions or components here