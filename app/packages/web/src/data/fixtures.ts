import { buildSeedData, summarizeSeedData } from '@sentinelops/shared';
export const fixtureData = buildSeedData();
export const fixtureStats = summarizeSeedData(fixtureData.services, fixtureData.incidents);
