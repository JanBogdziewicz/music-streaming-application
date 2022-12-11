import jwtDecode from "jwt-decode";

export function getUsernameFromToken(): string {
  let decoded;
  try {
    decoded = jwtDecode(localStorage.getItem('access_token') as string) as any;
    return decoded.sub;
  } catch (error) {
    return "";
  }
}