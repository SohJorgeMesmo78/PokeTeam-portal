export interface PokemonListResult {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListResult[];
}

export interface PokemonTypeRef {
  name: string;
  url: string;
}

export interface PokemonType {
  slot: number;
  type: PokemonTypeRef;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface OfficialArtwork {
  front_default: string | null;
  front_shiny?: string | null;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  other?: {
    'official-artwork'?: OfficialArtwork;
    home?: {
      front_default: string | null;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: {
    name: string;
    url: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
  version: {
    name: string;
    url: string;
  };
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: FlavorTextEntry[];
  genera: {
    genus: string;
    language: { name: string };
  }[];
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface TypeListItem {
  name: string;
  url: string;
}

export interface TypeListResponse {
  count: number;
  results: TypeListItem[];
}

export interface TypeDetailResponse {
  name: string;
  pokemon: {
    pokemon: PokemonListResult;
    slot: number;
  }[];
}
