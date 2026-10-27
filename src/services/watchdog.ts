import { logAgentAction } from './logger.js';
import { processPendingBakesOrders } from '../agents/bakesAgent.js';

const POLL_INTERVAL_MS = 30000; // Polls every 30 seconds

export function startWatchdog(): void {
  console.log('🔄 System Watchdog service started (polling every 30s)...');

  setInterval(async () => {
    try {
      // 1. Process bakes orders/tasks
      await processPendingBakesOrders();
      
      // 2. Heartbeat log
      await logAgentAction('Watchdog', 'Heartbeat Check', 'info', {
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      await logAgentAction('Watchdog', 'Loop Exception', 'error', { error: err.message });
    }
  }, POLL_INTERVAL_MS);
}