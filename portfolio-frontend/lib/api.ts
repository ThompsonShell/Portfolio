import type {
  Project,
  PostSummary,
  PostDetail,
  Lecture,
  About,
  CoffeeRequestPayload,
  CoffeeRequestResponse,
  PaginatedResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    cache: "no-store", // prevent stale caching for dynamic search
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

// ── Projects ──────────────────────────────────────────────

export async function getProjects(tag?: string): Promise<Project[]> {
  const params = new URLSearchParams();
  if (tag && tag !== "All") params.set("tag", tag);
  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await fetchApi<PaginatedResponse<Project>>(`/projects/${query}`);
  return data.results;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await fetchApi<PaginatedResponse<Project>>("/projects/?featured=true");
  return data.results.slice(0, 3);
}

export async function getProject(id: number): Promise<Project> {
  return fetchApi<Project>(`/projects/${id}/`);
}

// ── Blog ──────────────────────────────────────────────────

export async function getPosts(): Promise<PostSummary[]> {
  const data = await fetchApi<PaginatedResponse<PostSummary>>("/blog/");
  return data.results;
}

export async function getPost(slug: string): Promise<PostDetail> {
  return fetchApi<PostDetail>(`/blog/${slug}/`);
}

// ── Lectures ──────────────────────────────────────────────

export async function getLectures(category?: string, search?: string): Promise<Lecture[]> {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (search) params.set("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await fetchApi<PaginatedResponse<Lecture>>(`/lectures/${query}`);
  return data.results;
}

export async function getLecture(id: string): Promise<Lecture> {
  return fetchApi<Lecture>(`/lectures/${id}/`);
}

// ── About ─────────────────────────────────────────────────

export async function getAbout(): Promise<About> {
  return fetchApi<About>("/about/");
}

// ── Coffee ────────────────────────────────────────────────

export async function createCoffeeRequest(
  payload: CoffeeRequestPayload
): Promise<CoffeeRequestResponse> {
  return fetchApi<CoffeeRequestResponse>("/coffee-requests/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
