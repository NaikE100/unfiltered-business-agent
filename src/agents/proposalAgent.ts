import { supabase } from '../config/db.js';
import { logAgentAction } from '../services/logger.js';

interface Lead {
  id: string;
  title: string;
  company: string;
  location: string;
  stack: string[];
  description: string;
  match_score: number;
}

export async function runProposalAgent() {
  await logAgentAction('ProposalAgent', 'Proposal Execution Started', 'info', {
    message: 'ProposalAgent checking for new qualified scouted leads...'
  });

  try {
    const { data: leads, error } = await supabase
      .from('scouted_leads')
      .select('*')
      .eq('status', 'new')
      .gte('match_score', 30)
      .limit(5);

    if (error) throw error;

    if (!leads || leads.length === 0) {
      await logAgentAction('ProposalAgent', 'Proposal Execution Completed', 'info', {
        message: 'No new high-match leads awaiting proposal generation.'
      });
      return;
    }

    let generatedCount = 0;

    for (const lead of leads as Lead[]) {
      const techList = Array.isArray(lead.stack) ? lead.stack.join(', ') : 'Node.js, TypeScript';

      const proposalText = `
### Proposal Outline: ${lead.title}

**Target Company:** ${lead.company}
**Identified Requirements:** ${techList}

**1. Executive Summary:**
Unfiltered Ventures specializes in full-stack architecture, API integrations, and scalable cloud-hosted solutions (${techList}). We deliver performant, secure, and maintainable systems tailored to product requirements.

**2. Proposed Stack & Approach:**
- Core Architecture: Modern TypeScript & Node.js environment
- Backend/Data: Supabase / PostgreSQL or MySQL database schema & query optimization
- Frontend/Delivery: High-performance user interface with React / Next.js & Tailwind CSS
- System Reliability: Continuous deployment & background task execution via PM2 / Linux server infrastructure

**3. Next Steps:**
Schedule an introductory discovery call to detail project milestones, timeline, and exact deliverables.
      `.trim();

      const { error: taskError } = await supabase.from('agent_tasks').insert({
        title: `Review Proposal: ${lead.title}`,
        category: 'scouting',
        status: 'pending',
        payload: {
          lead_id: lead.id,
          company: lead.company,
          proposal_draft: proposalText
        }
      });

      if (taskError) {
        await logAgentAction('ProposalAgent', 'Task Queue Failed', 'error', {
          leadId: lead.id,
          error: taskError.message
        });
        continue;
      }

      await supabase
        .from('scouted_leads')
        .update({ status: 'proposal_drafted' })
        .eq('id', lead.id);

      generatedCount++;
    }

    await logAgentAction('ProposalAgent', 'Proposal Execution Completed', 'info', {
      proposalsDrafted: generatedCount
    });
  } catch (err: any) {
    await logAgentAction('ProposalAgent', 'Proposal Execution Exception', 'error', {
      error: err.message
    });
  }
}