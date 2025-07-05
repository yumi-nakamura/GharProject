// 6. common/TextArea.tsx
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('TextArea onChange:', { value: e.target.value, length: e.target.value.length })
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <textarea 
      {...props} 
      onChange={handleChange} 
      className="w-full border p-3 rounded text-base resize-none min-h-[44px] focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
      style={{ fontSize: '16px' }} // iOS Safariでのズーム防止
    />
  )
}