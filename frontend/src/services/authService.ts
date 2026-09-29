import api from "./api";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
}

export interface CurrentUser {
  name: string | null;
  email: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const body = new URLSearchParams();

  body.append("username", email);
  body.append("password", password);

  const response = await api.post<LoginResponse>("/login", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  localStorage.setItem("access_token", response.data.access_token);

  return response.data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/register", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await api.get<CurrentUser>("/me");

  return response.data;
}

export function logout(): void {
  localStorage.removeItem("access_token");
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem("access_token"));
}