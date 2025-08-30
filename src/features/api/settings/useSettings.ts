import getSettings, { SettingsResponse } from "@/service/api/settings/getSettings";
import { useQuery } from "@tanstack/react-query";

export function useSettings(ID?: number) {
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: (): Promise<SettingsResponse> => getSettings(ID),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
