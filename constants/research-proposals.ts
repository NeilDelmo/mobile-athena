export type ProposalStatus = 'Pending Review' | 'For Revision' | 'Approved' | 'Rejected';

export type ProjectTimelineState = 'complete' | 'current' | 'upcoming';

export type ProjectTimelineItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  state: ProjectTimelineState;
};

export type ResearchProposal = {
  databaseId: number;
  id: string;
  title: string;
  faculty: string;
  initials: string;
  department: string;
  submitted: string;
  submittedDate: string;
  lastUpdated: string;
  status: ProposalStatus;
  budget: string;
  duration: string;
  category: string;
  abstract: string;
  progress: number;
  latestFeedback: string;
  nextAction: string;
  timeline: ProjectTimelineItem[];
  reviewNote?: string;
  decidedAt?: string;
};

export function getFacultyStatusLabel(status: ProposalStatus) {
  return status === 'Pending Review' ? 'Under Evaluation' : status;
}
