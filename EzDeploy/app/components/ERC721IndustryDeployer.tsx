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
  | 'Art & Collectibles'
  | 'Gaming'
  | 'Music & Media'
  | 'Ticketing'
  | 'Real Estate'
  | 'Fashion & Luxury'
  | 'Academic Credentials';
type UseCase = string;
// NFT Features configuration
interface NFTFeatures {
  isMintable: boolean;
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
  features: NFTFeatures;
  mintingMode: 'admin' | 'public' | 'whitelist';
  recommendedMaxSupply?: string;
  recommendedRoyalty?: number;
}
interface ERC721IndustryDeployerProps {
  onBack?: () => void;
}
export default function ERC721IndustryDeployer({ onBack }: ERC721IndustryDeployerProps) {
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
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('Art & Collectibles');
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase>('1/1 Digital Art');
  
  // Basic NFT Information
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [baseURI, setBaseURI] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // NFT Features
  const [nftFeatures, setNftFeatures] = useState<NFTFeatures>({
    isMintable: true,
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
  
  // Minting Configuration
  const [mintingMode, setMintingMode] = useState<'admin' | 'public' | 'whitelist'>('admin');
  const [maxSupply, setMaxSupply] = useState('');
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
    'Art & Collectibles',
    'Gaming',
    'Music & Media',
    'Ticketing',
    'Real Estate',
    'Fashion & Luxury',
    'Academic Credentials'
  ];
  
  // Use case configurations by industry
  const useCasesByIndustry: Record<Industry, Record<string, UseCaseConfig>> = {
    'Art & Collectibles': {
      '1/1 Digital Art': {
        name: '1/1 Digital Art',
        description: 'Unique, one-of-a-kind digital artworks',
        features: {
          isMintable: true,
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
        mintingMode: 'admin',
        recommendedMaxSupply: '1',
        recommendedRoyalty: 10
      },
      'Limited Edition Prints': {
        name: 'Limited Edition Prints',
        description: 'Limited series of digital artworks with fixed supply',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '100',
        recommendedRoyalty: 7.5
      },
      'Collectible Series': {
        name: 'Collectible Series',
        description: 'Collection of related digital items with varying rarity',
        features: {
          isMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: true,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 5
      },
      'Generative Art Collections': {
        name: 'Generative Art Collections',
        description: 'Algorithmically generated artwork collections',
        features: {
          isMintable: true,
          isBurnable: false,
          isPausable: true,
          isUpdatableURI: false,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: false,
          isUpgradeable: false,
          hasRevealLogic: true,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 5
      }
    },
    'Gaming': {
      'Unique In-game Items': {
        name: 'Unique In-game Items',
        description: 'One-of-a-kind items for use in games',
        features: {
          isMintable: true,
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
      'Weapon or Equipment Skins': {
        name: 'Weapon or Equipment Skins',
        description: 'Cosmetic modifications for in-game items',
        features: {
          isMintable: true,
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
        mintingMode: 'public',
        recommendedMaxSupply: '5000',
        recommendedRoyalty: 2.5
      },
      'Player-Owned Avatars': {
        name: 'Player-Owned Avatars',
        description: 'Unique character avatars for games',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 5
      }
    },
    'Music & Media': {
      'Song Ownership Tokens': {
        name: 'Song Ownership Tokens',
        description: 'Tokens representing ownership rights to songs',
        features: {
          isMintable: true,
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
        mintingMode: 'admin',
        recommendedMaxSupply: '100',
        recommendedRoyalty: 15
      },
      'Album Launch NFTs': {
        name: 'Album Launch NFTs',
        description: 'Special edition NFTs for album releases',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 10
      },
      'Fan Passes / Membership Badges': {
        name: 'Fan Passes / Membership Badges',
        description: 'Tokens granting access to exclusive content or communities',
        features: {
          isMintable: true,
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
    'Ticketing': {
      'Event Tickets (one-time use)': {
        name: 'Event Tickets (one-time use)',
        description: 'Digital tickets for single events',
        features: {
          isMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: true,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'public',
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 5
      },
      'VIP Membership Access': {
        name: 'VIP Membership Access',
        description: 'Exclusive access passes for VIP members',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '100',
        recommendedRoyalty: 10
      },
      'Multi-use Passes': {
        name: 'Multi-use Passes',
        description: 'Reusable passes for multiple events',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '500',
        recommendedRoyalty: 0
      }
    },
    'Real Estate': {
      'Property Ownership Token': {
        name: 'Property Ownership Token',
        description: 'Tokens representing ownership of real estate',
        features: {
          isMintable: true,
          isBurnable: false,
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
        recommendedMaxSupply: '100',
        recommendedRoyalty: 0
      },
      'Proof of Reservation (tokenized escrow)': {
        name: 'Proof of Reservation (tokenized escrow)',
        description: 'Tokens representing property reservations or escrow',
        features: {
          isMintable: true,
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
          isCapped: true
        },
        mintingMode: 'admin',
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 0
      },
      'Digital Twin for Physical Asset': {
        name: 'Digital Twin for Physical Asset',
        description: 'Digital representation of physical real estate',
        features: {
          isMintable: true,
          isBurnable: false,
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
        recommendedMaxSupply: '100',
        recommendedRoyalty: 0
      }
    },
    'Fashion & Luxury': {
      'Tokenized Wearables': {
        name: 'Tokenized Wearables',
        description: 'Digital versions of fashion items',
        features: {
          isMintable: true,
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
        recommendedMaxSupply: '1000',
        recommendedRoyalty: 7.5
      },
      'Certificate of Authenticity': {
        name: 'Certificate of Authenticity',
        description: 'Digital certificates proving authenticity of luxury items',
        features: {
          isMintable: true,
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
        mintingMode: 'admin',
        recommendedMaxSupply: '10000',
        recommendedRoyalty: 0
      },
      'VIP Fashion Show Access': {
        name: 'VIP Fashion Show Access',
        description: 'Exclusive access to fashion shows and events',
        features: {
          isMintable: true,
          isBurnable: true,
          isPausable: true,
          isUpdatableURI: true,
          hasAccessControl: true,
          hasSupplyTracking: true,
          hasRoyalties: true,
          isSoulbound: true,
          isUpgradeable: false,
          hasRevealLogic: false,
          hasSnapshot: false,
          hasPermit: true,
          isCapped: true
        },
        mintingMode: 'whitelist',
        recommendedMaxSupply: '500',
        recommendedRoyalty: 5
      }
    },
    'Academic Credentials': {
      'Degrees and Diplomas': {
        name: 'Degrees and Diplomas',
        description: 'Digital certificates for academic achievements',
        features: {
          isMintable: true,
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
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'Skill Badges': {
        name: 'Skill Badges',
        description: 'Tokens representing specific skills or competencies',
        features: {
          isMintable: true,
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
          isCapped: false
        },
        mintingMode: 'admin',
        recommendedRoyalty: 0
      },
      'License or Certificate NFTs': {
        name: 'License or Certificate NFTs',
        description: 'Digital licenses or professional certifications',
        features: {
          isMintable: true,
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
      description: 'Custom NFT configuration',
      features: {
        isMintable: true,
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
  
  // Update NFT features when use case changes
  useEffect(() => {
    if (selectedIndustry && selectedUseCase) {
      const config = getUseCaseConfig();
      setNftFeatures(config.features);
      setMintingMode(config.mintingMode);
      
      if (config.recommendedMaxSupply) {
        setMaxSupply(config.recommendedMaxSupply);
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
    
    if (nftFeatures.isCapped && (!maxSupply || parseInt(maxSupply) <= 0)) {
      setDeployError('Maximum supply is required when using capped supply feature.');
      return;
    }
    
    if (nftFeatures.hasRoyalties && !royaltyRecipient) {
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
        royaltyRecipient: nftFeatures.hasRoyalties ? (royaltyRecipient || address) : undefined,
        royaltyBps: nftFeatures.hasRoyalties ? BigInt(royaltyPercentage * 100) : undefined,
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
    
    // Reset to default industry and use case
    setSelectedIndustry('Art & Collectibles');
    setSelectedUseCase('1/1 Digital Art');
    
    // Reset NFT features to default
    setNftFeatures({
      isMintable: true,
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
    setMaxSupply('');
  };
  
  return (
    <div className='max-w-4xl mx-auto px-4'>
      {!contractAddress && (
        <div className='bg-white rounded-xl shadow-sm p-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold text-black'>
              Industry-Specific NFT Contract
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
                  Select the industry your NFT will be used in.
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
                  {getUseCaseConfig() && getUseCaseConfig().description}
                </p>
              </div>
            </div>
            
            {/* Step 3: NFT Configuration */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 3: Configure NFT</h3>
              
              {/* Basic NFT Information */}
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
              
              {nftFeatures.isCapped && (
                <div className='mb-4'>
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
                  <p className='text-xs text-gray-700 mt-1'>
                    The maximum number of NFTs that can be minted.
                  </p>
                </div>
              )}
            </div>
            
            {/* Step 4: NFT Features */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold text-black mb-3'>Step 4: NFT Features</h3>
              <p className='text-sm text-gray-600 mb-3'>
                These features have been optimized for {selectedUseCase} in the {selectedIndustry} industry.
              </p>
              
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='mintable'
                    checked={nftFeatures.isMintable}
                    onChange={(e) => setNftFeatures({...nftFeatures, isMintable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='mintable' className='text-black'>
                    Mintable - Allow creating new NFTs
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='burnable'
                    checked={nftFeatures.isBurnable}
                    onChange={(e) => setNftFeatures({...nftFeatures, isBurnable: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='burnable' className='text-black'>
                    Burnable - Allow destroying NFTs
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='pausable'
                    checked={nftFeatures.isPausable}
                    onChange={(e) => setNftFeatures({...nftFeatures, isPausable: e.target.checked})}
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
                    checked={nftFeatures.isUpdatableURI}
                    onChange={(e) => setNftFeatures({...nftFeatures, isUpdatableURI: e.target.checked})}
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
                    checked={nftFeatures.hasAccessControl}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasAccessControl: e.target.checked})}
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
                    checked={nftFeatures.hasSupplyTracking}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasSupplyTracking: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='supplyTracking' className='text-black'>
                    Supply Tracking - Track total supply
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='capped'
                    checked={nftFeatures.isCapped}
                    onChange={(e) => setNftFeatures({...nftFeatures, isCapped: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='capped' className='text-black'>
                    Capped Supply - Set maximum token supply
                  </label>
                </div>
                
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='snapshot'
                    checked={nftFeatures.hasSnapshot}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasSnapshot: e.target.checked})}
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
                    checked={nftFeatures.hasPermit}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasPermit: e.target.checked})}
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
                    checked={nftFeatures.hasRoyalties}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasRoyalties: e.target.checked})}
                    className='mr-2'
                  />
                  <label htmlFor='royalties' className='text-black'>
                    ERC2981 Royalties - Collect fees on secondary sales
                  </label>
                </div>
                
                {nftFeatures.hasRoyalties && (
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
                    checked={nftFeatures.isSoulbound}
                    onChange={(e) => setNftFeatures({...nftFeatures, isSoulbound: e.target.checked})}
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
                    checked={nftFeatures.isUpgradeable}
                    onChange={(e) => setNftFeatures({...nftFeatures, isUpgradeable: e.target.checked})}
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
                    checked={nftFeatures.hasRevealLogic}
                    onChange={(e) => setNftFeatures({...nftFeatures, hasRevealLogic: e.target.checked})}
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
                {nftFeatures.isCapped && <p><span className='font-medium'>Maximum Supply:</span> {maxSupply || 'Unlimited'}</p>}
                <p><span className='font-medium'>Features:</span> {Object.entries(nftFeatures)
                  .filter(([_, value]) => value)
                  .map(([key]) => key.replace(/^(is|has)/, ''))
                  .join(', ')}</p>
                {nftFeatures.hasRoyalties && <p><span className='font-medium'>Royalty:</span> {royaltyPercentage}%</p>}
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
