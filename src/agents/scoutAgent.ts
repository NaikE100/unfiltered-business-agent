import { supabase } from '../config/db.js';
import { logAgentAction } from '../services/logger.js';

interface Lead {
  title: string;
  company: string;
  location: string;
  stack: string[];
  description: string;
  url: string;
  source: string;
  matchScore: number;
}

// Target Tech Stack Keywords (all lowercase)
const TARGET_KEYWORDS = [
  'typescript', 'node', 'nodejs', 'react', 'next.js', 'nextjs',
  'php', 'mysql', 'postgresql', 'supabase', 'tailwind', 'linux', 'freelance'
];

export async function runScoutAgent() {
  await logAgentAction('ScoutAgent', 'Scout Execution Started', 'info', {
    message: 'ScoutAgent starting tech opportunity search...'
  });

  try {
    const response = await fetch('https://remoteok.com/api');
    if (!response.ok) {
      throw new Error(`Failed to fetch job feed: ${response.statusText}`);
    }

    const jobs = await response.json();
    const jobListings = Array.isArray(jobs) ? jobs.slice(1) : [];

    let newLeadsCount = 0;

    for (const job of jobListings) {
      if (!job.position || !job.url) continue;

      const title = job.position.toLowerCase();
      const tags = Array.isArray(job.tags) ? job.tags.map((t: string) => t.toLowerCase()) : [];
      const description = (job.description || '').toLowerCase();

      // Calculate Stack Match Score
      const matchedStack = TARGET_KEYWORDS.filter(keyword => 
        title.includes(keyword) || tags.includes(keyword) || description.includes(keyword)
      );

      // Require at least 2 matching keywords from our target stack
      if (matchedStack.length >= 2) {
        const lead: Lead = {
          title: job.position,
          company: job.company || 'Unknown',
          location: job.location || 'Remote',
          stack: matchedStack,
          description: job.description ? job.description.slice(0, 500) : '',
          url: job.url,
          source: 'RemoteOK Feed',
          matchScore: matchedStack.length * 15
        };

        const { error } = await supabase
          .from('scouted_leads')
          .upsert({
            title: lead.title,
            company: lead.company,
            location: lead.location,
            stack: lead.stack,
            description: lead.description,
            url: lead.url,
            source: lead.source,
            match_score: lead.matchScore,
            status: 'new'
          }, { onConflict: 'url', ignoreDuplicates: true });

        if (!error) newLeadsCount++;
      }
    }

    await logAgentAction('ScoutAgent', 'Scout Execution Completed', 'info', {
      newLeadsDiscovered: newLeadsCount
    });
  } catch (error: any) {
    await logAgentAction('ScoutAgent', 'Scout Execution Exception', 'error', {
      error: error.message
    });
  }
}