// 7. common/ToggleSwitch.tsx
export function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${enabled ? 'bg-green-400' : ''}`}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${enabled ? 'translate-x-4' : ''}`} />
    </div>
  )
}