import type { Locale } from "./i18n/dictionaries";
import type {
  About,
  CoffeeRequestPayload,
  CoffeeRequestResponse,
  Course,
  CourseDetail,
  Lecture,
  Mentor,
  PaginatedResponse,
  PostDetail,
  PostSummary,
  SiteStats,
  ViewResponse,
  Work,
  WorkDetail,
  WorkType,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/** Builds `?lang=…&foo=…`, dropping empty values. */
function query(locale: Locale | undefined, extra: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  if (locale) params.set("lang", locale);
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── Works (formerly Projects) ─────────────────────────────

export async function getWorks(
  locale?: Locale,
  filters: { type?: WorkType | "all"; tag?: string } = {}
): Promise<Work[]> {
  const type = filters.type && filters.type !== "all" ? filters.type : undefined;
  const data = await fetchApi<PaginatedResponse<Work>>(
    `/works/${query(locale, { type, tag: filters.tag })}`
  );
  return data.results;
}

export async function getFeaturedWorks(locale?: Locale): Promise<Work[]> {
  const data = await fetchApi<PaginatedResponse<Work>>(
    `/works/${query(locale, { featured: "true" })}`
  );
  return data.results;
}

export async function getWork(slug: string, locale?: Locale): Promise<WorkDetail> {
  return fetchApi<WorkDetail>(`/works/${slug}/${query(locale)}`);
}

// ── Mentors ───────────────────────────────────────────────

export async function getMentors(locale?: Locale, featuredOnly = false): Promise<Mentor[]> {
  const data = await fetchApi<PaginatedResponse<Mentor>>(
    `/mentors/${query(locale, { featured: featuredOnly ? "true" : undefined })}`
  );
  return data.results;
}

// ── Blog ──────────────────────────────────────────────────

export async function getPosts(locale?: Locale): Promise<PostSummary[]> {
  const data = await fetchApi<PaginatedResponse<PostSummary>>(`/blog/${query(locale)}`);
  return data.results;
}

export async function getPost(slug: string, locale?: Locale): Promise<PostDetail> {
  return fetchApi<PostDetail>(`/blog/${slug}/${query(locale)}`);
}

// ── Lectures ──────────────────────────────────────────────

export async function getLectures(
  locale?: Locale,
  filters: { category?: string; search?: string } = {}
): Promise<Lecture[]> {
  const category =
    filters.category && filters.category !== "All" ? filters.category : undefined;
  const data = await fetchApi<PaginatedResponse<Lecture>>(
    `/lectures/${query(locale, { category, search: filters.search })}`
  );
  return data.results;
}

export async function getLecture(id: string, locale?: Locale): Promise<Lecture> {
  return fetchApi<Lecture>(`/lectures/${id}/${query(locale)}`);
}

// ── Courses ───────────────────────────────────────────────

export async function getCourses(
  locale?: Locale,
  filters: { category?: string; featured?: boolean } = {}
): Promise<Course[]> {
  const category =
    filters.category && filters.category !== "All" ? filters.category : undefined;
  const data = await fetchApi<PaginatedResponse<Course>>(
    `/courses/${query(locale, {
      category,
      featured: filters.featured ? "true" : undefined,
    })}`
  );
  return data.results;
}

export async function getCourse(slug: string, locale?: Locale): Promise<CourseDetail> {
  return fetchApi<CourseDetail>(`/courses/${slug}/${query(locale)}`);
}

// ── Stats & view counting ─────────────────────────────────

/** Real totals for the counters on the site — never derive these from a
 *  paginated list, which under-reports past PAGE_SIZE rows. */
export async function getSiteStats(): Promise<SiteStats> {
  return fetchApi<SiteStats>("/stats/");
}

/** Records one view. The API counts each visitor once, so calling this on
 *  every mount is safe — a repeat comes back with counted:false. */
export async function registerPostView(slug: string): Promise<ViewResponse> {
  return fetchApi<ViewResponse>(`/blog/${slug}/view/`, { method: "POST" });
}

export async function registerLectureView(id: string | number): Promise<ViewResponse> {
  return fetchApi<ViewResponse>(`/lectures/${id}/view/`, { method: "POST" });
}

// ── About ─────────────────────────────────────────────────

export async function getAbout(locale?: Locale): Promise<About> {
  return fetchApi<About>(`/about/${query(locale)}`);
}

// ── Coffee ────────────────────────────────────────────────

export async function createCoffeeRequest(
  payload: CoffeeRequestPayload,
  locale?: Locale
): Promise<CoffeeRequestResponse> {
  return fetchApi<CoffeeRequestResponse>(`/coffee-requests/${query(locale)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
