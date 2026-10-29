import { logAgentAction } from './logger.js';
import { processPendingBakesOrders } from '../agents/bakesAgent.js';
import { runScoutAgent } from '../agents/scoutAgent.js';
import { runProposalAgent } from '../agents/proposalAgent.js';

const POLL_INTERVAL_MS = 30000; // Polls every 30 seconds
let cycleCounter = 0;

export function startWatchdog(): void {
  console.log('🔄 System Watchdog service started (polling every 30s)...');

  setInterval(async () => {
    try {
      cycleCounter++;

      // 1. Core 1: Process Bakes orders every 30 seconds
      await processPendingBakesOrders();

      // 2. Core 2: Run Tech Scouting & Proposal Drafting every 10 cycles (~5 mins)
      if (cycleCounter % 10 === 0) {
        await runScoutAgent();
        await runProposalAgent();
      }

      // 3. Heartbeat log
      await logAgentAction('Watchdog', 'Heartbeat Check', 'info', {
        timestamp: new Date().toISOString(),
        cycle: cycleCounter,
      });
    } catch (err: any) {
      await logAgentAction('Watchdog', 'Loop Exception', 'error', { error: err.message });
    }
  }, POLL_INTERVAL_MS);
}