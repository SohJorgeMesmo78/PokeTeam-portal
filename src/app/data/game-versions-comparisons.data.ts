export interface ExclusivePokemonItem {
  id: number;
  name: string;
  spriteUrl: string;
  types?: string[];
}

export interface GameComparisonItem {
  id: string;
  name: string;
  coverUrl: string;
  exclusives: ExclusivePokemonItem[];
}

export interface VersionComparisonGroup {
  id: string;
  title: string;
  gen: number;
  genTitle: string;
  games: GameComparisonItem[];
}

const getSprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

export const VERSION_COMPARISONS: VersionComparisonGroup[] = [
  {
    id: 'red-blue-yellow',
    title: 'Red / Blue / Yellow',
    gen: 1,
    genTitle: '1ª Geração (Kanto)',
    games: [
      {
        id: 'red',
        name: 'Pokémon Red',
        coverUrl: 'assets/covers/red.png',
        exclusives: [
          { id: 23, name: 'Ekans', spriteUrl: getSprite(23), types: ['poison'] },
          { id: 24, name: 'Arbok', spriteUrl: getSprite(24), types: ['poison'] },
          { id: 43, name: 'Oddish', spriteUrl: getSprite(43), types: ['grass', 'poison'] },
          { id: 44, name: 'Gloom', spriteUrl: getSprite(44), types: ['grass', 'poison'] },
          { id: 45, name: 'Vileplume', spriteUrl: getSprite(45), types: ['grass', 'poison'] },
          { id: 56, name: 'Mankey', spriteUrl: getSprite(56), types: ['fighting'] },
          { id: 57, name: 'Primeape', spriteUrl: getSprite(57), types: ['fighting'] },
          { id: 58, name: 'Growlithe', spriteUrl: getSprite(58), types: ['fire'] },
          { id: 59, name: 'Arcanine', spriteUrl: getSprite(59), types: ['fire'] },
          { id: 123, name: 'Scyther', spriteUrl: getSprite(123), types: ['bug', 'flying'] },
          { id: 125, name: 'Electabuzz', spriteUrl: getSprite(125), types: ['electric'] },
        ],
      },
      {
        id: 'blue',
        name: 'Pokémon Blue',
        coverUrl: 'assets/covers/blue.png',
        exclusives: [
          { id: 27, name: 'Sandshrew', spriteUrl: getSprite(27), types: ['ground'] },
          { id: 28, name: 'Sandslash', spriteUrl: getSprite(28), types: ['ground'] },
          { id: 37, name: 'Vulpix', spriteUrl: getSprite(37), types: ['fire'] },
          { id: 38, name: 'Ninetales', spriteUrl: getSprite(38), types: ['fire'] },
          { id: 52, name: 'Meowth', spriteUrl: getSprite(52), types: ['normal'] },
          { id: 53, name: 'Persian', spriteUrl: getSprite(53), types: ['normal'] },
          { id: 69, name: 'Bellsprout', spriteUrl: getSprite(69), types: ['grass', 'poison'] },
          { id: 70, name: 'Weepinbell', spriteUrl: getSprite(70), types: ['grass', 'poison'] },
          { id: 71, name: 'Victreebel', spriteUrl: getSprite(71), types: ['grass', 'poison'] },
          { id: 126, name: 'Magmar', spriteUrl: getSprite(126), types: ['fire'] },
          { id: 127, name: 'Pinsir', spriteUrl: getSprite(127), types: ['bug'] },
        ],
      },
      {
        id: 'yellow',
        name: 'Pokémon Yellow',
        coverUrl: 'assets/covers/yellow.png',
        exclusives: [
          { id: 25, name: 'Pikachu (Inicial)', spriteUrl: getSprite(25), types: ['electric'] },
          { id: 1, name: 'Bulbasaur (Evento)', spriteUrl: getSprite(1), types: ['grass', 'poison'] },
          { id: 4, name: 'Charmander (Evento)', spriteUrl: getSprite(4), types: ['fire'] },
          { id: 7, name: 'Squirtle (Evento)', spriteUrl: getSprite(7), types: ['water'] },
          { id: 109, name: 'Koffing (Troca)', spriteUrl: getSprite(109), types: ['poison'] },
          { id: 110, name: 'Weezing (Troca)', spriteUrl: getSprite(110), types: ['poison'] },
          { id: 124, name: 'Jynx', spriteUrl: getSprite(124), types: ['ice', 'psychic'] },
        ],
      },
    ],
  },

  {
    id: 'gold-silver-crystal',
    title: 'Gold / Silver / Crystal',
    gen: 2,
    genTitle: '2ª Geração (Johto)',
    games: [
      {
        id: 'gold',
        name: 'Pokémon Gold',
        coverUrl: 'assets/covers/gold.png',
        exclusives: [
          { id: 167, name: 'Spinarak', spriteUrl: getSprite(167), types: ['bug', 'poison'] },
          { id: 168, name: 'Ariados', spriteUrl: getSprite(168), types: ['bug', 'poison'] },
          { id: 207, name: 'Gligar', spriteUrl: getSprite(207), types: ['ground', 'flying'] },
          { id: 216, name: 'Teddiursa', spriteUrl: getSprite(216), types: ['normal'] },
          { id: 217, name: 'Ursaring', spriteUrl: getSprite(217), types: ['normal'] },
          { id: 226, name: 'Mantine', spriteUrl: getSprite(226), types: ['water', 'flying'] },
          { id: 232, name: 'Donphan', spriteUrl: getSprite(232), types: ['ground'] },
          { id: 250, name: 'Ho-Oh', spriteUrl: getSprite(250), types: ['fire', 'flying'] },
        ],
      },
      {
        id: 'silver',
        name: 'Pokémon Silver',
        coverUrl: 'assets/covers/silver.png',
        exclusives: [
          { id: 165, name: 'Ledyba', spriteUrl: getSprite(165), types: ['bug', 'flying'] },
          { id: 166, name: 'Ledian', spriteUrl: getSprite(166), types: ['bug', 'flying'] },
          { id: 225, name: 'Delibird', spriteUrl: getSprite(225), types: ['ice', 'flying'] },
          { id: 227, name: 'Skarmory', spriteUrl: getSprite(227), types: ['steel', 'flying'] },
          { id: 228, name: 'Houndour', spriteUrl: getSprite(228), types: ['dark', 'fire'] },
          { id: 229, name: 'Houndoom', spriteUrl: getSprite(229), types: ['dark', 'fire'] },
          { id: 231, name: 'Phanpy', spriteUrl: getSprite(231), types: ['ground'] },
          { id: 249, name: 'Lugia', spriteUrl: getSprite(249), types: ['psychic', 'flying'] },
        ],
      },
      {
        id: 'crystal',
        name: 'Pokémon Crystal',
        coverUrl: 'assets/covers/crystal.png',
        exclusives: [
          { id: 245, name: 'Suicune (Evento)', spriteUrl: getSprite(245), types: ['water'] },
          { id: 238, name: 'Smoochum (Odd Egg)', spriteUrl: getSprite(238), types: ['ice', 'psychic'] },
          { id: 239, name: 'Elekid (Odd Egg)', spriteUrl: getSprite(239), types: ['electric'] },
          { id: 240, name: 'Magby (Odd Egg)', spriteUrl: getSprite(240), types: ['fire'] },
          { id: 172, name: 'Pichu (Odd Egg)', spriteUrl: getSprite(172), types: ['electric'] },
        ],
      },
    ],
  },

  {
    id: 'ruby-sapphire-emerald',
    title: 'Ruby / Sapphire / Emerald',
    gen: 3,
    genTitle: '3ª Geração (Hoenn)',
    games: [
      {
        id: 'ruby',
        name: 'Pokémon Ruby',
        coverUrl: 'assets/covers/ruby.png',
        exclusives: [
          { id: 273, name: 'Seedot', spriteUrl: getSprite(273), types: ['grass'] },
          { id: 274, name: 'Nuzleaf', spriteUrl: getSprite(274), types: ['grass', 'dark'] },
          { id: 275, name: 'Shiftry', spriteUrl: getSprite(275), types: ['grass', 'dark'] },
          { id: 303, name: 'Mawile', spriteUrl: getSprite(303), types: ['steel', 'fairy'] },
          { id: 335, name: 'Zangoose', spriteUrl: getSprite(335), types: ['normal'] },
          { id: 338, name: 'Solrock', spriteUrl: getSprite(338), types: ['rock', 'psychic'] },
          { id: 383, name: 'Groudon', spriteUrl: getSprite(383), types: ['ground'] },
        ],
      },
      {
        id: 'sapphire',
        name: 'Pokémon Sapphire',
        coverUrl: 'assets/covers/sapphire.png',
        exclusives: [
          { id: 270, name: 'Lotad', spriteUrl: getSprite(270), types: ['water', 'grass'] },
          { id: 271, name: 'Lombre', spriteUrl: getSprite(271), types: ['water', 'grass'] },
          { id: 272, name: 'Ludicolo', spriteUrl: getSprite(272), types: ['water', 'grass'] },
          { id: 302, name: 'Sableye', spriteUrl: getSprite(302), types: ['dark', 'ghost'] },
          { id: 336, name: 'Seviper', spriteUrl: getSprite(336), types: ['poison'] },
          { id: 337, name: 'Lunatone', spriteUrl: getSprite(337), types: ['rock', 'psychic'] },
          { id: 382, name: 'Kyogre', spriteUrl: getSprite(382), types: ['water'] },
        ],
      },
      {
        id: 'emerald',
        name: 'Pokémon Emerald',
        coverUrl: 'assets/covers/emerald.png',
        exclusives: [
          { id: 384, name: 'Rayquaza', spriteUrl: getSprite(384), types: ['dragon', 'flying'] },
          { id: 185, name: 'Sudowoodo', spriteUrl: getSprite(185), types: ['rock'] },
          { id: 235, name: 'Smeargle', spriteUrl: getSprite(235), types: ['normal'] },
          { id: 152, name: 'Chikorita (Professor)', spriteUrl: getSprite(152), types: ['grass'] },
          { id: 155, name: 'Cyndaquil (Professor)', spriteUrl: getSprite(155), types: ['fire'] },
          { id: 158, name: 'Totodile (Professor)', spriteUrl: getSprite(158), types: ['water'] },
        ],
      },
    ],
  },

  {
    id: 'firered-leafgreen',
    title: 'FireRed vs LeafGreen',
    gen: 3,
    genTitle: '3ª Geração Remake (Kanto)',
    games: [
      {
        id: 'firered',
        name: 'Pokémon FireRed',
        coverUrl: 'assets/covers/firered.png',
        exclusives: [
          { id: 23, name: 'Ekans', spriteUrl: getSprite(23), types: ['poison'] },
          { id: 24, name: 'Arbok', spriteUrl: getSprite(24), types: ['poison'] },
          { id: 43, name: 'Oddish', spriteUrl: getSprite(43), types: ['grass', 'poison'] },
          { id: 44, name: 'Gloom', spriteUrl: getSprite(44), types: ['grass', 'poison'] },
          { id: 45, name: 'Vileplume', spriteUrl: getSprite(45), types: ['grass', 'poison'] },
          { id: 54, name: 'Psyduck', spriteUrl: getSprite(54), types: ['water'] },
          { id: 55, name: 'Golduck', spriteUrl: getSprite(55), types: ['water'] },
          { id: 58, name: 'Growlithe', spriteUrl: getSprite(58), types: ['fire'] },
          { id: 59, name: 'Arcanine', spriteUrl: getSprite(59), types: ['fire'] },
          { id: 90, name: 'Shellder', spriteUrl: getSprite(90), types: ['water'] },
          { id: 91, name: 'Cloyster', spriteUrl: getSprite(91), types: ['water', 'ice'] },
          { id: 123, name: 'Scyther', spriteUrl: getSprite(123), types: ['bug', 'flying'] },
          { id: 125, name: 'Electabuzz', spriteUrl: getSprite(125), types: ['electric'] },
        ],
      },
      {
        id: 'leafgreen',
        name: 'Pokémon LeafGreen',
        coverUrl: 'assets/covers/leafgreen.png',
        exclusives: [
          { id: 27, name: 'Sandshrew', spriteUrl: getSprite(27), types: ['ground'] },
          { id: 28, name: 'Sandslash', spriteUrl: getSprite(28), types: ['ground'] },
          { id: 37, name: 'Vulpix', spriteUrl: getSprite(37), types: ['fire'] },
          { id: 38, name: 'Ninetales', spriteUrl: getSprite(38), types: ['fire'] },
          { id: 69, name: 'Bellsprout', spriteUrl: getSprite(69), types: ['grass', 'poison'] },
          { id: 70, name: 'Weepinbell', spriteUrl: getSprite(70), types: ['grass', 'poison'] },
          { id: 71, name: 'Victreebel', spriteUrl: getSprite(71), types: ['grass', 'poison'] },
          { id: 79, name: 'Slowpoke', spriteUrl: getSprite(79), types: ['water', 'psychic'] },
          { id: 80, name: 'Slowbro', spriteUrl: getSprite(80), types: ['water', 'psychic'] },
          { id: 120, name: 'Staryu', spriteUrl: getSprite(120), types: ['water'] },
          { id: 121, name: 'Starmie', spriteUrl: getSprite(121), types: ['water', 'psychic'] },
          { id: 126, name: 'Magmar', spriteUrl: getSprite(126), types: ['fire'] },
          { id: 127, name: 'Pinsir', spriteUrl: getSprite(127), types: ['bug'] },
        ],
      },
    ],
  },

  {
    id: 'diamond-pearl-platinum',
    title: 'Diamond / Pearl / Platinum',
    gen: 4,
    genTitle: '4ª Geração (Sinnoh)',
    games: [
      {
        id: 'diamond',
        name: 'Pokémon Diamond',
        coverUrl: 'assets/covers/diamond.png',
        exclusives: [
          { id: 408, name: 'Cranidos', spriteUrl: getSprite(408), types: ['rock'] },
          { id: 409, name: 'Rampardos', spriteUrl: getSprite(409), types: ['rock'] },
          { id: 434, name: 'Stunky', spriteUrl: getSprite(434), types: ['poison', 'dark'] },
          { id: 435, name: 'Skuntank', spriteUrl: getSprite(435), types: ['poison', 'dark'] },
          { id: 483, name: 'Dialga', spriteUrl: getSprite(483), types: ['steel', 'dragon'] },
        ],
      },
      {
        id: 'pearl',
        name: 'Pokémon Pearl',
        coverUrl: 'assets/covers/pearl.png',
        exclusives: [
          { id: 410, name: 'Shieldon', spriteUrl: getSprite(410), types: ['rock', 'steel'] },
          { id: 411, name: 'Bastiodon', spriteUrl: getSprite(411), types: ['rock', 'steel'] },
          { id: 431, name: 'Glameow', spriteUrl: getSprite(431), types: ['normal'] },
          { id: 432, name: 'Purugly', spriteUrl: getSprite(432), types: ['normal'] },
          { id: 484, name: 'Palkia', spriteUrl: getSprite(484), types: ['water', 'dragon'] },
        ],
      },
      {
        id: 'platinum',
        name: 'Pokémon Platinum',
        coverUrl: 'assets/covers/platinum.png',
        exclusives: [
          { id: 487, name: 'Giratina (Forma Origem)', spriteUrl: getSprite(487), types: ['ghost', 'dragon'] },
          { id: 479, name: 'Rotom (Formas)', spriteUrl: getSprite(479), types: ['electric', 'ghost'] },
          { id: 175, name: 'Togepi (Ovo)', spriteUrl: getSprite(175), types: ['fairy'] },
          { id: 133, name: 'Eevee (Bebe)', spriteUrl: getSprite(133), types: ['normal'] },
        ],
      },
    ],
  },

  {
    id: 'black-white',
    title: 'Black vs White',
    gen: 5,
    genTitle: '5ª Geração (Unova)',
    games: [
      {
        id: 'black',
        name: 'Pokémon Black',
        coverUrl: 'assets/covers/black.png',
        exclusives: [
          { id: 546, name: 'Cottonee', spriteUrl: getSprite(546), types: ['grass', 'fairy'] },
          { id: 547, name: 'Whimsicott', spriteUrl: getSprite(547), types: ['grass', 'fairy'] },
          { id: 574, name: 'Gothita', spriteUrl: getSprite(574), types: ['psychic'] },
          { id: 575, name: 'Gothorita', spriteUrl: getSprite(575), types: ['psychic'] },
          { id: 576, name: 'Gothitelle', spriteUrl: getSprite(576), types: ['psychic'] },
          { id: 643, name: 'Reshiram', spriteUrl: getSprite(643), types: ['dragon', 'fire'] },
        ],
      },
      {
        id: 'white',
        name: 'Pokémon White',
        coverUrl: 'assets/covers/white.png',
        exclusives: [
          { id: 548, name: 'Petilil', spriteUrl: getSprite(548), types: ['grass'] },
          { id: 549, name: 'Lilligant', spriteUrl: getSprite(549), types: ['grass'] },
          { id: 577, name: 'Solosis', spriteUrl: getSprite(577), types: ['psychic'] },
          { id: 578, name: 'Duosion', spriteUrl: getSprite(578), types: ['psychic'] },
          { id: 579, name: 'Reuniclus', spriteUrl: getSprite(579), types: ['psychic'] },
          { id: 644, name: 'Zekrom', spriteUrl: getSprite(644), types: ['dragon', 'electric'] },
        ],
      },
    ],
  },

  {
    id: 'x-y',
    title: 'X vs Y',
    gen: 6,
    genTitle: '6ª Geração (Kalos)',
    games: [
      {
        id: 'x',
        name: 'Pokémon X',
        coverUrl: 'assets/covers/x.png',
        exclusives: [
          { id: 684, name: 'Swirlix', spriteUrl: getSprite(684), types: ['fairy'] },
          { id: 685, name: 'Slurpuff', spriteUrl: getSprite(685), types: ['fairy'] },
          { id: 692, name: 'Clauncher', spriteUrl: getSprite(692), types: ['water'] },
          { id: 693, name: 'Clawitzer', spriteUrl: getSprite(693), types: ['water'] },
          { id: 716, name: 'Xerneas', spriteUrl: getSprite(716), types: ['fairy'] },
        ],
      },
      {
        id: 'y',
        name: 'Pokémon Y',
        coverUrl: 'assets/covers/y.png',
        exclusives: [
          { id: 682, name: 'Spritzee', spriteUrl: getSprite(682), types: ['fairy'] },
          { id: 683, name: 'Aromatisse', spriteUrl: getSprite(683), types: ['fairy'] },
          { id: 690, name: 'Skrelp', spriteUrl: getSprite(690), types: ['poison', 'water'] },
          { id: 691, name: 'Dragalge', spriteUrl: getSprite(691), types: ['poison', 'dragon'] },
          { id: 717, name: 'Yveltal', spriteUrl: getSprite(717), types: ['dark', 'flying'] },
        ],
      },
    ],
  },

  {
    id: 'sun-moon',
    title: 'Sun vs Moon',
    gen: 7,
    genTitle: '7ª Geração (Alola)',
    games: [
      {
        id: 'sun',
        name: 'Pokémon Sun',
        coverUrl: 'assets/covers/sun.png',
        exclusives: [
          { id: 766, name: 'Passimian', spriteUrl: getSprite(766), types: ['fighting'] },
          { id: 776, name: 'Turtonator', spriteUrl: getSprite(776), types: ['fire', 'dragon'] },
          { id: 791, name: 'Solgaleo', spriteUrl: getSprite(791), types: ['psychic', 'steel'] },
        ],
      },
      {
        id: 'moon',
        name: 'Pokémon Moon',
        coverUrl: 'assets/covers/moon.png',
        exclusives: [
          { id: 765, name: 'Oranguru', spriteUrl: getSprite(765), types: ['normal', 'psychic'] },
          { id: 780, name: 'Drampa', spriteUrl: getSprite(780), types: ['normal', 'dragon'] },
          { id: 792, name: 'Lunala', spriteUrl: getSprite(792), types: ['psychic', 'ghost'] },
        ],
      },
    ],
  },

  {
    id: 'sword-shield',
    title: 'Sword vs Shield',
    gen: 8,
    genTitle: '8ª Geração (Galar)',
    games: [
      {
        id: 'sword',
        name: 'Pokémon Sword',
        coverUrl: 'assets/covers/sword.png',
        exclusives: [
          { id: 865, name: "Sirfetch'd", spriteUrl: getSprite(865), types: ['fighting'] },
          { id: 874, name: 'Stonjourner', spriteUrl: getSprite(874), types: ['rock'] },
          { id: 888, name: 'Zacian', spriteUrl: getSprite(888), types: ['fairy', 'steel'] },
        ],
      },
      {
        id: 'shield',
        name: 'Pokémon Shield',
        coverUrl: 'assets/covers/shield.png',
        exclusives: [
          { id: 875, name: 'Eiscue', spriteUrl: getSprite(875), types: ['ice'] },
          { id: 889, name: 'Zamazenta', spriteUrl: getSprite(889), types: ['fighting', 'steel'] },
        ],
      },
    ],
  },

  {
    id: 'scarlet-violet',
    title: 'Scarlet vs Violet',
    gen: 9,
    genTitle: '9ª Geração (Paldea)',
    games: [
      {
        id: 'scarlet',
        name: 'Pokémon Scarlet',
        coverUrl: 'assets/covers/scarlet.png',
        exclusives: [
          { id: 935, name: 'Armarouge', spriteUrl: getSprite(935), types: ['fire', 'psychic'] },
          { id: 984, name: 'Great Tusk', spriteUrl: getSprite(984), types: ['ground', 'fighting'] },
          { id: 1007, name: 'Koraidon', spriteUrl: getSprite(1007), types: ['fighting', 'dragon'] },
        ],
      },
      {
        id: 'violet',
        name: 'Pokémon Violet',
        coverUrl: 'assets/covers/violet.png',
        exclusives: [
          { id: 936, name: 'Ceruledge', spriteUrl: getSprite(936), types: ['fire', 'ghost'] },
          { id: 990, name: 'Iron Treads', spriteUrl: getSprite(990), types: ['ground', 'steel'] },
          { id: 1008, name: 'Miraidon', spriteUrl: getSprite(1008), types: ['electric', 'dragon'] },
        ],
      },
    ],
  },
];
