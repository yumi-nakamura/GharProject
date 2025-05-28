// settings/ReminderSettings.tsx
import { ToggleSwitch } from "@/components/common/ToggleSwitch"
import type { ReminderSettingsData } from "@/types/settings"

export function ReminderSettings({ reminders, onChange }: { reminders: ReminderSettingsData; onChange: (key: keyof ReminderSettingsData, value: boolean) => void }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <span>食事リマインダー</span>
        <ToggleSwitch enabled={reminders.meal} onToggle={() => onChange("meal", !reminders.meal)} />
      </div>
      <div className="flex justify-between items-center">
        <span>排泄リマインダー</span>
        <ToggleSwitch enabled={reminders.poop} onToggle={() => onChange("poop", !reminders.poop)} />
      </div>
      <div className="flex justify-between items-center">
        <span>感情記録リマインダー</span>
        <ToggleSwitch enabled={reminders.mood} onToggle={() => onChange("mood", !reminders.mood)} />
      </div>
    </div>
  )
}
