import getOfficial from "@/service/api/official/getOfficial";
import { useQuery } from "@tanstack/react-query";

export default function useOfficial() {
  const query = useQuery({
    queryKey: ["officials"],
    queryFn: () => getOfficial()
  })
  return {
    ...query,
    isFetching: query.isFetching
  }
}
