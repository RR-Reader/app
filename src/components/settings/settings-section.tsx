import type { SettingSection } from "@/types/settings";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { SettingRenderer } from "./settings-renderer";
import { SettingItem } from "./settings-item";

interface SettingsSectionProps {
  key: string;
  section: SettingSection;
}

export function SettingsSection({ section }: SettingsSectionProps) {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(section.settings.map((s) => [s.key, s.defaultValue])),
  );

  function handleChange(key: string, value: any) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const Icon = section.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-2xl">
          <Icon size={20} /> {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {section.settings.map((setting) => (
          <SettingItem
            key={setting.key}
            title={setting.title}
            description={setting.description}
          >
            <SettingRenderer
              setting={setting}
              value={values[setting.key]}
              onChange={(val) => handleChange(setting.key, val)}
            />
          </SettingItem>
        ))}
      </CardContent>
    </Card>
  );
}
