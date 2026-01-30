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
import { updateSettings } from "@/actions/admin-actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

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

  return (
    <div className="space-y-6">
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

      <div className="flex justify-end">
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
