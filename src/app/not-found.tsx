import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="w-full max-w-md rounded-3xl surface border border-border p-8 text-center shadow-lg">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link href="/play" className="inline-flex h-10 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background ring-focus">
          Return to Play
        </Link>
      </div>
    </div>
  );
}
