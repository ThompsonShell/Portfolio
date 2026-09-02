// Type definitions matching Django API responses

export interface WorkStat {
  id: number;
  value: string;
  label: string;
  order: number;
}

export interface WorkFeature {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface WorkChallenge {
  id: number;
  problem_title: string;
  problem_description: string;
  solution: string;
  order: number;
}

export type WorkType = "web_app" | "mobile" | "api" | "open_source" | "other";

export interface Work {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  work_type: WorkType;
  work_type_display: string;
  status: string;
  cover_image_url: string;
  accent_color: string;
  tech_tags: string[];
  github_url: string;
  live_url: string;
  is_featured: boolean;
  stats: WorkStat[];
  order: number;
  created_at: string;
}

export interface WorkDetail extends Work {
  overview: string;
  role: string;
  duration: string;
  team_size: string;
  architecture: string;
  sponsor_url: string;
  status_display: string;
  features: WorkFeature[];
  challenges: WorkChallenge[];
  updated_at: string;
}

export interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  description: string;
  photo_url: string;
  initials: string;
  accent_color: string;
  tags: string[];
  profile_url: string;
  is_featured: boolean;
  order: number;
}

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string;
  excerpt: string;
  reading_time: number;
  published_at: string;
  views_count: number;
}

export interface PostDetail extends PostSummary {
  content: string;
}

export interface Lecture {
  id: number;
  title: string;
  description: string;
  youtube_video_id: string | null;
  lecture_video: string | null;
  category: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  order: number;
  created_at: string;
  views_count: number;
  course: number | null;
  course_title: string;
  course_slug: string;
  /** 1-based index of this lesson within its course. */
  position: number;
  course_lesson_count: number;
  prev_id: number | null;
  next_id: number | null;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  accent_color: string;
  cover_image_url: string;
  is_featured: boolean;
  order: number;
  lesson_count: number;
  total_seconds: number;
  total_views: number;
  created_at: string;
}

export interface CourseDetail extends Course {
  lectures: Lecture[];
}

/** Real site-wide totals — see /api/stats/. */
export interface SiteStats {
  works: number;
  courses: number;
  lectures: number;
  posts: number;
  mentors: number;
  lecture_hours: number;
  new_lectures: number;
  post_views: number;
  lecture_views: number;
}

export interface ViewResponse {
  views_count: number;
  counted: boolean;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
  order: number;
}

export interface Skill {
  id: number;
  name: string;
  order: number;
}

export interface About {
  photo_url: string;
  resume_url: string;
  bio_text: string;
  github_url: string;
  linkedin_url: string;
  telegram_url: string;
  youtube_url: string;
  email: string;
  experiences: Experience[];
  skills: Skill[];
}

export interface CoffeeRequestPayload {
  name: string;
  email: string;
  preferred_datetime: string;
  location: string;
  topic: string;
}

export interface CoffeeRequestResponse extends CoffeeRequestPayload {
  id: number;
  created_at: string;
}

// DRF paginated response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Legacy — the old /api/projects/ endpoint, superseded by Work. */
export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  cover_image_url: string;
  tech_tags: string[];
  github_url: string;
  live_url: string;
  sponsor_url: string;
  is_featured: boolean;
  order: number;
  created_at: string;
}
