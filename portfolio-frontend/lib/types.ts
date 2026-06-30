// Type definitions matching Django API responses

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
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  order: number;
  created_at: string;
}

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  cover_image_url: string;
  excerpt: string;
  reading_time: number;
  published_at: string;
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
