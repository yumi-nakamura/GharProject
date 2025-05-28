// 4. common/Button.tsx
export function Button({ children, onClick, disabled, type }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" | "reset" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
    >
      {children}
    </button>
  )
}