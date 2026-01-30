import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export const metadata = { title: "Maintenance" };

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <Construction className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We&apos;re performing scheduled maintenance. Please check back
            shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
