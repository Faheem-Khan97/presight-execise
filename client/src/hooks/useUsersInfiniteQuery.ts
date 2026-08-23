import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/usersApi";
import type { SortDirection, SortField } from "../types/user";

const PAGE_SIZE = 30;

interface UseUsersInfiniteQueryParams {
  search: string;
  nationalities: string[];
  hobbies: string[];
  sortField: SortField;
  sortDirection: SortDirection;
}

export function useUsersInfiniteQuery(params: UseUsersInfiniteQueryParams) {
  return useInfiniteQuery({
    queryKey: ["users", params],
    queryFn: ({ pageParam }) =>
      fetchUsers({
        search: params.search,
        nationalities: params.nationalities,
        hobbies: params.hobbies,
        sortField: params.sortField,
        sortDirection: params.sortDirection,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });
}
