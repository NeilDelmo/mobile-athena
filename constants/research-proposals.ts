export type ProposalStatus = 'Pending Review' | 'For Revision' | 'Approved' | 'Rejected';

export type ResearchProposal = {
  id: string;
  title: string;
  faculty: string;
  initials: string;
  department: string;
  submitted: string;
  status: ProposalStatus;
  budget: string;
  duration: string;
  category: string;
  abstract: string;
};

export const initialResearchProposals: ResearchProposal[] = [
  {
    id: 'RP-2026-014',
    title: 'Smart Campus Energy Monitoring System',
    faculty: 'Dr. Maria Santos',
    initials: 'MS',
    department: 'College of Engineering',
    submitted: '2 days ago',
    status: 'Pending Review',
    budget: '₱185,000',
    duration: '10 months',
    category: 'Applied Technology',
    abstract:
      'A campus-wide monitoring framework that uses connected sensors and predictive analytics to identify avoidable energy consumption across university facilities.',
  },
  {
    id: 'RP-2026-013',
    title: 'Community-Based Disaster Preparedness',
    faculty: 'Prof. Elias Cruz',
    initials: 'EC',
    department: 'College of Social Sciences',
    submitted: '3 days ago',
    status: 'Pending Review',
    budget: '₱120,000',
    duration: '8 months',
    category: 'Community Development',
    abstract:
      'A participatory study developing localized preparedness resources with communities exposed to seasonal flooding and typhoon-related displacement.',
  },
  {
    id: 'RP-2026-009',
    title: 'AI-Assisted Student Support Framework',
    faculty: 'Dr. Camille Reyes',
    initials: 'CR',
    department: 'College of Computing',
    submitted: '1 week ago',
    status: 'For Revision',
    budget: '₱240,000',
    duration: '12 months',
    category: 'Education Technology',
    abstract:
      'An ethical decision-support framework for identifying students who may benefit from early academic interventions while protecting privacy and faculty oversight.',
  },
  {
    id: 'RP-2026-004',
    title: 'Digital Archive of Indigenous Knowledge',
    faculty: 'Prof. Nina Flores',
    initials: 'NF',
    department: 'College of Humanities',
    submitted: '2 weeks ago',
    status: 'Approved',
    budget: '₱165,000',
    duration: '14 months',
    category: 'Culture and Heritage',
    abstract:
      'A community-governed digital archive designed to preserve oral histories and cultural materials while respecting consent, ownership, and access protocols.',
  },
];
