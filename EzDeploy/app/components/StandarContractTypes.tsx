
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCoins, FaImage, FaImages } from 'react-icons/fa';
interface ContractTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}
const ContractTypeCard: React.FC<ContractTypeCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div className="min-h-[320px] h-full">
      <div className="h-full flex flex-col justify-between bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div>
          <div className="text-indigo-400 mb-4 text-3xl">{icon}</div>
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-200 mb-4">{description}</p>
        </div>
        <button 
          onClick={onClick}
          className="mt-auto py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg"
        >
          Deploy
        </button>
      </div>
    </div>
  );
};
export default function StandardContractTypes() {
  const router = useRouter();
  
  const handleCardClick = (path: string) => {
    router.push(path);
  };
  
  const contractTypes = [
    {
      id: 'erc20',
      title: 'ERC-20 Token',
      description:
        'Deploy a standard ERC-20 fungible token for cryptocurrencies, stablecoins, or utility tokens with customizable supply and permissions.',
      icon: <FaCoins />,
      path: '/deploy/erc20',
    },
    {
      id: 'erc721',
      title: 'ERC-721 NFT',
      description:
        'Create unique non-fungible tokens (NFTs) for digital art, collectibles, or certificates with provable ownership and transferability.',
      icon: <FaImage />,
      path: '/deploy/erc721',
    },
    {
      id: 'erc1155',
      title: 'ERC-1155 Multi-Token',
      description:
        'Deploy a versatile multi-token standard supporting both fungible and non-fungible tokens in a single contract with batch operations.',
      icon: <FaImages />,
      path: '/deploy/erc1155',
    },
  ];
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative overflow-visible">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Standard Contract Types
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible relative">
        {contractTypes.map((type) => (
          <ContractTypeCard
            key={type.id}
            title={type.title}
            description={type.description}
            icon={type.icon}
            onClick={() => handleCardClick(type.path)}
          />
        ))}
      </div>
    </div>
  );
}
