export type PortalRole = 'faculty' | 'research-head';

export type PortalNotificationType =
  | 'announcement'
  | 'deadline'
  | 'decision'
  | 'revision'
  | 'submission';

export type PortalNotification = {
  id: string;
  role: PortalRole;
  type: PortalNotificationType;
  title: string;
  message: string;
  timeLabel: string;
  createdAt: string;
  read: boolean;
  href?: string;
  projectId?: string;
};

export type ResearchCallStatus = 'Closing Soon' | 'Open' | 'Upcoming';

export type ResearchCall = {
  id: string;
  title: string;
  sponsor: string;
  status: ResearchCallStatus;
  deadline: string;
  budget: string;
  category: string;
  description: string;
  eligibility: string;
};

export const initialPortalNotifications: PortalNotification[] = [
  {
    id: 'faculty-revision-rp-2026-009',
    role: 'faculty',
    type: 'revision',
    title: 'Revision requested',
    message: 'The Research Head added methodology and consent notes to RP-2026-009.',
    timeLabel: 'Yesterday',
    createdAt: '2026-07-12T15:20:00+08:00',
    read: false,
    href: '/faculty-project/RP-2026-009',
    projectId: 'RP-2026-009',
  },
  {
    id: 'faculty-call-grant-2026',
    role: 'faculty',
    type: 'deadline',
    title: 'Research grant closes soon',
    message: 'The 2026 Faculty Research Grant call closes on July 20.',
    timeLabel: '2 days ago',
    createdAt: '2026-07-11T09:00:00+08:00',
    read: false,
    href: '/research-calls?role=faculty',
  },
  {
    id: 'faculty-approved-rp-2026-004',
    role: 'faculty',
    type: 'decision',
    title: 'Proposal approved',
    message: 'RP-2026-004 was approved for implementation planning.',
    timeLabel: 'July 8',
    createdAt: '2026-07-08T14:40:00+08:00',
    read: true,
    href: '/faculty-project/RP-2026-004',
    projectId: 'RP-2026-004',
  },
  {
    id: 'head-new-rp-2026-014',
    role: 'research-head',
    type: 'submission',
    title: 'Proposal ready for screening',
    message: 'RP-2026-014 is waiting for your institutional evaluation.',
    timeLabel: '2 days ago',
    createdAt: '2026-07-11T11:30:00+08:00',
    read: false,
    href: '/research-head',
    projectId: 'RP-2026-014',
  },
  {
    id: 'head-ethics-update',
    role: 'research-head',
    type: 'announcement',
    title: 'Ethics review guidance updated',
    message: 'The institutional ethics checklist is available for the current review cycle.',
    timeLabel: 'July 10',
    createdAt: '2026-07-10T10:00:00+08:00',
    read: false,
  },
];

export const researchCalls: ResearchCall[] = [
  {
    id: 'RC-2026-07',
    title: '2026 Faculty Research Grant',
    sponsor: 'BatStateU Research Office',
    status: 'Closing Soon',
    deadline: 'July 20, 2026',
    budget: 'Up to ₱250,000',
    category: 'Institutional Research',
    description:
      'Supports faculty-led studies that address university priorities and demonstrate a clear path to measurable impact.',
    eligibility: 'Full-time faculty members and faculty-led multidisciplinary teams.',
  },
  {
    id: 'RC-2026-08',
    title: 'Sustainable Campus Innovation Call',
    sponsor: 'University Innovation Council',
    status: 'Open',
    deadline: 'August 15, 2026',
    budget: 'Up to ₱180,000',
    category: 'Sustainability',
    description:
      'Invites applied research on energy, mobility, waste reduction, climate resilience, and sustainable campus operations.',
    eligibility: 'Faculty researchers from any college, with student participation encouraged.',
  },
  {
    id: 'RC-2026-09',
    title: 'Prototype and Technology Seed Fund',
    sponsor: 'Technology Transfer and Innovation Office',
    status: 'Open',
    deadline: 'August 30, 2026',
    budget: 'Up to ₱150,000',
    category: 'Applied Technology',
    description:
      'Provides early-stage support for validating prototypes, research software, devices, and technology-enabled services.',
    eligibility: 'Faculty members with a completed concept note or preliminary proof of concept.',
  },
  {
    id: 'RC-2026-10',
    title: 'Early Career Research Mentorship Program',
    sponsor: 'Research Capacity Development Unit',
    status: 'Upcoming',
    deadline: 'September 18, 2026',
    budget: 'Mentorship and project support',
    category: 'Capacity Building',
    description:
      'Pairs early-career faculty with experienced research mentors for proposal development and publication planning.',
    eligibility: 'Faculty members within their first five years of academic appointment.',
  },
];
