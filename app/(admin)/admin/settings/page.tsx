import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "@/components/admin/settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Settings" };

const CATEGORIES = [
  { key: "general", label: "General", description: "Site name, description, and maintenance mode" },
  { key: "auth", label: "Auth", description: "Registration, password, and session settings" },
  { key: "email", label: "Email", description: "SMTP email delivery configuration" },
  { key: "prices", label: "Prices", description: "Price expiry, verification, and deviation settings" },
  { key: "reputation", label: "Reputation", description: "Points and level thresholds" },
  { key: "api", label: "API", description: "Rate limits, CORS, API keys, and CAPTCHA" },
  { key: "maps", label: "Maps", description: "Google Maps API configuration" },
  { key: "storage", label: "Storage", description: "File storage and blob store configuration" },
];

export default async function AdminSettingsPage() {
  const allSettings = await prisma.systemSetting.findMany({
    orderBy: [{ category: "asc" }, { key: "asc" }],
  });

  const settingsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    settings: allSettings.filter((s) => s.category === cat.key),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration. Changes take effect immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure application behavior across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
              {settingsByCategory.map((cat) => (
                <TabsTrigger key={cat.key} value={cat.key}>
                  {cat.label}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({cat.settings.length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {settingsByCategory.map((cat) => (
              <TabsContent key={cat.key} value={cat.key}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                {cat.settings.length > 0 ? (
                  <SettingsForm settings={cat.settings} />
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No settings in this category.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
