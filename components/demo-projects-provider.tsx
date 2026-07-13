import { createContext, use, useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import {
  initialResearchProposals,
  type ProposalStatus,
  type ResearchProposal,
} from '@/constants/research-proposals';

type DemoProjectsContextValue = {
  projects: ResearchProposal[];
  recordDecision: (projectId: string, status: ProposalStatus, reviewNote?: string) => void;
};

const DemoProjectsContext = createContext<DemoProjectsContextValue | null>(null);

const decisionCopy: Record<ProposalStatus, { feedback: string; nextAction: string; progress: number }> = {
  'Pending Review': {
    feedback: 'The proposal is queued for institutional evaluation.',
    nextAction: 'No action is required while the proposal is being evaluated.',
    progress: 48,
  },
  'For Revision': {
    feedback: 'The Research Head requested revisions before the proposal can proceed.',
    nextAction: 'Prepare the requested revisions for resubmission on the web portal.',
    progress: 64,
  },
  Approved: {
    feedback: 'The proposal was approved for implementation.',
    nextAction: 'Prepare the implementation plan and initial progress schedule.',
    progress: 100,
  },
  Rejected: {
    feedback: 'The proposal received a final decision and will not proceed in its current form.',
    nextAction: 'Review the decision notes before preparing a new submission.',
    progress: 100,
  },
};

export function DemoProjectsProvider({ children }: PropsWithChildren) {
  const [projects, setProjects] = useState<ResearchProposal[]>(initialResearchProposals);

  const recordDecision = useCallback(
    (projectId: string, status: ProposalStatus, reviewNote?: string) => {
      const copy = decisionCopy[status];

      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) {
            return project;
          }

          const decisionTitle =
            status === 'Approved'
              ? 'Proposal approved'
              : status === 'For Revision'
                ? 'Revision requested'
                : status === 'Rejected'
                  ? 'Proposal rejected'
                  : 'Research Head evaluation';

          const updatedTimeline = project.timeline
            .filter((item) => item.state !== 'upcoming')
            .map((item) => (item.state === 'current' ? { ...item, state: 'complete' as const } : item));

          updatedTimeline.push({
            id: `${project.id}-${status.toLowerCase().replaceAll(' ', '-')}`,
            title: decisionTitle,
            date: 'Recorded today',
            description: reviewNote?.trim() || copy.feedback,
            state: status === 'For Revision' ? 'current' : 'complete',
          });

          return {
            ...project,
            status,
            progress: copy.progress,
            latestFeedback: reviewNote?.trim() || copy.feedback,
            nextAction: copy.nextAction,
            reviewNote: reviewNote?.trim() || undefined,
            decidedAt: status === 'Pending Review' ? undefined : 'Today',
            lastUpdated: 'Today',
            timeline: updatedTimeline,
          };
        }),
      );
    },
    [],
  );

  const value = useMemo(() => ({ projects, recordDecision }), [projects, recordDecision]);

  return <DemoProjectsContext.Provider value={value}>{children}</DemoProjectsContext.Provider>;
}

export function useDemoProjects() {
  const context = use(DemoProjectsContext);

  if (!context) {
    throw new Error('useDemoProjects must be used within DemoProjectsProvider');
  }

  return context;
}
