
'use client';
import { useState } from 'react';
import {
  ClaimableERC20,
  ClaimableERC721,
  ClaimableERC1155,
  RoyaltyERC721,
  RoyaltyERC1155,
  MintableERC20,
} from 'thirdweb/modules';
import ModularContractDeployer from './ModularContractDeployer';
import {
  PopularContract,
  PrebuiltContractDeployerProps,
  CoreType,
  Subcategory,
} from '../types';
import { useActiveAccount } from 'thirdweb/react';
export default function PrebuiltContractDeployer({
  onBack,
}: PrebuiltContractDeployerProps) {
  const [selectedContract, setSelectedContract] =
    useState<PopularContract | null>(null);
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  
  const popularContracts: PopularContract[] = [
    {
      name: 'Token',
      description: 'Create cryptocurrency compliant with the ERC20 standard',
      coreType: 'ERC20' as CoreType,
      subcategory: 'Token' as Subcategory,
      modules: [MintableERC20.module({ primarySaleRecipient: address || '' })],
    },
    {
      name: 'NFT Drop',
      description: 'Release collection of unique NFTs for a set price',
      coreType: 'ERC721' as CoreType,
      subcategory: 'NFT Drop' as Subcategory,
      modules: [
        ClaimableERC721.module({ primarySaleRecipient: address || '' }),
        RoyaltyERC721.module({
          royaltyRecipient: address || '',
          royaltyBps: 0n,
          transferValidator: '',
        }),
      ],
    },
    {
      name: 'Edition Drop',
      description: 'Release ERC1155 tokens for a set price',
      coreType: 'ERC1155' as CoreType,
      subcategory: 'Edition Drop' as Subcategory,
      modules: [
        ClaimableERC1155.module({ primarySaleRecipient: address || '' }),
        RoyaltyERC1155.module({
          royaltyRecipient: address || '',
          royaltyBps: 0n,
          transferValidator: '',
        }),
      ],
    },
  ];
  if (selectedContract) {
    return (
      <ModularContractDeployer
        prefilledCoreType={selectedContract.coreType}
        prefilledSubcategory={selectedContract.subcategory}
        prefilledModules={selectedContract.modules}
        onBack={() => setSelectedContract(null)}
        isPrefilled={true} // Pass isPrefilled to disable select boxes
      />
    );
  }
  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <div className='bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border border-blue-200 rounded-xl shadow'>
          <h2 className='text-2xl font-bold text-black'>
            Popular Contracts
          </h2>
        </div>
        <button
          onClick={onBack}
          className='mb-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium'
        >
          Back to Options
        </button>
      </div>
      <p className='text-gray-500 mb-6'>
        Select any of these commonly deployed contracts for quick deployment.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {popularContracts.map((contract) => (
          <div
            key={contract.name}
            className='bg-gradient-to-br from-blue-50 to-indigo-100 p-6 border border-blue-200 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer'
            onClick={() => setSelectedContract(contract)}
          >
            <h3 className='text-lg font-semibold text-indigo-900'>
              {contract.name}
            </h3>
            <p className='text-gray-600 text-sm mt-1'>{contract.description}</p>
            <div className='flex justify-end items-center mt-4'>
              <button className='px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300'>
                🚀 Deploy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
