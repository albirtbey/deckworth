import { CollectionCard, User, TradeListing, ApiCard, PokemonSet, TradeListingStatus } from '../types';
import { getRandomInt } from '../lib/utils';

// Mock Sets
const sets = [
  { name: 'Scarlet & Violet', code: 'SV01' },
  { name: 'Crown Zenith', code: 'CRZ' },
  { name: 'Silver Tempest', code: 'SIT' },
  { name: 'Lost Origin', code: 'LOR' },
  { name: 'Astral Radiance', code: 'ASR' },
  { name: 'Brilliant Stars', code: 'BRS' },
];

// Mock Card rarities
const rarities = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Ultra Rare',
  'Secret Rare',
];

// Mock Pokémon types
const pokemonTypes = [
  'Fire',
  'Water',
  'Grass',
  'Electric',
  'Psychic',
  'Fighting',
  'Darkness',
  'Metal',
  'Fairy',
  'Dragon',
  'Colorless',
];

// Mock Pokémon names
const pokemonNames = [
  'Pikachu',
  'Charizard',
  'Blastoise',
  'Venusaur',
  'Mewtwo',
  'Mew',
  'Jigglypuff',
  'Eevee',
  'Snorlax',
  'Gengar',
  'Gyarados',
  'Lucario',
  'Rayquaza',
  'Garchomp',
  'Mimikyu',
  'Sylveon',
  'Umbreon',
  'Espeon',
  'Vaporeon',
  'Jolteon',
];

// Mock card conditions
const conditions = [
  'Mint',
  'Near Mint',
  'Excellent',
  'Good',
  'Played',
  'Poor',
] as const;

// Mock artists
const artists = [
  'Mitsuhiro Arita',
  'Ken Sugimori',
  'Masakazu Fukuda',
  '5ban Graphics',
  'Shibuzoh.',
  'Kawayoo',
  'Kouki Saitou',
  'Yuka Morii',
];

// Generate mock collection cards - this might need updating if CollectionCard structure changed significantly due to ApiCard
// For now, we assume it can still somewhat function or will be updated later.
// It will likely break if it tries to use properties from the old Card type that no longer exist on ApiCard directly.
const generateMockCollectionCards = (cards: ApiCard[], count: number): CollectionCard[] => {
  const collectionCards: CollectionCard[] = [];

  if (cards.length === 0) return []; // Don't try to generate if there are no base cards

  for (let i = 0; i < count; i++) {
    const card = cards[getRandomInt(0, cards.length - 1)];
    const condition = conditions[getRandomInt(0, conditions.length - 1)] as CollectionCard['condition']; // Cast for type safety
    const quantity = getRandomInt(1, 4);
    const forTrade = getRandomInt(0, 3) === 0; // 25% chance to be for trade
    
    // Attempt to get a market price from tcgplayer, default to a random value if not available
    let purchasePriceBase = 1; // Default base price
    if (card.tcgplayer?.prices?.normal?.market) {
      purchasePriceBase = card.tcgplayer.prices.normal.market;
    } else if (card.tcgplayer?.prices?.holofoil?.market) {
      purchasePriceBase = card.tcgplayer.prices.holofoil.market;
    }
    
    collectionCards.push({
      ...card, // Spread the ApiCard properties
      quantity: quantity,
      condition: condition,
      // purchasePrice: card.marketValue * getRandomInt(50, 150) / 100, // Old way, marketValue might not exist directly
      purchasePrice: purchasePriceBase * (getRandomInt(80, 120) / 100), // Price around market or default base
      purchaseDate: new Date(Date.now() - getRandomInt(0, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: getRandomInt(0, 5) === 0 ? 'Special card from booster pack' : undefined,
      forTrade: forTrade,
      // Ensure all CollectionCard specific fields are handled
    });
  }

  return collectionCards;
};

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'PokeFanatic23',
    email: 'pokefan23@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    passwordHash: 'hashedpassword1', // IRL, use bcrypt or similar
    bio: 'Collecting since Base Set! Always looking for rare Charizards.',
    location: 'Pallet Town, Kanto',
    joinDate: '2022-08-15T10:00:00Z',
    reputation: 150,
    xp: 2500,
    level: 7,
    achievements: [
      { id: 'ach1', name: 'Kanto Starter', description: 'Collected all 3 Kanto starters', icon: '🔥💧🌿', dateEarned: '2023-01-15' },
      { id: 'ach2', name: 'Early Bird', description: 'Joined within the first month of launch', icon: '🐦', dateEarned: '2022-09-01' },
    ],
    collectionSize: 120,
    completedTrades: 15,
    collectionValue: 1250.75,
  },
  {
    id: '2',
    username: 'EeveeLover',
    email: 'eeveelover@example.com',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    passwordHash: 'hashedpassword2',
    bio: 'My goal is to collect every Eeveelution card ever printed!',
    location: 'Celadon City, Kanto',
    joinDate: '2023-01-20T14:30:00Z',
    reputation: 95,
    xp: 800,
    level: 3,
    achievements: [
      { id: 'ach3', name: 'First Trade', description: 'Completed your first trade', icon: '🤝', dateEarned: '2023-02-10' },
    ],
    collectionSize: 45,
    completedTrades: 3,
    collectionValue: 350.00,
  },
  {
    id: 'testuser',
    username: 'testuser',
    email: 'testuser@example.com',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    passwordHash: 'testpassword',
    bio: 'Just a test user enjoying the app!',
    location: 'Digital World',
    joinDate: '2024-01-01T00:00:00Z',
    reputation: 10,
    xp: 1250, // Example XP
    level: 5,  // Example Level
    achievements: [
      { id: 'ach_test_1', name: 'Kanto Starter', description: 'Earned on January 15, 2023', icon: '🔥', dateEarned: '2023-01-15' },
      { id: 'ach_test_2', name: 'Trading Novice', description: 'Earned on February 20, 2023', icon: '🔄', dateEarned: '2023-02-20' },
    ],
    collectionSize: 1, // From image
    completedTrades: 5, // From image
    collectionValue: 500.00 // From image
  },
  {
    id: 'user1',
    username: 'testUser',
    email: 'test@example.com',
    passwordHash: 'password123',
    avatar: 'https://i.pravatar.cc/150?u=testUser',
    bio: 'Pokemon card enthusiast. Looking to complete my Base Set collection!',
    location: 'Test Location 1',
    joinDate: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString(),
    reputation: 4.5,
    xp: 1500,
    level: 5,
    achievements: [],
    collectionSize: 0, // Will be populated dynamically on login by App.tsx
    completedTrades: 2,
    collectionValue: 0, // Will be populated dynamically
    // User specific fields like preferences, collection, wishlist, tradeHistory, lastLogin, createdAt are managed by App.tsx for the logged in currentUser
  },
  {
    id: 'user2',
    username: 'testUser2',
    email: 'test2@example.com',
    passwordHash: 'password456',
    avatar: 'https://i.pravatar.cc/150?u=testUser2',
    bio: 'Collector of rare and shiny Pokemon. Always up for a good trade.',
    location: 'Test Location 2',
    joinDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
    reputation: 4.8,
    xp: 2200,
    level: 6,
    achievements: [{ id: 'ach_trade_1', name: 'First Trade!', description: 'Completed a trade.', icon: '🤝', dateEarned: new Date().toISOString()}],
    collectionSize: 0, // Will be populated dynamically on login
    completedTrades: 5,
    collectionValue: 0, // Will be populated dynamically
  },
];

// New approach: mockCollectionCards will be empty for now, or generated from a small, fetched set of ApiCards if needed for demo.
// For now, let's leave it empty and components relying on it will need to adapt or fetch their own data.
export let mockCollectionCards: CollectionCard[] = [];

// Example of how you might populate mockCollectionCards if needed for components that haven't been updated yet:
// (async () => {
//   const sampleApiCards = await fetchPokemonCards('Pikachu', 1, 10); // Fetch 10 Pikachu cards as sample
//   if (sampleApiCards.length > 0) {
//     mockCollectionCards = generateMockCollectionCards(sampleApiCards, 5);
//     console.log('Generated mock collection cards from API sample', mockCollectionCards);
//   }
// })();

// Generate mock trade listings
export const generateMockTradeListings = (apiCards: ApiCard[], count: number): TradeListing[] => {
  const listings: TradeListing[] = [];
  
  if (mockUsers.length === 0 || apiCards.length === 0) return [];
  
  const statuses: TradeListingStatus[] = ['Active', 'Pending', 'Completed', 'Cancelled'];
  
  for (let i = 0; i < count; i++) {
    const user = mockUsers[getRandomInt(0, mockUsers.length - 1)];
    
    const numCardsInBundle = getRandomInt(1, Math.min(apiCards.length, 3)); // Bundle of 1 to 3 cards
    const selectedApiCardsForBundle: ApiCard[] = [];
    const availableApiCards = [...apiCards];
    for (let k = 0; k < numCardsInBundle; k++) {
        if(availableApiCards.length === 0) break;
        const cardIndex = getRandomInt(0, availableApiCards.length - 1);
        selectedApiCardsForBundle.push(availableApiCards.splice(cardIndex, 1)[0]);
    }

    if (selectedApiCardsForBundle.length === 0) continue; // Should not happen if apiCards is not empty

    const bundleCollectionCards: CollectionCard[] = selectedApiCardsForBundle.map(apiCard => ({
        ...apiCard,
        quantity: 1, // For listing, quantity is 1
        condition: conditions[getRandomInt(0, conditions.length - 1)] as CollectionCard['condition'],
        forTrade: true,
        // Other CollectionCard specific fields can be defaulted or randomized if needed
        purchaseDate: new Date().toISOString(),
    }));

    const firstCardInBundle = bundleCollectionCards[0];
    let askingPriceVal: number | undefined = undefined;
    if (firstCardInBundle.tcgplayer?.prices?.normal?.market) {
      askingPriceVal = firstCardInBundle.tcgplayer.prices.normal.market * (getRandomInt(90, 130) / 100);
    } else if (firstCardInBundle.tcgplayer?.prices?.holofoil?.market) {
      askingPriceVal = firstCardInBundle.tcgplayer.prices.holofoil.market * (getRandomInt(90, 130) / 100);
    }
    // For bundles, the asking price might be sum or a bit more/less
    if (bundleCollectionCards.length > 1 && askingPriceVal) {
        askingPriceVal *= bundleCollectionCards.length * (getRandomInt(80,110)/100); // Adjust price for bundle size
    }
    const askingPrice = getRandomInt(0, 2) === 0 ? askingPriceVal : undefined;
    
    const hasWishlist = getRandomInt(0, 2) === 0;
    const wishlistCount = hasWishlist ? getRandomInt(1, 3) : 0;
    const wishlist: string[] = [];
    const localPokemonNames = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Eevee'];
    for (let j = 0; j < wishlistCount; j++) {
      const wishlistCardName = localPokemonNames[getRandomInt(0, localPokemonNames.length - 1)];
      if (!wishlist.includes(wishlistCardName)) {
        wishlist.push(wishlistCardName);
      }
    }
    
    const hasDescription = getRandomInt(0, 2) === 0;
    const descriptions = [
      'Looking for a fair trade. Open to offers!',
      'Great bundle deal!',
      'Some of my favorite cards, hoping they find a good home.',
      'Perfect for any serious collector looking to expand.',
      'Willing to negotiate on price for the right trade.',
    ];
    const description = hasDescription ? descriptions[getRandomInt(0, descriptions.length - 1)] : undefined;
    const status = statuses[getRandomInt(0, statuses.length - 1)];

    listings.push({
      id: `listing-${Date.now()}-${i}`,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar || '/placeholder-avatar.png',
      userReputation: user.reputation,
      cards: bundleCollectionCards,
      askingPrice: askingPrice,
      wishlist: hasWishlist && wishlist.length > 0 ? wishlist : undefined,
      description: description,
      status: status,
      createdAt: new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
      offers: [],
    });
  }
  
  return listings;
};

// For now, initialize as empty. Components should fetch their own data.
export let mockTradeListings: TradeListing[] = [];

// Example of how to populate mockTradeListings for demo purposes after cards are fetched:
// (async () => {
//   const sampleApiCards = await fetchPokemonCards(undefined, 1, 20); // Fetch 20 cards
//   if (sampleApiCards.length > 0) {
//     mockTradeListings = generateMockTradeListings(sampleApiCards, 5);
//     console.log('Generated mock trade listings from API sample', mockTradeListings);
//   }
// })();