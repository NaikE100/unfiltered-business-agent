import { testConnections } from './config/db';
import { logAgentAction } from './services/logger';
import { createAgentTask } from './services/taskDispatcher';

async function main() {
  console.log('🚀 Starting Unfiltered Business Agent System...');
  
  // 1. Verify DB Links
  await testConnections();

  // 2. Log System Startup to Supabase
  await logAgentAction('MasterOrchestrator', 'System Initialized', 'info', {
    host: 'MSI-Server',
    environment: process.env.NODE_ENV || 'development',
  });

  // 3. Dispatch Initial Test Task
  const testTask = await createAgentTask({
    title: 'Verify Dual Database & Queue Sync',
    category: 'system',
    payload: { source: 'MSI Linux Server', initializedAt: new Date().toISOString() },
  });

  if (testTask) {
    console.log('⚡ Initial Agent Task dispatched successfully!');
  }
}

main().catch((err) => {
  console.error('Fatal error during startup:', err);
});