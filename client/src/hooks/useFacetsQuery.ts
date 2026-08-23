import { useQuery } from "@tanstack/react-query";
import { fetchFacets } from "../api/usersApi";

interface UseFacetsQueryParams {
  search: string;
  nationalities: string[];
  hobbies: string[];
}

export function useFacetsQuery(params: UseFacetsQueryParams) {
  return useQuery({
    queryKey: ["facets", params],
    queryFn: () =>
      fetchFacets({
        search: params.search,
        nationalities: params.nationalities,
        hobbies: params.hobbies,
      }),
  });
}
