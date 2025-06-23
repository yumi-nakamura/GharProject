// 5. common/TextInput.tsx
import { InputHTMLAttributes } from "react"

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const TextInput = ({ label, ...props }: TextInputProps) => {
  return (
    <div>
      {label && <label className="block mb-1 font-semibold text-gray-700">{label}</label>}
      <input
        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
        {...props}
      />
    </div>
  )
}