import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { seedData } from '../data/seed';
import { createStore } from '../data/store';
const store = createStore();
const stats = store.stats();
const output = {
  generatedAt: '2026-01-15T12:00:00.000Z',
  serviceCount: seedData.services.length,
  incidentCount: seedData.incidents.length,
  stats,
};
const path = resolve(__dirname, '../../../seed-stats.json');
writeFileSync(
  path,
  `${JSON.stringify(output, null, 2)}
`,
  'utf8',
);
console.log(`SentinelOps seed: ${output.serviceCount} services, ${output.incidentCount} incidents`);
console.log(`Wrote ${path}`);
