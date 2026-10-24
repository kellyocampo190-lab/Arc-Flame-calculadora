import type { ReactNode } from "react";

export const instant = false;

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return children;
}