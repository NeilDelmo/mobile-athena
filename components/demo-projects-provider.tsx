import { createContext, use, useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import {
  initialResearchProposals,
  type ProposalStatus,
  type ResearchProposal,
} from '@/constants/research-proposals';
import {
  initialPortalNotifications,
  type PortalNotification,
  type PortalRole,
} from '@/constants/portal-content';

type DemoProjectsContextValue = {
  projects: ResearchProposal[];
  notifications: PortalNotification[];
  markAllNotificationsRead: (role: PortalRole) => void;
  markNotificationRead: (notificationId: string) => void;
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
  const [notifications, setNotifications] = useState<PortalNotification[]>(initialPortalNotifications);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllNotificationsRead = useCallback((role: PortalRole) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.role === role ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const recordDecision = useCallback(
    (projectId: string, status: ProposalStatus, reviewNote?: string) => {
      const copy = decisionCopy[status];
      const decisionTitle =
        status === 'Approved'
          ? 'Proposal approved'
          : status === 'For Revision'
            ? 'Revision requested'
            : status === 'Rejected'
              ? 'Proposal rejected'
              : 'Proposal returned to evaluation';

      setProjects((current) =>
        current.map((project) => {
          if (project.id !== projectId) {
            return project;
          }

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

      setNotifications((current) => [
        {
          id: `faculty-${projectId}-${status.toLowerCase().replaceAll(' ', '-')}-${Date.now()}`,
          role: 'faculty',
          type: status === 'For Revision' ? 'revision' : 'decision',
          title: decisionTitle,
          message: reviewNote?.trim() || copy.feedback,
          timeLabel: 'Just now',
          createdAt: new Date().toISOString(),
          read: false,
          href: `/faculty-project/${projectId}`,
          projectId,
        },
        ...current,
      ]);
    },
    [],
  );

  const value = useMemo(
    () => ({
      projects,
      notifications,
      markAllNotificationsRead,
      markNotificationRead,
      recordDecision,
    }),
    [
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      projects,
      recordDecision,
    ],
  );

  return <DemoProjectsContext.Provider value={value}>{children}</DemoProjectsContext.Provider>;
}

export function useDemoProjects() {
  const context = use(DemoProjectsContext);

  if (!context) {
    throw new Error('useDemoProjects must be used within DemoProjectsProvider');
  }

  return context;
}
