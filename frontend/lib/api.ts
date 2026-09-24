/** Cliente HTTP tipado del backend (solo lo que consume el frontend del MVP). */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface ApiErrorBody {
  error: { code: string; message: string; field?: string };
}

export class ApiError extends Error {
  constructor(readonly status: number, readonly body: ApiErrorBody) {
    super(body.error.message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let body: ApiErrorBody;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = { error: { code: "HTTP_ERROR", message: res.statusText } };
    }
    throw new ApiError(res.status, body);
  }
  return (await res.json()) as T;
}

export const api = {
  textureMemory: (payload: {
    width: number;
    height: number;
    format: string;
    mipmaps: boolean;
    count: number;
  }) => request<any>("/api/v1/texture/memory", { method: "POST", body: JSON.stringify(payload) }),

  textureCompare: (payload: { width: number; height: number; mipmaps: boolean; count: number }) =>
    request<any>("/api/v1/texture/compare", { method: "POST", body: JSON.stringify(payload) }),

  texelDensity: (payload: {
    textureResolution?: number;
    objectSize: number;
    unit: string;
    targetDensity?: number;
  }) =>
    request<any>("/api/v1/uv/texel-density", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  shaderMath: (payload: Record<string, any>) =>
    request<{ result: number }>("/api/v1/shader/math", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listProjects: () => request<any[]>("/api/v1/projects"),
  getProject: (id: string) => request<any>(`/api/v1/projects/${id}`),
  createProject: (payload: any) =>
    request<any>("/api/v1/projects", { method: "POST", body: JSON.stringify(payload) }),
  updateProject: (id: string, payload: any) =>
    request<any>(`/api/v1/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteProject: (id: string) =>
    fetch(`${BASE_URL}/api/v1/projects/${id}`, { method: "DELETE" }),
};
