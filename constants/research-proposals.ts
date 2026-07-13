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

export const initialResearchProposals: ResearchProposal[] = [
  {
    id: 'RP-2026-014',
    title: 'Smart Campus Energy Monitoring System',
    faculty: 'Quey Jinnet Baldos',
    initials: 'QB',
    department: 'College of Informatics and Computing Sciences',
    submitted: '2 days ago',
    submittedDate: 'July 11, 2026',
    lastUpdated: 'July 13, 2026',
    status: 'Pending Review',
    budget: '₱185,000',
    duration: '10 months',
    category: 'Applied Technology',
    abstract:
      'A campus-wide monitoring framework that uses connected sensors and predictive analytics to identify avoidable energy consumption across university facilities.',
    progress: 48,
    latestFeedback: 'The proposal passed initial screening and is queued for the Research Head decision.',
    nextAction: 'No action is required while the proposal is being evaluated.',
    timeline: [
      {
        id: 'RP-2026-014-draft',
        title: 'Proposal prepared',
        date: 'July 8, 2026',
        description: 'The faculty proposal and supporting requirements were completed.',
        state: 'complete',
      },
      {
        id: 'RP-2026-014-submitted',
        title: 'Submitted to ATHENA',
        date: 'July 11, 2026',
        description: 'The proposal was recorded and sent for institutional screening.',
        state: 'complete',
      },
      {
        id: 'RP-2026-014-review',
        title: 'Research Head evaluation',
        date: 'In progress',
        description: 'The submission is currently being reviewed for a decision.',
        state: 'current',
      },
      {
        id: 'RP-2026-014-decision',
        title: 'Final decision',
        date: 'Pending',
        description: 'The recorded decision will appear here when evaluation is complete.',
        state: 'upcoming',
      },
    ],
  },
  {
    id: 'RP-2026-009',
    title: 'AI-Assisted Student Support Framework',
    faculty: 'Quey Jinnet Baldos',
    initials: 'QB',
    department: 'College of Informatics and Computing Sciences',
    submitted: '1 week ago',
    submittedDate: 'July 5, 2026',
    lastUpdated: 'July 12, 2026',
    status: 'For Revision',
    budget: '₱240,000',
    duration: '12 months',
    category: 'Education Technology',
    abstract:
      'An ethical decision-support framework for identifying students who may benefit from early academic interventions while protecting privacy and faculty oversight.',
    progress: 64,
    latestFeedback: 'Clarify the consent process and add specific data-retention safeguards to the methodology.',
    nextAction: 'Prepare the requested revisions for resubmission on the web portal.',
    reviewNote: 'Please clarify the consent process and data-retention safeguards.',
    decidedAt: 'July 12, 2026',
    timeline: [
      {
        id: 'RP-2026-009-draft',
        title: 'Proposal prepared',
        date: 'July 2, 2026',
        description: 'The initial manuscript and research plan were completed.',
        state: 'complete',
      },
      {
        id: 'RP-2026-009-submitted',
        title: 'Submitted to ATHENA',
        date: 'July 5, 2026',
        description: 'The proposal entered the institutional approval workflow.',
        state: 'complete',
      },
      {
        id: 'RP-2026-009-review',
        title: 'Evaluation completed',
        date: 'July 12, 2026',
        description: 'The Research Head completed the first evaluation.',
        state: 'complete',
      },
      {
        id: 'RP-2026-009-revision',
        title: 'Revision requested',
        date: 'Action required',
        description: 'Methodology and consent details must be revised before reconsideration.',
        state: 'current',
      },
    ],
  },
  {
    id: 'RP-2026-004',
    title: 'Digital Archive of Indigenous Knowledge',
    faculty: 'Quey Jinnet Baldos',
    initials: 'QB',
    department: 'College of Informatics and Computing Sciences',
    submitted: '2 weeks ago',
    submittedDate: 'June 28, 2026',
    lastUpdated: 'July 8, 2026',
    status: 'Approved',
    budget: '₱165,000',
    duration: '14 months',
    category: 'Culture and Heritage',
    abstract:
      'A community-governed digital archive designed to preserve oral histories and cultural materials while respecting consent, ownership, and access protocols.',
    progress: 100,
    latestFeedback: 'Approved for implementation. Coordinate the project start with the Research Office.',
    nextAction: 'Prepare the implementation plan and initial progress schedule.',
    reviewNote: 'Approved for implementation with the documented community-consent safeguards.',
    decidedAt: 'July 8, 2026',
    timeline: [
      {
        id: 'RP-2026-004-draft',
        title: 'Proposal prepared',
        date: 'June 24, 2026',
        description: 'The manuscript and community-consent plan were completed.',
        state: 'complete',
      },
      {
        id: 'RP-2026-004-submitted',
        title: 'Submitted to ATHENA',
        date: 'June 28, 2026',
        description: 'The proposal entered institutional screening.',
        state: 'complete',
      },
      {
        id: 'RP-2026-004-review',
        title: 'Evaluation completed',
        date: 'July 7, 2026',
        description: 'The submission satisfied the institutional review requirements.',
        state: 'complete',
      },
      {
        id: 'RP-2026-004-approved',
        title: 'Proposal approved',
        date: 'July 8, 2026',
        description: 'The project was cleared to proceed to implementation planning.',
        state: 'complete',
      },
    ],
  },
];
