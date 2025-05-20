import { Chain, Module } from 'thirdweb';
// Type for the chains array in Home component
export interface ChainOption {
  name: string;
  chain: Chain;
}
// Type for the activeComponent state in Home component
export type ActiveComponent = 'modular' | 'prebuilt' | 'view' | null;
export type CoreType = 'ERC20' | 'ERC721' | 'ERC1155';
export type Subcategory =
  | 'Token'
  | 'Token Drop'
  | 'NFT Collection'
  | 'NFT Drop'
  | 'Open Edition'
  | 'Edition'
  | 'Edition Drop';
export interface CoreSubcategories {
  ERC20: Subcategory[];
  ERC721: Subcategory[];
  ERC1155: Subcategory[];
}
export interface ModularContractDeployerProps {
  prefilledCoreType?: CoreType;
  prefilledSubcategory?: Subcategory;
  prefilledModules?: Module[];
  prefilledPrimarySaleRecipient?: string;
  prefilledRoyaltyRecipient?: string;
  prefilledTransferValidatorAddress?: string;
  prefilledOwnerAddress?: string;
  onBack?: () => void;
  isPrefilled?: boolean; // New prop to indicate prefilled mode
}
export interface PopularContract {
  name: string;
  description: string;
  coreType: CoreType;
  subcategory: Subcategory;
  modules: Module[];
}
export interface PrebuiltContractDeployerProps {
  onBack?: () => void;
}
export interface ERC721ContractDeployerProps {
  onBack?: () => void;
}
export interface ERC1155ContractDeployerProps {
  onBack?: () => void;
}
export interface ViewContractProps {
  contractAddress: string;
  chain: Chain;
  name: string;
  imageUrl: string;
  creator: string;
  onBack: () => void;
}
// Industry-specific ERC20 token types
export type Industry = 'Finance' | 'Gaming' | 'Social' | 'Commerce';
export type FinanceUseCase = 'Payment Tokens' | 'Staking & Yield Farming' | 'Crowdfunding';
export interface TokenFeatures {
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  isCapped: boolean;
  hasAccessControl: boolean;
  hasSnapshot: boolean;
  hasPermit: boolean;
}
export interface UseCaseConfig {
  name: string;
  description: string;
  features: TokenFeatures;
  recommendedDecimals: number;
}
export interface ERC20UseCaseDeployerProps {
  onBack?: () => void;
}