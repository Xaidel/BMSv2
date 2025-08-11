import { useMutation } from "@tanstack/react-query";
import Login from "@/service/api/auth/login";

export function useLogin() {
  const mutation = useMutation({
    mutationFn: ({ role, username, password }: { role: string, username: string, password: string }) => Login(role, username, password)
  })
  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
