// 5. common/TextInput.tsx

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      className="w-full border p-3 rounded text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]" 
      style={{ fontSize: '16px' }} // iOS Safariでのズーム防止
    />
  )
}