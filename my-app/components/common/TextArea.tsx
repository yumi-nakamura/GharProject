// 6. common/TextArea.tsx
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full border p-2 rounded text-sm resize-none" />
}