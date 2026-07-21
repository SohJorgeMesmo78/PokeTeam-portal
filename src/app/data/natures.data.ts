export interface PokemonNature {
  name: string;
  namePt: string;
  increasedStat: string | null;
  decreasedStat: string | null;
  descriptionPt: string;
}

export const POKEMON_NATURES: PokemonNature[] = [
  { name: 'Hardy', namePt: 'Hardy (Neutra)', increasedStat: null, decreasedStat: null, descriptionPt: 'Neutra (Sem alterações)' },
  { name: 'Lonely', namePt: 'Lonely (+Atk / -Def)', increasedStat: 'Ataque', decreasedStat: 'Defesa', descriptionPt: '+10% Ataque, -10% Defesa' },
  { name: 'Brave', namePt: 'Brave (+Atk / -Vel)', increasedStat: 'Ataque', decreasedStat: 'Velocidade', descriptionPt: '+10% Ataque, -10% Velocidade' },
  { name: 'Adamant', namePt: 'Adamant (+Atk / -Sp.Atk)', increasedStat: 'Ataque', decreasedStat: 'Sp. Atk', descriptionPt: '+10% Ataque, -10% Sp. Atk (Ideal Físico)' },
  { name: 'Naughty', namePt: 'Naughty (+Atk / -Sp.Def)', increasedStat: 'Ataque', decreasedStat: 'Sp. Def', descriptionPt: '+10% Ataque, -10% Sp. Def' },
  { name: 'Bold', namePt: 'Bold (+Def / -Atk)', increasedStat: 'Defesa', decreasedStat: 'Ataque', descriptionPt: '+10% Defesa, -10% Ataque (Defensivo Físico)' },
  { name: 'Docile', namePt: 'Docile (Neutra)', increasedStat: null, decreasedStat: null, descriptionPt: 'Neutra (Sem alterações)' },
  { name: 'Relaxed', namePt: 'Relaxed (+Def / -Vel)', increasedStat: 'Defesa', decreasedStat: 'Velocidade', descriptionPt: '+10% Defesa, -10% Velocidade' },
  { name: 'Impish', namePt: 'Impish (+Def / -Sp.Atk)', increasedStat: 'Defesa', decreasedStat: 'Sp. Atk', descriptionPt: '+10% Defesa, -10% Sp. Atk' },
  { name: 'Lax', namePt: 'Lax (+Def / -Sp.Def)', increasedStat: 'Defesa', decreasedStat: 'Sp. Def', descriptionPt: '+10% Defesa, -10% Sp. Def' },
  { name: 'Timid', namePt: 'Timid (+Vel / -Atk)', increasedStat: 'Velocidade', decreasedStat: 'Ataque', descriptionPt: '+10% Velocidade, -10% Ataque (Ideal Rápido/Especial)' },
  { name: 'Hasty', namePt: 'Hasty (+Vel / -Def)', increasedStat: 'Velocidade', decreasedStat: 'Defesa', descriptionPt: '+10% Velocidade, -10% Defesa' },
  { name: 'Jolly', namePt: 'Jolly (+Vel / -Sp.Atk)', increasedStat: 'Velocidade', decreasedStat: 'Sp. Atk', descriptionPt: '+10% Velocidade, -10% Sp. Atk (Ideal Rápido/Físico)' },
  { name: 'Naive', namePt: 'Naive (+Vel / -Sp.Def)', increasedStat: 'Velocidade', decreasedStat: 'Sp. Def', descriptionPt: '+10% Velocidade, -10% Sp. Def' },
  { name: 'Serious', namePt: 'Serious (Neutra)', increasedStat: null, decreasedStat: null, descriptionPt: 'Neutra (Sem alterações)' },
  { name: 'Modest', namePt: 'Modest (+Sp.Atk / -Atk)', increasedStat: 'Sp. Atk', decreasedStat: 'Ataque', descriptionPt: '+10% Sp. Atk, -10% Ataque (Ideal Especial)' },
  { name: 'Mild', namePt: 'Mild (+Sp.Atk / -Def)', increasedStat: 'Sp. Atk', decreasedStat: 'Defesa', descriptionPt: '+10% Sp. Atk, -10% Defesa' },
  { name: 'Quiet', namePt: 'Quiet (+Sp.Atk / -Vel)', increasedStat: 'Sp. Atk', decreasedStat: 'Velocidade', descriptionPt: '+10% Sp. Atk, -10% Velocidade' },
  { name: 'Bashful', namePt: 'Bashful (Neutra)', increasedStat: null, decreasedStat: null, descriptionPt: 'Neutra (Sem alterações)' },
  { name: 'Rash', namePt: 'Rash (+Sp.Atk / -Sp.Def)', increasedStat: 'Sp. Atk', decreasedStat: 'Sp. Def', descriptionPt: '+10% Sp. Atk, -10% Sp. Def' },
  { name: 'Calm', namePt: 'Calm (+Sp.Def / -Atk)', increasedStat: 'Sp. Def', decreasedStat: 'Ataque', descriptionPt: '+10% Sp. Def, -10% Ataque (Defensivo Especial)' },
  { name: 'Gentle', namePt: 'Gentle (+Sp.Def / -Def)', increasedStat: 'Sp. Def', decreasedStat: 'Defesa', descriptionPt: '+10% Sp. Def, -10% Defesa' },
  { name: 'Sassy', namePt: 'Sassy (+Sp.Def / -Vel)', increasedStat: 'Sp. Def', decreasedStat: 'Velocidade', descriptionPt: '+10% Sp. Def, -10% Velocidade' },
  { name: 'Careful', namePt: 'Careful (+Sp.Def / -Sp.Atk)', increasedStat: 'Sp. Def', decreasedStat: 'Sp. Atk', descriptionPt: '+10% Sp. Def, -10% Sp. Atk' },
  { name: 'Quirky', namePt: 'Quirky (Neutra)', increasedStat: null, decreasedStat: null, descriptionPt: 'Neutra (Sem alterações)' }
];
