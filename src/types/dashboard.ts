export type ProjectStatus = 'draft' | 'in_design' | 'finished';

export interface StyleUsage {
  slug: string;
  name: string;
  count: number;
}

export interface ActivityItem {
  kind: 'project' | 'redesign';
  title: string;
  project_id: string;
  happened_at: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  style_name: string | null;
  room_type_name: string | null;
  estimated_budget: string;
  before_image_url: string | null;
  after_image_url: string | null;
  redesign_count: number;
  created_at: string | null;
  updated_at: string;
}

export interface Dashboard {
  stats: {
    projects: number;
    redesigns: number;
    favorite_style: StyleUsage | null;
    total_budget: string;
  };
  style_usage: StyleUsage[];
  recent_activity: ActivityItem[];
  recent_projects: ProjectSummary[];
}
