import { supabase } from '../config/db';

export async function logAgentAction(
  agentName: string,
  action: string,
  status: 'info' | 'success' | 'warning' | 'error',
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.from('agent_logs').insert([
      {
        agent_name: agentName,
        action,
        status,
        details,
      },
    ]);

    if (error) {
      console.error(`[${agentName}] Failed to save log to Supabase:`, error.message);
    } else {
      console.log(`[${agentName}] (${status.toUpperCase()}): ${action}`);
    }
  } catch (err: any) {
    console.error(`[${agentName}] Logging exception:`, err.message || err);
  }
}