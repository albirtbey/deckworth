import { PokemonSet, ApiCard } from '../types';

const API_BASE_URL = 'https://api.pokemontcg.io/v2';

interface FetchSetsResponse {
  data: PokemonSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

interface FetchSetsParams {
  nameQuery?: string;
  series?: string;
  releaseYear?: string;
  format?: 'standard' | 'expanded' | 'unlimited' | '';
  page?: number;
  pageSize?: number;
}

export async function fetchPokemonSets(params: FetchSetsParams = {}): Promise<PokemonSet[]> {
  const { nameQuery, series, releaseYear, format, page = 1, pageSize = 250 } = params;
  try {
    let queryString = '';
    const queryParts: string[] = [];

    if (nameQuery) {
      queryParts.push(`(name:"*${nameQuery}*" OR series:"*${nameQuery}*")`);
    }
    if (series) {
      queryParts.push(`series:"${series}"`);
    }
    if (releaseYear) {
      queryParts.push(`releaseDate:${releaseYear}*`); // Search for year prefix
    }
    if (format) {
      queryParts.push(`legalities.${format}:Legal`);
    }

    if (queryParts.length > 0) {
      queryString = `q=${queryParts.join(' AND ')}`;
    }
    
    const PagingParams = `page=${page}&pageSize=${pageSize}`;
    const OrderByParams = `orderBy=-releaseDate`; // Sort by newest first

    let url = `${API_BASE_URL}/sets?${OrderByParams}&${PagingParams}`;
    if (queryString) {
      url += `&${queryString}`;
    }

    const response = await fetch(url, {
      headers: {
        // It's good practice to include an API key if you have one, 
        // though this API works without one for basic use with lower rate limits.
        // 'X-Api-Key': 'YOUR_API_KEY'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`Failed to fetch Pokémon sets: ${response.statusText}`);
    }

    const data: FetchSetsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Pokémon sets:', error);
    // Return empty array or re-throw, depending on how you want to handle errors
    return []; 
  }
}

// Interface for the response when fetching a single set
interface FetchSetResponse {
  data: PokemonSet;
}

// Function to fetch a single Pokémon set by its ID
export async function fetchPokemonSet(setId: string): Promise<PokemonSet | null> {
  try {
    const url = `${API_BASE_URL}/sets/${setId}`;
    const response = await fetch(url, {
      headers: {
        // 'X-Api-Key': 'YOUR_API_KEY' // Add API key if you have one
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error fetching set ${setId}:`, errorData);
      if (response.status === 404) {
        return null; // Set not found
      }
      throw new Error(`Failed to fetch Pokémon set ${setId}: ${response.statusText}`);
    }

    const data: FetchSetResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching Pokémon set ${setId}:`, error);
    return null;
  }
}

// Interface for the response when fetching a single card
interface FetchCardResponse {
  data: ApiCard;
}

// Function to fetch a single Pokémon card by its ID
export async function fetchPokemonCard(cardId: string): Promise<ApiCard | null> {
  try {
    const url = `${API_BASE_URL}/cards/${cardId}`;
    const response = await fetch(url, {
      headers: {
        // 'X-Api-Key': 'YOUR_API_KEY' // Add API key if you have one
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error fetching card ${cardId}:', errorData);
      // Distinguish between 404 (not found) and other errors
      if (response.status === 404) {
        return null; // Card not found
      }
      throw new Error(`Failed to fetch Pokémon card ${cardId}: ${response.statusText}`);
    }

    const data: FetchCardResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching Pokémon card ${cardId}:`, error);
    return null; // Return null on any other error
  }
}

// Interface for the response when fetching multiple cards (search)
interface FetchCardsResponse {
  data: ApiCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Function to fetch (search) Pokémon cards
export async function fetchPokemonCards(searchQuery?: string, page: number = 1, pageSize: number = 20): Promise<ApiCard[]> {
  try {
    let url = `${API_BASE_URL}/cards?page=${page}&pageSize=${pageSize}`;
    if (searchQuery) {
      if (searchQuery.includes(' OR ')) {
        const names = searchQuery.split(' OR ').map(name => `name:"*${name.trim()}*"`);
        url += `&q=(${names.join(' OR ')})`;
      } else {
        // API uses Lucene syntax, e.g., name:"Pikachu" types:lightning hp:[60 TO *]
        // For a simple name search, we can use name:"*PartialName*"
        url += `&q=name:"*${searchQuery.trim()}*"`;
      }
    }
    // Add orderBy to sort by releaseDate then name by default
    url += `&orderBy=-set.releaseDate,name`; // Sort by set release date (newest first), then by card name

    const response = await fetch(url, {
      headers: {
        // 'X-Api-Key': 'YOUR_API_KEY'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error fetching cards:', errorData);
      throw new Error(`Failed to fetch Pokémon cards: ${response.statusText}`);
    }

    const data: FetchCardsResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Pokémon cards:', error);
    return [];
  }
}

export async function fetchPokemonCardsBySetId(setId: string, page: number = 1, pageSize: number = 50): Promise<ApiCard[]> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    orderBy: 'number', // Order by card number in the set
    q: `set.id:${setId}`
  });

  const url = `${API_BASE_URL}/cards?${queryParams.toString()}`;
  console.log("Fetching cards for set URL:", url);

  try {
    const response = await fetch(url, {
      // headers: { // Removed API Key for now as it's not defined
      //   'X-Api-Key': API_KEY,
      // },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching Pokémon cards for set ${setId}:`, error);
    throw error;
  }
} 