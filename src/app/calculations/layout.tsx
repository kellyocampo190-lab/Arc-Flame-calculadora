import type { ReactNode } from "react";

export const instant = false;

type CalculationsLayoutProps = {
  children: ReactNode;
};

export default function CalculationsLayout({
  children,
}: CalculationsLayoutProps) {
  return children;
}