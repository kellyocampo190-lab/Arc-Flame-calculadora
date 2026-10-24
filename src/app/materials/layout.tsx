import type { ReactNode } from "react";

export const instant = false;

type MaterialsLayoutProps = {
  children: ReactNode;
};

export default function MaterialsLayout({
  children,
}: MaterialsLayoutProps) {
  return children;
}