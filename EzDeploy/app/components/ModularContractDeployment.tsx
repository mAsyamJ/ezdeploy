
'use client';
import { useState, useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { deployModularContract } from 'thirdweb/modules';
import { upload, resolveScheme } from "thirdweb/storage";
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import ViewContract from './ViewContract';
import {
  ChainOption,
  CoreType,
  Subcategory,
  ModularContractDeployerProps,
} from '../types';
export default function ModularContractDeployer({
  prefilledCoreType,
  prefilledSubcategory,
  prefilledModules,
  prefilledPrimarySaleRecipient,
  prefilledRoyaltyRecipient,
  prefilledTransferValidatorAddress = '0x0000000000000000000000000000000000000000',
  prefilledOwnerAddress,
  onBack,
  isPrefilled = false
}: ModularContractDeployerProps) {
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet(); // Use active wallet for signing
  const address = activeAccount?.address;
  const { data: balanceData, isLoading: isBalanceLoading } = useWalletBalance({
    client: createThirdwebClient({
      clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e',
    }),
    chain: sepolia, // Use selectedChain in production
    address,
  });
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(''); // Store the uploaded image URL
  const [ownerAddress, setOwnerAddress] = useState(prefilledOwnerAddress || '');
  const [primarySaleRecipient, setPrimarySaleRecipient] = useState('');
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(0);
  const [transferValidatorAddress, setTransferValidatorAddress] = useState(
    '0x0000000000000000000000000000000000000000'
  );
  const [startTokenId, setStartTokenId] = useState(0);
  const [tokenURI, setTokenURI] = useState(''); // For ERC721
  const [selectedChain, setSelectedChain] = useState(sepolia); // Default to Sepolia
  const [contractAddress, setContractAddress] = useState('');
  const [deployError, setDeployError] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [coreType, setCoreType] = useState<CoreType>(
    prefilledCoreType || 'ERC20'
  );
  const [subcategory, setSubcategory] = useState<Subcategory>(
    prefilledSubcategory || 'Token'
  );
  const [showViewContract, setShowViewContract] = useState(false); // State to show ViewContract
  const [urlUploadMessage, setUrlUploadMessage] = useState('');
  
  // ERC20 specific features
  const [initialSupply, setInitialSupply] = useState('1000000');
  const [decimals, setDecimals] = useState('18');
  const [isMintable, setIsMintable] = useState(false);
  const [isBurnable, setIsBurnable] = useState(false);
  const [isPausable, setIsPausable] = useState(false);
  const [isCapped, setIsCapped] = useState(false);
  const [maxSupply, setMaxSupply] = useState('');
  const [hasAccessControl, setHasAccessControl] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [hasPermit, setHasPermit] = useState(false);
  
  const client = createThirdwebClient({
    clientId: process.env.THIRDWEB_CLIENT_ID || '2f654d0179741f6776fa108a9683038e',
  });
  const coreSubcategories: Record<CoreType, Subcategory[]> = {
    ERC20: ['Token', 'Token Drop'],
    ERC721: ['NFT Collection', 'NFT Drop', 'Open Edition'],
    ERC1155: ['Edition', 'Edition Drop'],
  };
  // Available chains for selection
  const chains: ChainOption[] = [
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
  }, [address, prefilledOwnerAddress, prefilledPrimarySaleRecipient, prefilledRoyaltyRecipient]);
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
   
    setIsDeploying(true); // Start deployment, disable button
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
      const getParamsForSubcategory = (sub: Subcategory) => {
        const baseParams = {
          name,
          symbol,
          description: description || undefined,
          image: uploadedImageUrl || undefined,
          owner: ownerAddress,
          primarySaleRecipient: primarySaleRecipient || ownerAddress,
        };
        if (coreType === 'ERC20') {
          if (sub === 'Token') return baseParams;
          if (sub === 'Token Drop')
            return { ...baseParams, claimRecipient: ownerAddress };
        }
        if (coreType === 'ERC721') {
          if (sub === 'NFT Collection') return { ...baseParams, tokenURI };
          if (sub === 'NFT Drop')
            return {
              ...baseParams,
              tokenURI,
              royaltyRecipient,
              royaltyBps: BigInt(royaltyPercentage * 100),
              transferValidatorAddress,
            };
        }
        if (coreType === 'ERC1155') {
          if (sub === 'Edition') return { ...baseParams, startTokenId };
          if (sub === 'Edition Drop')
            return {
              ...baseParams,
              startTokenId,
              royaltyRecipient,
              royaltyBps: BigInt(royaltyPercentage * 100),
              transferValidatorAddress,
            };
        }
        return baseParams; // Default fallback
      };
      
      const params = getParamsForSubcategory(subcategory);
      
      // Deploy without modules
      const deployedAddress = await deployModularContract({
        chain: selectedChain,
        client,
        account: activeAccount,
        core: coreType,
        params: params,
        //modules omitted for now
      });
      
      setContractAddress(deployedAddress);
      setIsDeploying(false); // Deployment complete, re-enable button
    } catch (err: any) {
      setIsDeploying(false); // Error occurred, re-enable button
      setDeployError('Deployment failed: ' + err.message);
    }
  };
  const resetForm = () => {
    setContractAddress('');
    setName('');
    setSymbol('');
    setDescription('');
    setImage(null);
    setImageUrl('');
    setOwnerAddress(address || '');
    setPrimarySaleRecipient(address || '');
    setRoyaltyRecipient(address || '');
    setRoyaltyPercentage(0);
    setTransferValidatorAddress('0x0000000000000000000000000000000000000000');
    setStartTokenId(0);
    setTokenURI('');
    setDeployError('');
    setCoreType(prefilledCoreType || 'ERC20');
    setSubcategory(prefilledSubcategory || 'Token');
    setIsDeploying(false);
    
    // Reset ERC20 specific features
    setInitialSupply('1000000');
    setDecimals('18');
    setIsMintable(false);
    setIsBurnable(false);
    setIsPausable(false);
    setIsCapped(false);
    setMaxSupply('');
    setHasAccessControl(false);
    setHasSnapshot(false);
    setHasPermit(false);
  };
  return (
    <div className='max-w-4xl mx-auto px-4'>
      {/* Form for metadata and chain selection */}
      {!contractAddress && (
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-black'>
              Configure {coreType === 'ERC20' ? 'Token' : coreType === 'ERC721' ? 'NFT' : 'Edition'} Contract
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
          <div className='flex space-x-4 mb-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-black'>
                Contract Type
              </label>
              <select
                value={coreType}
                onChange={(e) => setCoreType(e.target.value as CoreType)}
                className='mt-1 block w-full p-2 border rounded-md text-black disabled:bg-gray-200 disabled:cursor-not-allowed'
                disabled={isPrefilled} // Disable if prefilled
              >
                <option value='ERC20'>ERC20</option>
                <option value='ERC721'>ERC721</option>
                <option value='ERC1155'>ERC1155</option>
              </select>
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-black'>
                Contract Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value as Subcategory)}
                className="mt-1 block w-full p-2 border rounded-md text-black disabled:bg-gray-200 disabled:cursor-not-allowed"
                disabled={isPrefilled} // Disable if prefilled
              >
                {coreSubcategories[coreType].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='space-y-4'>
            {/* Common Fields */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-black'>
                Name (required) *
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
                Symbol (required) *
              </label>
              <input
                type='text'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                placeholder='SYMBL'
                required
              />
            </div>
            
            {/* ERC20 Specific Fields */}
            {coreType === 'ERC20' && (
              <>
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
                    Standard is 18 decimals, like ETH
                  </p>
                </div>
                
                {/* ERC20 Features */}
                <div className='mb-4'>
                  <h3 className='text-lg font-medium text-black mb-2'>Token Features</h3>
                  <div className='space-y-2'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='mintable'
                        checked={isMintable}
                        onChange={(e) => setIsMintable(e.target.checked)}
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
                        checked={isBurnable}
                        onChange={(e) => setIsBurnable(e.target.checked)}
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
                        checked={isPausable}
                        onChange={(e) => setIsPausable(e.target.checked)}
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
                          placeholder='10000000'
                        />
                      </div>
                    )}
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        id='accessControl'
                        checked={hasAccessControl}
                        onChange={(e) => setHasAccessControl(e.target.checked)}
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
                  </div>
                </div>
              </>
            )}
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-black'>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                placeholder='Describe your token here'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-black'>
                Image
              </label>
              <input
                type='file'
                accept='image/*'
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 '
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
            {/* Owner and Primary Sale Recipient (Common) */}
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
            {/* Conditional Fields */}
            {(coreType === 'ERC721' || coreType === 'ERC1155') && (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Royalty Recipient
                </label>
                <input
                  type='text'
                  value={royaltyRecipient}
                  onChange={(e) => setRoyaltyRecipient(e.target.value)}
                  className='mt-1 block w-full p-2 border rounded-md text-black'
                  placeholder='Royalty Recipient'
                  required
                />
                <p className='text-xs text-gray-700 mt-1'>
                  The address that will receive royalties from secondary sales.
                </p>
              </div>
            )}
            {coreType === 'ERC721' && (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Token URI
                </label>
                <input
                  type='text'
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  className='mt-1 block w-full p-2 border rounded-md text-black'
                  placeholder='Token URI'
                />
              </div>
            )}
            {coreType === 'ERC1155' && (
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Start Token ID
                </label>
                <input
                  type='number'
                  value={startTokenId}
                  onChange={(e) => setStartTokenId(Number(e.target.value))}
                  className='mt-1 block w-full p-2 border rounded-md text-black'
                  placeholder='Start Token ID'
                />
              </div>
            )}
            {(subcategory === 'NFT Drop' || subcategory === 'Edition Drop') && (
              <>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-black'>
                    Royalty Percentage
                  </label>
                  <input
                    type='number'
                    value={royaltyPercentage}
                    onChange={(e) =>
                      setRoyaltyPercentage(Number(e.target.value))
                    }
                    className='mt-1 block w-full p-2 border rounded-md text-black'
                    placeholder='Royalty Percentage'
                  />
                </div>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-black'>
                    Transfer Validator Address
                  </label>
                  <input
                    type='text'
                    value={transferValidatorAddress}
                    onChange={(e) =>
                      setTransferValidatorAddress(e.target.value)
                    }
                    className='mt-1 block w-full p-2 border rounded-md text-black'
                    placeholder='Transfer Validator Address'
                    required
                  />
                  <p className='text-xs text-gray-700 mt-1'>
                    The contract address to enforce royalties. Use the zero
                    address to disable validation.
                  </p>
                </div>
              </>
            )}
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
            {/* Deploy Button */}
            <button
              onClick={deployContract}
              disabled={!address || !name || isDeploying}
              className={`px-4 py-2 rounded-lg ${
                !address || !name || isDeploying
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium`}
            >
              {isDeploying ? <>Deploying...</> : 'Deploy Contract'}
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
          creator={ownerAddress}
          onBack={() => setShowViewContract(false)}
        />
      )}
    </div>
  );
}
