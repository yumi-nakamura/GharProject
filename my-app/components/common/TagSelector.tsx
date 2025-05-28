// 9. common/TagSelector.tsx
export function TagSelector({ options, selected, onSelect }: { options: string[]; selected: string[]; onSelect: (tag: string[]) => void }) {
  const toggle = (tag: string) => {
    const newTags = selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]
    onSelect(newTags)
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(tag => (
        <button key={tag} onClick={() => toggle(tag)} className={`px-2 py-1 text-sm border rounded ${selected.includes(tag) ? 'bg-orange-400 text-white' : 'bg-white text-gray-700'}`}>
          {tag}
        </button>
      ))}
    </div>
  )
}
