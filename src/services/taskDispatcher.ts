import { supabase } from '../config/db.js';
import { logAgentAction } from './logger.js';

export interface TaskPayload {
    title: string;
    category: 'bakes' | 'recruitment' | 'general' | 'system';
    payload?: Record<string, any>;
}

export async function createAgentTask(task: TaskPayload) {
    try {
        const { data, error} = await supabase
        .from('agent_tasks')
        .insert([
            {
                title: task.title,
                category: task.category,
                payload: task.payload || {},
                status: 'pending',
            },
        ])
        .select();

        if (error) {
            await logAgentAction('TaskDispatcher', 'Create task Failed', 'error', { error: error.message });
            return null;
        }

        await logAgentAction('TaskDispatcher', 'Task Created: ${task.title}', 'info', { taskId: data[0].id });
        return data[0];
    } catch (err: any) {
        await logAgentAction('TaskDispatcher', 'Task Exception', 'error', { error: err.message });
        return null;
    }
}