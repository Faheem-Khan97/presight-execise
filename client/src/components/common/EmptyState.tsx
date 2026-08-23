export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-center">
      <p className="text-base font-medium text-slate-700">No users found</p>
      <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
    </div>
  );
}
