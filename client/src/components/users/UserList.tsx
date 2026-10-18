import { useEffect, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { User } from "../../types/user";
import { UserCard } from "./UserCard";

interface UserListProps {
  users: User[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  scrollElementRef: RefObject<HTMLElement | null>;
  /** Passed through so each card can surface the hobbies being filtered on. */
  selectedHobbies: string[];
}

const ESTIMATED_ROW_HEIGHT = 112;
const ROW_GAP = 12;

export function UserList({
  users,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  scrollElementRef,
  selectedHobbies,
}: UserListProps) {
  const rowCount = hasNextPage ? users.length + 1 : users.length;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT + ROW_GAP,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= users.length - 1 && hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [virtualItems, users.length, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
      {virtualItems.map((virtualRow) => {
        const isLoaderRow = virtualRow.index > users.length - 1;
        const user = users[virtualRow.index];

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${virtualRow.start}px)`, paddingBottom: ROW_GAP }}
          >
            {isLoaderRow ? (
              <div className="flex items-center justify-center py-4 text-sm text-slate-400">
                Loading more...
              </div>
            ) : (
              <UserCard user={user} selectedHobbies={selectedHobbies} />
            )}
          </div>
        );
      })}
    </div>
  );
}
