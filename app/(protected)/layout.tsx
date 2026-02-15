import { BottomNav } from "@/components/layout/bottom-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BottomNav>{children}</BottomNav>;
}
