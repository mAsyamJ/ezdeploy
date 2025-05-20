
'use client';
import { useState, useEffect } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { deployModularContract } from 'thirdweb/modules';
import { upload, resolveScheme } from "thirdweb/storage";
import { useActiveAccount, useActiveWallet, useWalletBalance } from 'thirdweb/react';
import { sepolia, baseSepolia, ethereum, polygon } from 'thirdweb/chains';
import { Chain } from 'thirdweb/chains';
import ViewContract from './ViewContract';
// Industry and use case types
type Industry = 
  | 'Gaming'
  | 'Event Ticketing'
  | 'Collectibles & Merchandise'
  | 'Metaverse & Virtual Real Estate'
  | 'Music & Media'
  | 'Loyalty & Rewards'
  | 'Supply Chain / Logistics';
type UseCase = string;
// Token Features configuration
interface TokenFeatures {
  isMintable: boolean;
  isBatchMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  isUpdatableURI: boolean;
  hasAccessControl: boolean;
  hasSupplyTracking: boolean;
  hasRoyalties: boolean;
  isSoulbound: boolean;
  isUpgradeable: boolean;
  hasRevealLogic: boolean;
  hasSnapshot: boolean;
  hasPermit: boolean;
  isCapped: boolean;
}
// Use case configuration
interface UseCaseConfig {
  name: string;
  description: string;
  features: TokenFeatures;
  mintingMode: 'admin' | 'public' | 'whitelist';
  recommendedMaxSupply?: string;
  recommendedRoyalty?: number;
}
interface ERC1155IndustryDeployerProps {
  onBack?: () => void;
}
export default function ERC1155IndustryDeployer({ onBack }: ERC1155IndustryDeployerProps) {
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
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('Gaming');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>('Multi-class inventory (weapons, armor, potions)');
  
  // Basic Token Information
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [baseURI, setBaseURI] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // Token Features
  const [tokenFeatures, setTokenFeatures] = useState<TokenFeatures>({
    isMintable: true,
    isBatchMintable: true,
    isBurnable: false,
    isPausable: false,
    isUpdatableURI: false,
    hasAccessControl: false,
    hasSupplyTracking: true,
    hasRoyalties: false,
    isSoulbound: false,
    isUpgradeable: false,
    hasRevealLogic: false,
    hasSnapshot: false,
    hasPermit: false,
    isCapped: false
  });
  
  // Token IDs and Configuration
  const [tokenIds, setTokenIds] = useState<{ id: string; name: string; maxSupply: string }[]>([
    { id: '1', name: '', maxSupply: '' }
  ]);
  
  // Minting Configuration
  const [mintingMode, setMintingMode] = useState<'admin' | 'public' | 'whitelist'>('admin');
  const [startTokenId, setStartTokenId] = useState(0);
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5);
  
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
  
  // Industry options
  const industries: Industry[] = [
    'Gaming',
    'Event Ticketing',
    'Collectibles & Merchandise',
    'Metaverse & Virtual Real Estate',
    'Music & Media',
    'Loyalty & Rewards',
    'Supply Chain / Logistics'
  ];
  
  // Use case configurations by industry
  const useCasesByIndustry: Record<Industry, Record<string, UseCaseConfig>> = {
    'Gaming': {
      'Multi-class inventory (weapons, armor, potions)': {
        name: 'Multi-class inventory (weapons, armor, potions)',
        description: 'Different types of in-game items with varying attributes and quantities',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'admin',
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 5
      },
      'Crafting components': {
        name: 'Crafting components',
        description: 'Resources and materials used for crafting in-game items',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'Loot boxes with random contents': {
        name: 'Loot boxes with random contents',
        description: 'Mystery boxes containing random items with different rarities',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: true,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 7.5
      }
    },
    'Event Ticketing': {
      'One-time event passes (multiple tiers)': {
        name: 'One-time event passes (multiple tiers)',
        description: 'Different tiers of tickets for a single event (e.g., General, VIP, Backstage)',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: true,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 0
      },
      'Festival wristbands (multi-day)': {
        name: 'Festival wristbands (multi-day)',
        description: 'Access passes for multi-day events with different access levels',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: true,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'whitelist',
        recommendedMaxSupply: '5000',
        recommendedRoyalty: 0
      },
      'VIP and regular tier tickets': {
        name: 'VIP and regular tier tickets',
        description: 'Different tiers of tickets with varying benefits and access levels',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: true,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'whitelist',
        recommendedMaxSupply: '2000',
        recommendedRoyalty: 0
      }
    },
    'Collectibles & Merchandise': {
      'Digital trading cards (multiple types)': {
        name: 'Digital trading cards (multiple types)',
        description: 'Collection of digital trading cards with different rarities and types',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 5
      },
      'Physical + Digital merch claim tokens': {
        name: 'Physical + Digital merch claim tokens',
        description: 'Tokens that can be redeemed for physical merchandise',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '5000',
        recommendedRoyalty: 0
      },
      'Mystery packs': {
        name: 'Mystery packs',
        description: 'Packs containing random collectibles with different rarities',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: true,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 7.5
      }
    },
    'Metaverse & Virtual Real Estate': {
      'Land plots with zoning attributes': {
        name: 'Land plots with zoning attributes',
        description: 'Virtual land parcels with different zoning attributes and sizes',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 5
      },
      'Building materials or tools': {
        name: 'Building materials or tools',
        description: 'Resources used for building and crafting in virtual worlds',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'Room customization packs': {
        name: 'Room customization packs',
        description: 'Bundles of items for customizing virtual spaces',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '5000',
        recommendedRoyalty: 5
      }
    },
    'Music & Media': {
      'Song bundle downloads': {
        name: 'Song bundle downloads',
        description: 'Bundles of songs with download rights',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 10
      },
      'Album track tokens': {
        name: 'Album track tokens',
        description: 'Individual tracks from albums as separate tokens',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 10
      },
      'Content license packs': {
        name: 'Content license packs',
        description: 'Licenses for using content in different contexts',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: true,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'whitelist',
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 15
      }
    },
    'Loyalty & Rewards': {
      'Tiered points/reward systems': {
        name: 'Tiered points/reward systems',
        description: 'Different tiers of loyalty points with varying benefits',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: true,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'NFT coupons/vouchers': {
        name: 'NFT coupons/vouchers',
        description: 'Digital coupons and vouchers that can be redeemed for products or services',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'admin',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 0
      },
      'Multilevel access tokens': {
        name: 'Multilevel access tokens',
        description: 'Tokens that grant different levels of access to services or content',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: true,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'whitelist',
        recommendedMaxSupply: '5000',
        recommendedRoyalty: 0
      }
    },
    'Supply Chain / Logistics': {
      'Tokenized goods (per SKU)': {
        name: 'Tokenized goods (per SKU)',
        description: 'Digital representations of physical goods with unique SKUs',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'Tracking states (raw, in-process, finished)': {
        name: 'Tracking states (raw, in-process, finished)',
        description: 'Tokens representing different states of goods in a supply chain',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'Batch or lot tokens for items': {
        name: 'Batch or lot tokens for items',
        description: 'Tokens representing batches or lots of items in a supply chain',
        features: {
          isMintable: true,
          isBatchMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: false,
          isSoulbound: false,
          isUpgradeable: true,
          hasRevealLogic: false,
          hasSnapshot: true,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'admin',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 0
      }
    }
  };
  
  // Get use cases based on selected industry
  const getUseCases = () => {
    return Object.keys(useCasesByIndustry[selectedIndustry]);
  };
  
  // Get configuration for selected use case
  const getUseCaseConfig = (): UseCaseConfig => {
    // Check if the industry and use case exist in our configuration
    if (useCasesByIndustry[selectedIndustry] && 
        useCasesByIndustry[selectedIndustry][selectedUseCase]) {
      return useCasesByIndustry[selectedIndustry][selectedUseCase];
    }
    
    // Fallback to a default configuration if the specific use case is not found
    return {
      name: selectedUseCase,
      description: 'Custom multi-token configuration',
      features: {
        isMintable: true,
        isBatchMintable: true,
        isBurnable: false,
        isPausable: false,
        isUpdatableURI: false,
        hasAccessControl: false,
        hasSupplyTracking: true,
        hasRoyalties: false,
        isSoulbound: false,
        isUpgradeable: false,
        hasRevealLogic: false,
        hasSnapshot: false,
        hasPermit: false,
        isCapped: false
      },
      mintingMode: 'admin'
    };
  };
  
  // Add a new token ID to the list
  const addTokenId = () => {
    setTokenIds([...tokenIds, { id: (tokenIds.length + 1).toString(), name: '', maxSupply: '' }]);
  };
  
  // Remove a token ID from the list
  const removeTokenId = (index: number) => {
    if (tokenIds.length > 1) {
      const newTokenIds = [...tokenIds];
      newTokenIds.splice(index, 1);
      setTokenIds(newTokenIds);
    }
  };
  
  // Update a token ID's properties
  const updateTokenId = (index: number, field: 'id' | 'name' | 'maxSupply', value: string) => {
    const newTokenIds = [...tokenIds];
    newTokenIds[index] = { ...newTokenIds[index], [field]: value };
    setTokenIds(newTokenIds);
  };
  
  // Update token features when use case changes
  useEffect(() => {
    if (selectedIndustry && selectedUseCase) {
      const config = getUseCaseConfig();
      setTokenFeatures(config.features);
      setMintingMode(config.mintingMode);
      
      if (config.recommendedMaxSupply) {
        // Update all token IDs with the recommended max supply
        setTokenIds(tokenIds.map(token => ({
          ...token,
          maxSupply: config.recommendedMaxSupply || ''
        })));
      }
      
      if (config.recommendedRoyalty !== undefined) {
        setRoyaltyPercentage(config.recommendedRoyalty);
      }
    }
  }, [selectedIndustry, selectedUseCase]);
  
  // Set default addresses when wallet connects
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
    
    if (tokenIds.some(token => !token.id)) {
      setDeployError('All token IDs must be specified.');
      return;
    }
    
    if (tokenFeatures.isCapped && tokenIds.some(token => !token.maxSupply)) {
      setDeployError('Maximum supply is required for all tokens when using capped supply feature.');
      return;
    }
    
    if (tokenFeatures.hasRoyalties && !royaltyRecipient) {
      setDeployError('Royalty recipient address is required when using royalties feature.');
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
        royaltyRecipient: tokenFeatures.hasRoyalties ? (royaltyRecipient || address) : undefined,
        royaltyBps: tokenFeatures.hasRoyalties ? BigInt(royaltyPercentage * 100) : undefined,
        startTokenId: startTokenId,
        // Additional parameters would be added here based on selected features
      };
      
      // Deploy the contract
      const deployedAddress = await deployModularContract({
        chain: selectedChain,
        client,
        account: activeAccount,
        core: 'ERC1155',
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
    setStartTokenId(0);
    setDeployError('');
    setIsDeploying(false);
    
    // Reset to default industry and use case
    setSelectedIndustry('Gaming');
    setSelectedUseCase('Multi-class inventory (weapons, armor, potions)');
    
    // Reset token features to default
    setTokenFeatures({
      isMintable: true,
      isBatchMintable: true,
      isBurnable: false,
      isPausable: false,
      isUpdatableURI: false,
      hasAccessControl: false,
      hasSupplyTracking: true,
      hasRoyalties: false,
      isSoulbound: false,
      isUpgradeable: false,
      hasRevealLogic: false,
      hasSnapshot: false,
      hasPermit: false,
      isCapped: false
    });
    
    setMintingMode('admin');
    setTokenIds([{ id: '1', name: '', maxSupply: '' }]);
  };
  
  return (
    <div className='max-w-4xl mx-auto px-4'>
      {!contractAddress && (
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-black'>
              Industry-Specific ERC1155 Multi-Token Contract
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
                  Select the industry your multi-tokens will be used in.
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
                  onChange={(e) => setSelectedUseCase(e.target.value)}
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
              <h3 className='text-lg font-semibold text-black mb-3'>Step 3: Configure Multi-Token</h3>
              
              {/* Basic Token Information */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Collection Name (required) *
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='My Multi-Token Collection'
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
                  placeholder='MULTI'
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
                  placeholder='Describe your multi-token collection'
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
                  Start Token ID
                </label>
                <input
                  type='number'
                  value={startTokenId}
                  onChange={(e) => setStartTokenId(Number(e.target.value))}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                  placeholder='0'
                />
                <p className='text-xs text-gray-700 mt-1'>
                  The starting ID for your tokens. Usually 0 or 1.
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
              
              {/* Token IDs Configuration */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black mb-2'>
                  Token IDs & Names
                </label>
                <p className='text-xs text-gray-700 mb-2'>
                  Define the token IDs and names for your multi-token collection.
                </p>
                
                <div className='space-y-3'>
                  {tokenIds.map((token, index) => (
                    <div key={index} className='flex space-x-2 items-center'>
                      <div className='w-1/4'>
                        <input
                          type='text'
                          value={token.id}
                          onChange={(e) => updateTokenId(index, 'id', e.target.value)}
                          className='w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                          placeholder='ID'
                        />
                      </div>
                      <div className='w-1/2'>
                        <input
                          type='text'
                          value={token.name}
                          onChange={(e) => updateTokenId(index, 'name', e.target.value)}
                          className='w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                          placeholder='Token Name (e.g., "Sword")'
                        />
                      </div>
                      {tokenFeatures.isCapped && (
                        <div className='w-1/4'>
                          <input
                            type='text'
                            value={token.maxSupply}
                            onChange={(e) => updateTokenId(index, 'maxSupply', e.target.value)}
                            className='w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                            placeholder='Max Supply'
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeTokenId(index)}
                        className='text-red-600 hover:text-red-800'
                        disabled={tokenIds.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addTokenId}
                  className='mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm'
                >
                  + Add Token ID
                </button>
              </div>
              
              {/* Minting Configuration */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-black'>
                  Minting Mode
                </label>
                <select
                  value={mintingMode}
                  onChange={(e) => setMintingMode(e.target.value as 'admin' | 'public' | 'whitelist')}
                  className='mt-1 block w-full py-2 px-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
                >
                  <option value='admin'>Admin-Only Mint</option>
                  <option value='public'>Public Mint</option>
                  <option value='whitelist'>Whitelisted Mint</option>
                </select>
                <p className='text-xs text-gray-700 mt-1'>
                  {mintingMode === 'admin' ? 'Only contract admin can mint tokens' : 
                   mintingMode === 'public' ? 'Anyone can mint tokens' : 
                   'Only whitelisted addresses can mint tokens'}
                </p>
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
                    id='batchMintable'
                    checked={tokenFeatures.isBatchMintable}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isBatchMintable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='batchMintable' className='text-black'>
                    Batch Mintable - Allow creating multiple tokens in a single transaction
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
                    id='updatableURI'
                    checked={tokenFeatures.isUpdatableURI}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isUpdatableURI: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='updatableURI' className='text-black'>
                    Updatable Token URIs - Allow changing metadata after minting
                  </label>
                </div>
                
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
                    id='supplyTracking'
                    checked={tokenFeatures.hasSupplyTracking}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasSupplyTracking: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='supplyTracking' className='text-black'>
                    Supply Tracking - Track total supply per token ID
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
                    Capped Supply - Set maximum token supply per ID
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
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='royalties'
                    checked={tokenFeatures.hasRoyalties}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasRoyalties: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='royalties' className='text-black'>
                    ERC2981 Royalties - Collect fees on secondary sales
                  </label>
                </div>
                
                {tokenFeatures.hasRoyalties && (
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
                    checked={tokenFeatures.isSoulbound}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isSoulbound: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='soulbound' className='text-black'>
                    Soulbound (Non-transferable) - Tokens cannot be transferred after minting
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='upgradeable'
                    checked={tokenFeatures.isUpgradeable}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, isUpgradeable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='upgradeable' className='text-black'>
                    Upgradeable Contract - Allow updating contract logic in the future
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='revealLogic'
                    checked={tokenFeatures.hasRevealLogic}
                    onChange={(e) => setTokenFeatures({...tokenFeatures, hasRevealLogic: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='revealLogic' className='text-black'>
                    Reveal Logic - Hide metadata until reveal (for mystery boxes)
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
            
            {/* Contract Summary */}
            <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <h3 className='text-lg font-semibold text-black mb-3'>Contract Summary</h3>
              <div className='space-y-2 text-sm'>
                <p><span className='font-medium'>Industry:</span> {selectedIndustry}</p>
                <p><span className='font-medium'>Use Case:</span> {selectedUseCase}</p>
                <p><span className='font-medium'>Collection Name:</span> {name || '(Not set)'}</p>
                <p><span className='font-medium'>Symbol:</span> {symbol || '(Not set)'}</p>
                <p><span className='font-medium'>Minting Mode:</span> {mintingMode === 'admin' ? 'Admin-Only' : mintingMode === 'public' ? 'Public' : 'Whitelisted'}</p>
                <p><span className='font-medium'>Token IDs:</span> {tokenIds.map(t => `${t.id}${t.name ? ` (${t.name})` : ''}`).join(', ')}</p>
                <p><span className='font-medium'>Features:</span> {Object.entries(tokenFeatures)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/^(is|has)/, ''))
                  .join(', ')}</p>
                {tokenFeatures.hasRoyalties && <p><span className='font-medium'>Royalty:</span> {royaltyPercentage}%</p>}
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
              {isDeploying ? <>Deploying...</> : 'Deploy Multi-Token Contract'}
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
// Function to copy address to clipboard