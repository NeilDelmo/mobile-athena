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

export type ResearchCallStatus = 'Draft' | 'Open' | 'Closing Soon' | 'Upcoming' | 'Closed';
export type ResearchCallDatabaseStatus = 'draft' | 'open' | 'closed';

export type ResearchCall = {
  databaseId: number;
  id: string;
  title: string;
  sponsor: string;
  status: ResearchCallStatus;
  deadline: string;
  budget: string;
  category: string;
  description: string;
  eligibility: string;
  opensAt: string;
  closesAt: string;
  databaseStatus: ResearchCallDatabaseStatus;
  updatedAt: string;
};

export type PortalAnnouncement = {
  id: string;
  category: string;
  title: string;
  body: string;
  publishedAt: string | null;
};

export type ResearchCallContentInput = {
  title: string;
  sponsor: string;
  description: string;
  budget: string;
  category: string;
  eligibility: string;
  opensAt: string;
  closesAt: string;
};

export type CreateResearchCallInput = ResearchCallContentInput & {
  status: 'draft' | 'open';
};
