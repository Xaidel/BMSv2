import getMapping from "@/service/api/map/getMapping";
import { useQuery } from "@tanstack/react-query";

export default function useMapping() {
  const query = useQuery({
    queryKey: ["mappings"],
    queryFn: () => getMapping()
  })
  return {
    ...query,
    isFetching: query.isFetching
  }
}
