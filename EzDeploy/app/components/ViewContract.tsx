'use client';
import { Chain } from 'thirdweb/chains';
interface ViewContractProps {
  contractAddress: string;
  chain: Chain;
  name: string;
  imageUrl: string;
  creator: string;
  onBack: () => void;
}
export default function ViewContract({
  contractAddress,
  chain,
  name,
  imageUrl,
  creator,
  onBack,
}: ViewContractProps) {
  // Function to copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Address copied to clipboard!');
    });
  };
  
  // Function to get explorer URL based on chain
  const getExplorerUrl = () => {
    const chainId = chain.id;
    let baseUrl = '';
    
    if (chainId === 11155111) {
      // Sepolia
      baseUrl = 'https://sepolia.etherscan.io/address/';
    } else if (chainId === 84532) {
      // Base Sepolia
      baseUrl = 'https://sepolia.basescan.org/address/';
    } else if (chainId === 1) {
      // Ethereum Mainnet
      baseUrl = 'https://etherscan.io/address/';
    } else if (chainId === 137) {
      // Polygon Mainnet
      baseUrl = 'https://polygonscan.com/address/';
    } else {
      // Default to Etherscan mainnet if chain is unknown
      baseUrl = 'https://etherscan.io/address/';
    }
    
    return baseUrl + contractAddress;
  };
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glassmorphic rounded-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{name}</h2>
          <button