import { redirect } from "next/navigation";
import { getBoolSetting } from "@/lib/settings";
import { auth } from "@/lib/auth";

/**
 * Server component that redirects non-admin users to /maintenance
 * when maintenance_mode is enabled. Include this at the top of
 * protected layouts.
 */
export async function MaintenanceGate() {
  const maintenanceMode = await getBoolSetting("maintenance_mode");
  if (!maintenanceMode) return null;

  const session = await auth();
  if (session?.user?.role === "admin") return null;

  redirect("/maintenance");
}
