// Market system was removed during refactoring
// This file is kept for compatibility but contains no definitions

export const MARKET_DEFINITIONS = {} as const;
export const marketTypes = MARKET_DEFINITIONS;

// Empty exports to prevent import errors
export const getMarketDefinition = () => undefined;
export const calculateMarketPrice = () => 0;