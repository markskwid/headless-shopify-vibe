import type { ReactNode } from "react";

export function AccountShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="relative flex flex-1 items-center overflow-hidden px-5 py-12 sm:px-8 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.93_0.06_151_/_0.65),transparent_38%),radial-gradient(circle_at_bottom_right,oklch(0.95_0.05_77_/_0.55),transparent_34%)]" />
      <div className="mx-auto w-full max-w-lg rounded-2xl border bg-background/95 p-6 shadow-xl shadow-foreground/5 backdrop-blur sm:p-9">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Customer account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
