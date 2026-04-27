function CardSkeleton() {
  return <div className="h-24 rounded-3xl surface border border-border animate-pulse" />;
}

export default function AppLoading() {
  return (
    <div className="page-shell">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded-full surface border border-border animate-pulse" />
        <div className="h-10 w-48 rounded-lg surface border border-border animate-pulse" />
        <div className="h-5 w-72 max-w-full rounded-lg surface border border-border animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-3">
        <div className="h-24 rounded-3xl surface border border-border animate-pulse" />
        <div className="h-24 rounded-3xl surface border border-border animate-pulse" />
        <div className="h-24 rounded-3xl surface border border-border animate-pulse" />
      </div>
    </div>
  );
}
