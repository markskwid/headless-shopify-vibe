import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-6 h-14 w-full max-w-2xl" />
      <Skeleton className="mt-3 h-6 w-full max-w-xl" />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="gap-0 py-0">
            <Skeleton className="aspect-[4/5] w-full rounded-b-none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
