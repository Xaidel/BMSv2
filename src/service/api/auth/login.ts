import { api } from "@/service/api";
import { User } from "@/types/apitypes";

export interface ErrorLoginResponse {
  error: string
}
export interface LoginResponse {
  message: string
  user: User
}

export default async function Login(role: string, username: string, password: string): Promise<LoginResponse | ErrorLoginResponse> {
  try {

    const res = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: role,
        username: username,
        password: password,
      })
    })
    if (!res.ok) {
      const error = await res.json() as ErrorLoginResponse
      throw error
    }
    return res.json() as Promise<LoginResponse>
  } catch (err) {
    throw err
  }
}
