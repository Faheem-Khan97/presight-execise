import type { User } from "../../types/user";
import { UserAvatar } from "./UserAvatar";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const visibleHobbies = user.hobbies.slice(0, 2);
  const remaining = user.hobbies.length - visibleHobbies.length;

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
        {(visibleHobbies.length > 0 || remaining > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visibleHobbies.map((hobby) => (
              <span key={hobby} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
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
