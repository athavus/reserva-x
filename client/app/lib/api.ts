/**
 * API Configuration and utility functions for making authenticated requests
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Save the JWT token to localStorage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

/**
 * Remove the JWT token from localStorage
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

/**
 * Get default headers for API requests
 */
export function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || `Erro ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API type definitions
 */

export interface User {
  id: number;
  email: string;
  role: "aluno" | "professor" | "admin";
  project_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Laboratory {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Computer {
  id: number;
  name: string;
  laboratory_id: number;
  specifications: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  laboratory_id: number;
  computer_id: number | null;
  reservation_type: "room" | "computer";
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  is_confidential: boolean;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequest {
  id: number;
  email: string;
  project_name: string;
  is_processed: boolean;
  submitted_at: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  laboratory_id: number;
  reason: string | null;
  is_processed: boolean;
  is_approved: boolean;
  submitted_at: string;
  processed_at: string | null;
  processed_by: number | null;
}



/**
 * API functions
 */

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Credenciais inválidas" }));
    throw new Error(error.detail || "Credenciais inválidas");
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

export async function requestRegistration(
  email: string,
  password: string,
  project_name: string
): Promise<RegistrationRequest> {
  const response = await fetch(`${API_BASE_URL}/auth/request-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, project_name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro ao solicitar cadastro" }));
    throw new Error(error.detail || "Erro ao solicitar cadastro");
  }

  return response.json();
}

export async function getLaboratories(): Promise<Laboratory[]> {
  return apiRequest<Laboratory[]>("/laboratories");
}

export async function getComputers(laboratoryId?: number): Promise<Computer[]> {
  const endpoint = laboratoryId
    ? `/computers?laboratory_id=${laboratoryId}`
    : "/computers";
  return apiRequest<Computer[]>(endpoint);
}

export async function getMyReservations(): Promise<Reservation[]> {
  return apiRequest<Reservation[]>("/reservations?my_reservations=true");
}

export async function getAllReservations(): Promise<Reservation[]> {
  return apiRequest<Reservation[]>("/reservations");
}

export async function getReservation(id: number): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`);
}

export async function createReservation(data: {
  laboratory_id: number;
  computer_id?: number;
  reservation_type: "room" | "computer";
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  is_confidential?: boolean;
}): Promise<Reservation> {
  return apiRequest<Reservation>("/reservations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReservation(
  id: number,
  data: Partial<{
    start_time: string;
    end_time: string;
    title: string;
    description: string;
    is_confidential: boolean;
  }>
): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteReservation(id: number): Promise<void> {
  await apiRequest<void>(`/reservations/${id}`, { method: "DELETE" });
}

export async function approveReservation(id: number): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}/approve`, {
    method: "POST",
  });
}

export async function rejectReservation(
  id: number,
  rejection_reason?: string
): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function getRegistrationRequests(): Promise<RegistrationRequest[]> {
  return apiRequest<RegistrationRequest[]>("/auth/registration-requests");
}

export async function approveRegistrationRequest(
  id: number,
  role: "aluno" | "professor"
): Promise<User> {
  return apiRequest<User>(`/auth/registration-requests/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function rejectRegistrationRequest(id: number): Promise<void> {
  await apiRequest<void>(`/auth/registration-requests/${id}/reject`, {
    method: "DELETE",
  });
}

// Access Request functions
export async function requestAccess(laboratory_id: number, reason?: string): Promise<AccessRequest> {
  return apiRequest<AccessRequest>("/access/requests", {
    method: "POST",
    body: JSON.stringify({ laboratory_id, reason }),
  });
}

export async function getAccessRequests(pendingOnly: boolean = true): Promise<AccessRequest[]> {
  return apiRequest<AccessRequest[]>(`/access/requests?pending_only=${pendingOnly}`);
}

export async function processAccessRequest(id: number, approved: boolean): Promise<AccessRequest> {
  return apiRequest<AccessRequest>(`/access/requests/${id}/process`, {
    method: "POST",
    body: JSON.stringify({ approved }),
  });
}

