import { BottomNav } from "@/components/BottomNav";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-28 pt-6 sm:max-w-3xl sm:px-6 lg:max-w-5xl">
      {children}
      <BottomNav />
    </div>
  );
}
