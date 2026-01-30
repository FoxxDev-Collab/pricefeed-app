"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettings, adminSendTestEmail } from "@/actions/admin-actions";
import { toast } from "sonner";
import { Loader2, Save, Send, CheckCircle2, XCircle } from "lucide-react";

interface Setting {
  key: string;
  value: string | null;
  valueType: string;
  category: string;
  description: string | null;
  isSensitive: boolean;
}

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    settings.forEach((s) => {
      initial[s.key] = s.value || "";
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const category = settings[0]?.category;

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const updates = settings
        .filter((s) => values[s.key] !== (s.value || ""))
        .map((s) => ({ key: s.key, value: values[s.key] }));

      if (updates.length === 0) {
        toast.info("No changes to save");
        setLoading(false);
        return;
      }

      await updateSettings(updates);
      toast.success(`Saved ${updates.length} setting(s)`);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleTestEmail() {
    setTestLoading(true);
    try {
      const result = await adminSendTestEmail("");
      if (result.success) {
        toast.success("Test email sent successfully");
      } else {
        toast.error(result.error || "Failed to send test email");
      }
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setTestLoading(false);
    }
  }

  function renderInput(setting: Setting) {
    const value = values[setting.key] ?? "";

    if (setting.valueType === "bool") {
      return (
        <Select
          value={value}
          onValueChange={(v) => handleChange(setting.key, v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Enabled</SelectItem>
            <SelectItem value="false">Disabled</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (setting.valueType === "int") {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          className="w-32"
        />
      );
    }

    if (setting.isSensitive || setting.valueType === "encrypted") {
      return (
        <Input
          type="password"
          value={value}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          className="max-w-sm"
          placeholder="••••••••"
        />
      );
    }

    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        className="max-w-sm"
      />
    );
  }

  function renderStatusBadge() {
    if (category === "email") {
      const enabled = values["smtp_enabled"] === "true";
      const configured = !!values["smtp_host"] && !!values["smtp_user"];
      if (!enabled) {
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" /> Disabled
          </Badge>
        );
      }
      if (!configured) {
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Not Configured
          </Badge>
        );
      }
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" /> Configured
        </Badge>
      );
    }

    if (category === "maps") {
      const hasKey = !!values["google_api_key_maps"];
      return hasKey ? (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" /> Key Set
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" /> No Key
        </Badge>
      );
    }

    if (category === "storage") {
      const hasToken = !!values["blob_store_token"];
      return hasToken ? (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" /> Token Set
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" /> No Token
        </Badge>
      );
    }

    return null;
  }

  return (
    <div className="space-y-6">
      {renderStatusBadge() && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Status:
          </span>
          {renderStatusBadge()}
        </div>
      )}

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label className="font-medium">{setting.key}</Label>
                {setting.isSensitive && (
                  <Badge variant="outline" className="text-xs">
                    sensitive
                  </Badge>
                )}
              </div>
              {setting.description && (
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              )}
            </div>
            {renderInput(setting)}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {category === "email" && (
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testLoading || values["smtp_enabled"] !== "true"}
            >
              {testLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Test Email
            </Button>
          )}
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
