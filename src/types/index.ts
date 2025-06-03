export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  passwordHash: string; // In a real app, never store plain passwords
  bio?: string;
  location?: string;
  joinDate: string; 
  reputation: number;
  xp: number;
  level: number;
  achievements: Achievement[];
  collectionSize: number;
  completedTrades: number;
  collectionValue: number; // This might be a simplified representation
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Could be an emoji or an SVG name
  dateEarned: string;
}

export type CardCondition = 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Played' | 'Poor';

export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Rare Holo' | 'Ultra Rare' | 'Secret Rare';

export type CardGrade = 'PSA 10' | 'PSA 9' | 'PSA 8' | 'PSA 7' | 'BGS 10' | 'BGS 9.5' | 'BGS 9' | 'CGC 10' | 'CGC 9.5' | 'CGC 9' | 'Raw';

export type CardLanguage = 'English' | 'Japanese' | 'Chinese' | 'Korean' | 'German' | 'French' | 'Italian' | 'Spanish' | 'Portuguese';

export type ApiCard = {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
  attacks?: {
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: PokemonSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    standard?: string;
    expanded?: string;
    unlimited?: string;
  };
  regulationMark?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: TCGPlayerPrice;
      holofoil?: TCGPlayerPrice;
      reverseHolofoil?: TCGPlayerPrice;
      firstEditionHolofoil?: TCGPlayerPrice;
      firstEditionNormal?: TCGPlayerPrice;
      [key: string]: TCGPlayerPrice | undefined;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices: any;
  };
};

export interface TCGPlayerPrice {
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
  directLow: number | null;
}

export interface CardMarketPriceDetail { // For future use if API provides structured data
  lowPrice: number | null;
  trendPrice: number | null;
  avg1: number | null; // Average sale price last day
  avg7: number | null; // Average sale price last 7 days
  avg30: number | null; // Average sale price last 30 days
  // Add other fields as necessary based on actual CardMarket API structure if integrated
}

export type CollectionCard = ApiCard & {
  quantity: number;
  condition: CardCondition;
  grade?: CardGrade;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  forTrade: boolean;
  folder?: string[];
  customPrice?: number;
  lastPriceSource?: string;
};

export type SmartFolder = {
  id: string;
  name: string;
  rules: {
    field: keyof CollectionCard;
    operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
    value: any;
  }[];
};

export type TradeListingStatus = 'Active' | 'Pending' | 'Completed' | 'Cancelled';

export interface Offer {
  id: string;
  offerUserId: string;
  offerUsername: string;
  offerUserAvatar: string;
  offeredCards: CollectionCard[];
  message?: string;
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export type TradeListing = {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userReputation: number;
  cards: CollectionCard[];
  askingPrice?: number;
  wishlist?: string[];
  description?: string;
  status: TradeListingStatus;
  createdAt: string;
  offers?: Offer[];
};

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}