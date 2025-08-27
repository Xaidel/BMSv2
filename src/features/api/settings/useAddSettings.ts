
import postSettings from "@/service/api/settings/postSettings";
import { Settings } from "@/types/apitypes";
import { useMutation } from "@tanstack/react-query";

export function useAddSettings() {
  const mutation = useMutation({
    mutationFn: (settings: Settings) => postSettings(settings)
  })

  return {
    ...mutation,
    isPending: mutation.isPending
  }
}
