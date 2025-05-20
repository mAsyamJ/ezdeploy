'use client';
import { useState, useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { deployModularContract } from 'thirdweb/modules';
import { upload, resolveScheme } from "thirdweb/storage";
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import { Chain } from 'thirdweb/chains';
import ViewContract from './ViewContract';
import { Industry, FinanceUseCase, TokenFeatures, UseCaseConfig } from '../types';
interface ERC20UseCaseDeployerProps {
  onBack?: () => void;
}
export default function ERC20UseCaseDeployer({ onBack }: ERC20UseCaseDeployerProps) {
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
  
  // Industry and Use Case Selection
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('Finance');
  const [selectedUseCase, setSelectedUseCase] = useState<FinanceUseCase>('Payment Tokens');
  
  // Basic Token Information
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [initialSupply, setInitialSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('18');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // Token Features
  const [tokenFeatures, setTokenFeatures] = useState<TokenFeatures>({
    isMintable: true,
    isBurnable: false,
    isPausable: false,
    isCapped: false,
    hasAccessControl: false,
    hasSnapshot: false,
    hasPermit: false
  });
  
  // Additional settings
  const [maxSupply, setMaxSupply] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [primarySaleRecipient, setPrimarySaleRecipient] = useState('');
  
  // Deployment settings
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
  
  // Industry options
  const industries: Industry[] = ['Finance', 'Gaming', 'Social', 'Commerce'];
  
  // Use case configurations
  const financeUseCases: Record<FinanceUseCase, UseCaseConfig> = {
    'Payment Tokens': {
      name: 'Payment Tokens',
      description: 'Used for cross-border payments, digital currency, or settlement.',
      features: {
        isMintable: true,
        isBurnable: true,
        isPausable: true,
        isCapped: false,
        hasAccessControl: true,
        hasSnapshot: false,
        hasPermit: true
      },
      recommendedDecimals: 18
    },
    'Staking & Yield Farming': {
      name: 'Staking & Yield Farming',
      description: 'Tokens for staking in DeFi protocols or yield farming strategies.',
      features: {
        isMintable: true,
        isBurnable: true,
        isPausable: true,
        isCapped: true,
        hasAccessControl: true,
        hasSnapshot: true,
        hasPermit: true
      },
      recommendedDecimals: 18
    },
    'Crowdfunding': {
      name: 'Crowdfunding (ICO Tokens)',
      description: 'Issued during an Initial Coin Offering to raise capital for a project.',
      features: {
        isMintable: true,
        isBurnable: true,
        isPausable: true,
        isCapped: true,
        hasAccessControl: true,
        hasSnapshot: false,
        hasPermit: false
      },
      recommendedDecimals: 18
    }
  };
  
  // Get use cases based on selected industry
  const getUseCases = () => {
    switch (selectedIndustry) {
      case 'Finance':
        return Object.keys(financeUseCases) as FinanceUseCase[];
      default:
        return ['Payment Tokens', 'Staking & Yield Farming', 'Crowdfunding'] as FinanceUseCase[];
    }
  };
  
  // Get configuration for selected use case
  const getUseCaseConfig = (): UseCaseConfig => {
    if (selectedIndustry === 'Finance') {
      return financeUseCases[selectedUseCase];
    }
    // Default to Payment Tokens if no match
    return financeUseCases['Payment Tokens'];
  };
  
  // Update token features when use case changes
  useEffect(() => {
    const config = getUseCaseConfig();
    setTokenFeatures(config.features);
    setDecimals(config.recommendedDecimals.toString());
  }, [selectedIndustry, selectedUseCase]);
  
  // Set default addresses when wallet connects
  useEffect(() => {
    if (address) {
      setOwnerAddress(address);
      setPrimarySaleRecipient(address);
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
    
    if (tokenFeatures.isCapped && (!maxSupply || parseInt(maxSupply) <= 0)) {
      setDeployError('Maximum supply is required when using capped supply feature.');
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
        // Additional parameters would be added here based on selected features
      };
      
      // Deploy the contract
      const deployedAddress = await deployModularContract({
        chain: selectedChain,
        client,
        account: activeAccount,
        core: 'ERC20',
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
    setInitialSupply('1000000');
    setDecimals('18');
    setImage(null);
    setImageUrl('');
    setOwnerAddress(address || '');
    setPrimarySaleRecipient(address || '');
    setDeployError('');
    setIsDeploying(false);
    
    // Reset to default industry and use case
    setSelectedIndustry('Finance');
    setSelectedUseCase('Payment Tokens');
    
    // Reset token features to default
    setTokenFeatures({
      isMintable: true,
      isBurnable: false,
      isPausable: false,
      isCapped: false,
      hasAccessControl: false,
      hasSnapshot: false,
      hasPermit: false
    });
    
    setMaxSupply('');
  };
  
  return (
    <div className='max-w-4xl mx-auto px-4'>
      {!contractAddress && (
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-black'>
              Industry-Specific ERC20 Token
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
            {/* Step 1: Industry Selection */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 1: Select Industry</h3>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value as Industry)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-700 mt-1'>
                  Select the industry your token will be used in.
                </p>
              </div>
            </div>
            
            {/* Step 2: Use Case Selection */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 2: Select Use Case</h3>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Use Case
                </label>
                <select
                  value={selectedUseCase}
                  onChange={(e) => setSelectedUseCase(e.target.value as FinanceUseCase)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                >
                  {getUseCases().map((useCase) => (
                    <option key={useCase} value={useCase}>
                      {useCase}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-700 mt-1'>
                  {getUseCaseConfig().description}
                </p>
              </div>
            </div>
            
            {/* Step 3: Token Configuration */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 3: Configure Token</h3>
              
              {/* Basic Token Information */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Token Name (required) *
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='My Token'
                  required
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Token Symbol (required) *
                </label>
                <input
                  type='text'
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='MTK'
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
                  placeholder='Describe your token here'
                  rows={3}
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Initial Supply
                </label>
                <input
                  type='text'
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='1000000'
                />
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Decimals
                </label>
                <input
                  type='text'
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='18'
                />
                <p className='text-xs text-gray-700 mt-1'>
                  Standard is 18 decimals, like ETH. {getUseCaseConfig().recommendedDecimals} is recommended for this use case.
                </p>
              </div>
              
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Token Image
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
            
            {/* Step 4: Token Features */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 4: Token Features</h3>
              <p className='text-sm text-gray-600 mb-3'>
                These features have been optimized for {selectedUseCase} in the {selectedIndustry} industry.
              </p>
              
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='mintable'
                    checked={tokenFeatures.isMintable}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isMintable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='mintable' className='text-black'>
                    Mintable - Allow creating new tokens
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='burnable'
                    checked={tokenFeatures.isBurnable}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isBurnable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='burnable' className='text-black'>
                    Burnable - Allow destroying tokens
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='pausable'
                    checked={tokenFeatures.isPausable}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isPausable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='pausable' className='text-black'>
                    Pausable - Allow pausing token transfers
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='capped'
                    checked={tokenFeatures.isCapped}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isCapped: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='capped' className='text-black'>
                    Capped Supply - Set maximum token supply
                  </label>
                </div>
                
                {tokenFeatures.isCapped && (
                  <div className='ml-6 mt-2'>
                    <label className='block text-sm font-medium text-black'>
                      Maximum Supply
                    </label>
                    <input
                      type='text'
                      value={maxSupply}
                      onChange={(e) => setMaxSupply(e.target.value)}
                      className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                      placeholder='10000000'
                    />
                  </div>
                )}
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='accessControl'
                    checked={tokenFeatures.hasAccessControl}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasAccessControl: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='accessControl' className='text-black'>
                    Access Control - Role-based permissions
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='snapshot'
                    checked={tokenFeatures.hasSnapshot}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasSnapshot: e.target.checked})}
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
                    checked={tokenFeatures.hasPermit}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasPermit: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='permit' className='text-black'>
                    Permit - Gasless approvals with signatures
                  </label>
                </div>
              </div>
            </div>
            
            {/* Step 5: Deployment Settings */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 5: Deployment Settings</h3>
              
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
              {isDeploying ? <>Deploying...</> : 'Deploy Token'}
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
// Note: This code is a simplified version and may require additional error handling and validation based on your specific requirements.