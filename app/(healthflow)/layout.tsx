import type { ReactNode } from "react";
import HealthFlowApp from "@/components/HealthFlowApp";

export default function HealthFlowLayout({ children }: { children: ReactNode }) {
  return <>{children}<HealthFlowApp /></>;
}
