import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/components/auth-provider';
import {
  type CreateResearchCallInput,
  type PortalAnnouncement,
  type PortalNotification,
  type PortalRole,
  type ResearchCall,
  type ResearchCallContentInput,
  type ResearchCallDatabaseStatus,
  type ResearchCallStatus,
} from '@/constants/portal-content';
import {
  type ProjectTimelineItem,
  type ProposalStatus,
  type ResearchProposal,
} from '@/constants/research-proposals';
import { apiRequest } from '@/services/api-client';

type ApiProposalHistory = {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
  changedBy: string | null;
};

type ApiProposalReview = {
  id: number;
  decision: string;
  comments: string;
  decidedAt: string;
  reviewerName: string;
};

type ApiProposal = {
  id: number;
  referenceNo: string;
  title: string;
  abstractText: string;
  studyType: string;
  department: string;
  status: string;
  submittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  facultyName: string;
  history: ApiProposalHistory[];
  reviews: ApiProposalReview[];
};

type ApiNotification = {
  id: number;
  type: PortalNotification['type'];
  title: string;
  message: string;
  href: string | null;
  proposalId: number | null;
  readAt: string | null;
  createdAt: string;
};

type ApiResearchCall = {
  id: number;
  title: string;
  sponsor: string | null;
  description: string;
  budget: string | null;
  category: string | null;
  eligibility: string | null;
  opensAt: string | null;
  closesAt: string | null;
  status: ResearchCallDatabaseStatus;
  updatedAt: string;
};

type FacultyDashboard = {
  notices: {
    id: number;
    category: string;
    title: string;
    body: string;
    publishedAt: string | null;
  }[];
};

type PortalDataContextValue = {
  projects: ResearchProposal[];
  notifications: PortalNotification[];
  researchCalls: ResearchCall[];
  announcements: PortalAnnouncement[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAllNotificationsRead: (role?: PortalRole) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  recordDecision: (projectId: string, status: ProposalStatus, reviewNote?: string) => Promise<void>;
  createResearchCall: (input: CreateResearchCallInput) => Promise<void>;
  updateResearchCall: (databaseId: number, input: ResearchCallContentInput) => Promise<void>;
  changeResearchCallStatus: (databaseId: number, status: 'open' | 'closed') => Promise<void>;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

const statusLabels: Record<string, ProposalStatus> = {
  approved: 'Approved',
  rejected: 'Rejected',
  revision_required: 'For Revision',
  draft: 'Pending Review',
  submitted: 'Pending Review',
  under_evaluation: 'Pending Review',
};

const statusProgress: Record<string, number> = {
  draft: 15,
  submitted: 35,
  under_evaluation: 55,
  revision_required: 70,
  approved: 100,
  rejected: 100,
};

const timelineTitles: Record<string, string> = {
  draft: 'Proposal drafted',
  submitted: 'Proposal submitted',
  under_evaluation: 'Institutional evaluation',
  revision_required: 'Revision requested',
  approved: 'Proposal approved',
  rejected: 'Proposal rejected',
};

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null | undefined, fallback = 'Not recorded') {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
    : fallback;
}

function formatDateInput(value: string | null | undefined) {
  return parseDate(value)?.toISOString().slice(0, 10) ?? '';
}

function formatRelativeTime(value: string) {
  const date = parseDate(value);
  if (!date) return 'Recently';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function nextAction(status: string) {
  if (status === 'revision_required') return 'Review the Research Head comments and prepare the requested revision.';
  if (status === 'approved') return 'Prepare the implementation plan and initial progress schedule.';
  if (status === 'rejected') return 'Review the recorded decision before preparing a new submission.';
  return 'No action is required while the proposal is being evaluated.';
}

function mapProposal(proposal: ApiProposal): ResearchProposal {
  const activity = proposal.history.length > 0
    ? proposal.history
    : [{
        id: proposal.id,
        fromStatus: null,
        toStatus: proposal.status,
        note: null,
        createdAt: proposal.createdAt,
        changedBy: null,
      }];
  const timeline: ProjectTimelineItem[] = activity.map((item, index) => ({
    id: String(item.id),
    title: timelineTitles[item.toStatus] ?? item.toStatus.replaceAll('_', ' '),
    date: formatDate(item.createdAt),
    description: item.note || (item.changedBy ? `Recorded by ${item.changedBy}.` : 'Status recorded in ATHENA.'),
    state:
      index === activity.length - 1 && proposal.status === 'revision_required'
        ? 'current'
        : 'complete',
  }));
  const latestReview = proposal.reviews.at(-1);
  const latestHistory = proposal.history.at(-1);

  return {
    databaseId: proposal.id,
    id: proposal.referenceNo,
    title: proposal.title,
    faculty: proposal.facultyName,
    initials: initials(proposal.facultyName),
    department: proposal.department,
    submitted: formatDate(proposal.submittedAt),
    submittedDate: formatDate(proposal.submittedAt),
    lastUpdated: formatRelativeTime(proposal.updatedAt),
    status: statusLabels[proposal.status] ?? 'Pending Review',
    budget: 'Not recorded',
    duration: 'Not recorded',
    category: proposal.studyType,
    abstract: proposal.abstractText,
    progress: statusProgress[proposal.status] ?? 35,
    latestFeedback:
      latestReview?.comments || latestHistory?.note || 'The proposal is recorded in the institutional review queue.',
    nextAction: nextAction(proposal.status),
    timeline,
    reviewNote: latestReview?.comments,
    decidedAt: proposal.decidedAt ? formatDate(proposal.decidedAt) : undefined,
  };
}

function getCallStatus(call: ApiResearchCall): ResearchCallStatus {
  if (call.status === 'draft') return 'Draft';
  if (call.status === 'closed') return 'Closed';
  const now = Date.now();
  const opensAt = parseDate(call.opensAt)?.getTime();
  const closesAt = parseDate(call.closesAt)?.getTime();
  if (opensAt && opensAt > now) return 'Upcoming';
  if (closesAt && closesAt < now) return 'Closed';
  if (closesAt && closesAt - now <= 7 * 24 * 60 * 60 * 1000) return 'Closing Soon';
  return 'Open';
}

function mapResearchCall(call: ApiResearchCall): ResearchCall {
  return {
    databaseId: call.id,
    id: `CALL-${String(call.id).padStart(4, '0')}`,
    title: call.title,
    sponsor: call.sponsor || 'BatStateU Research Office',
    status: getCallStatus(call),
    deadline: formatDate(call.closesAt, 'No deadline'),
    budget: call.budget || 'See call details',
    category: call.category || 'Institutional Research',
    description: call.description,
    eligibility: call.eligibility || 'BatStateU faculty researchers.',
    opensAt: formatDateInput(call.opensAt),
    closesAt: formatDateInput(call.closesAt),
    databaseStatus: call.status,
    updatedAt: call.updatedAt,
  };
}

export function PortalDataProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ResearchProposal[]>([]);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [researchCalls, setResearchCalls] = useState<ResearchCall[]>([]);
  const [announcements, setAnnouncements] = useState<PortalAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setNotifications([]);
      setResearchCalls([]);
      setAnnouncements([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const role: PortalRole = user.role === 'faculty' ? 'faculty' : 'research-head';
      const requests: [
        Promise<{ proposals: ApiProposal[] }>,
        Promise<{ notifications: ApiNotification[] }>,
        Promise<{ researchCalls: ApiResearchCall[] }>,
      ] = [
        apiRequest('/proposals'),
        apiRequest('/notifications'),
        apiRequest('/research-calls'),
      ];
      const [proposalResult, notificationResult, callResult] = await Promise.all(requests);
      setProjects(proposalResult.proposals.map(mapProposal));
      setNotifications(
        notificationResult.notifications.map((notification) => ({
          id: String(notification.id),
          role,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          timeLabel: formatRelativeTime(notification.createdAt),
          createdAt: notification.createdAt,
          read: Boolean(notification.readAt),
          href: notification.href || undefined,
          projectId: notification.proposalId ? String(notification.proposalId) : undefined,
        })),
      );
      setResearchCalls(callResult.researchCalls.map(mapResearchCall));

      if (user.role === 'faculty') {
        const dashboard = await apiRequest<FacultyDashboard>('/dashboards/faculty');
        setAnnouncements(
          dashboard.notices.map((notice) => ({ ...notice, id: String(notice.id) })),
        );
      } else {
        setAnnouncements([]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load the ATHENA records.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllNotificationsRead = useCallback(async (_role?: PortalRole) => {
    await apiRequest('/notifications/read-all', { method: 'PATCH' });
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const recordDecision = useCallback(
    async (projectId: string, status: ProposalStatus, reviewNote?: string) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) throw new Error('Proposal not found.');
      const decision =
        status === 'Approved'
          ? 'approved'
          : status === 'For Revision'
            ? 'revision_required'
            : 'rejected';
      await apiRequest(`/proposals/${project.databaseId}/decision`, {
        method: 'PATCH',
        body: { decision, comments: reviewNote?.trim() || `Decision recorded: ${status}.` },
      });
      await refresh();
    },
    [projects, refresh],
  );

  const createResearchCall = useCallback(
    async (input: CreateResearchCallInput) => {
      await apiRequest('/research-calls', { method: 'POST', body: input });
      await refresh();
    },
    [refresh],
  );

  const updateResearchCall = useCallback(
    async (databaseId: number, input: ResearchCallContentInput) => {
      await apiRequest(`/research-calls/${databaseId}`, { method: 'PATCH', body: input });
      await refresh();
    },
    [refresh],
  );

  const changeResearchCallStatus = useCallback(
    async (databaseId: number, status: 'open' | 'closed') => {
      await apiRequest(`/research-calls/${databaseId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      projects,
      notifications,
      researchCalls,
      announcements,
      isLoading,
      error,
      refresh,
      markAllNotificationsRead,
      markNotificationRead,
      recordDecision,
      createResearchCall,
      updateResearchCall,
      changeResearchCallStatus,
    }),
    [
      announcements,
      createResearchCall,
      changeResearchCallStatus,
      error,
      isLoading,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      projects,
      recordDecision,
      refresh,
      researchCalls,
      updateResearchCall,
    ],
  );

  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
}

export function usePortalData() {
  const context = use(PortalDataContext);
  if (!context) throw new Error('usePortalData must be used within PortalDataProvider');
  return context;
}
