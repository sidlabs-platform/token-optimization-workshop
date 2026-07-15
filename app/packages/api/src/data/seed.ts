import { buildSeedData, summarizeSeedData } from '@sentinelops/shared';
export const seedData = buildSeedData();
export const seedStats = summarizeSeedData(seedData.services, seedData.incidents);
