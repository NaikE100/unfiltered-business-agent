import { testConnections } from './config/db';

async function main() {
console.log(' Starting Unfiltered Business Agent...');
await testConnections();
console.log(' Agent initialized and running on MSI server.');
}

main().catch((err) => {
console.error('Fatal error during  startup:', err);
});
