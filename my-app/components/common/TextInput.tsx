// 5. common/TextInput.tsx
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full border p-2 rounded text-sm" />
}