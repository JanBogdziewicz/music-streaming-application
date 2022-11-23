import jwtDecode from "jwt-decode";

export function getUsernameFromToken(): string {
  const decoded = jwtDecode(localStorage.getItem('access_token') as string) as any;
  return decoded.sub;
}