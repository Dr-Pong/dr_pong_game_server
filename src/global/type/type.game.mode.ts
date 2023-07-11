export const GAMEMODE_CLASSIC = 'NON-SFINAE' as const;
export const GAMEMODE_SFINAE = 'SFINAE' as const;
export const GAMEMODE_RANDOMBOUNCE = 'RANDOMBOUNCE' as const;

export type GameMode = 'SFINAE' | 'NON-SFINAE' | 'RANDOMBOUNCE';
