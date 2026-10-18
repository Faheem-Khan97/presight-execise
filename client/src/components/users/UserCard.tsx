import type { User } from "../../types/user";
import { UserAvatar } from "./UserAvatar";

interface UserCardProps {
  user: User;
  /** Hobbies currently filtered on, surfaced first so the match is visible without expanding. */
  selectedHobbies?: string[];
}

/** Chips shown when nothing is selected; selected hobbies can push this higher. */
const BASE_VISIBLE_HOBBIES = 2;

/**
 * Orders a user's hobbies so every selected one is visible.
 *
 * Hobby filtering is AND-based, so a matched user has all of them — hiding one behind "+n"
 * hides the reason the row is on screen. Selected hobbies come first and always fit; any
 * remaining slots are filled with the rest, in the user's own order.
 */
function partitionHobbies(hobbies: string[], selectedHobbies: string[]) {
  const selectedSet = new Set(selectedHobbies);
  const selected = hobbies.filter((hobby) => selectedSet.has(hobby));
  const rest = hobbies.filter((hobby) => !selectedSet.has(hobby));

  const visibleCount = Math.max(BASE_VISIBLE_HOBBIES, selected.length);
  const visible = [...selected, ...rest].slice(0, visibleCount);

  return { visible, selectedSet, remaining: hobbies.length - visible.length };
}

export function UserCard({ user, selectedHobbies = [] }: UserCardProps) {
  const { visible, selectedSet, remaining } = partitionHobbies(user.hobbies, selectedHobbies);

  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <UserAvatar src={user.avatar} firstName={user.first_name} lastName={user.last_name} size={48} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="truncate font-medium text-slate-900">
          {user.first_name} {user.last_name}
        </p>
        <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
          <span className="truncate">{user.nationality}</span>
          <span>{user.age}</span>
        </div>
        {(visible.length > 0 || remaining > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visible.map((hobby) => (
              <span
                key={hobby}
                className={
                  selectedSet.has(hobby)
                    ? "rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                    : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                }
              >
                {hobby}
              </span>
            ))}
            {remaining > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                +{remaining}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
