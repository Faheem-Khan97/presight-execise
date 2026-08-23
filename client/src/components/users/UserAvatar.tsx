import { useEffect, useState } from "react";

interface UserAvatarProps {
  src: string;
  firstName: string;
  lastName: string;
  size?: number;
}

const INITIALS_COLORS = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-teal-500",
];

function colorForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

export function UserAvatar({ src, firstName, lastName, size = 48 }: UserAvatarProps) {
  const [errored, setErrored] = useState(false);
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (errored) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${colorForSeed(firstName + lastName)}`}
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${firstName} ${lastName}`}
      onError={() => setErrored(true)}
      className="shrink-0 rounded-full bg-slate-100 object-cover"
      style={{ width: size, height: size }}
    />
  );
}
