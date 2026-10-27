import { testConnections } from './config/db.js';
import { logAgentAction } from './services/logger.js';
import { createAgentTask } from './services/taskDispatcher.js';
import { startWatchdog } from './services/watchdog.js';

async function main() {
  console.log('🚀 Starting Unfiltered Business Agent System...');
  
  // 1. Verify DB Links
  await testConnections();

  // 2. Log System Startup
  await logAgentAction('MasterOrchestrator', 'System Initialized', 'info', {
    host: 'MSI-Server',
    environment: process.env.NODE_ENV || 'development',
  });

  // 3. Dispatch Initial Task
  await createAgentTask({
    title: 'Verify Dual Database & Queue Sync',
    category: 'system',
    payload: { source: 'MSI Linux Server', initializedAt: new Date().toISOString() },
  });

  // 4. Start 24/7 Background Polling Watchdog
  startWatchdog();
  
  console.log('⚡ Agent initialized and actively monitoring on MSI server.');
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
});