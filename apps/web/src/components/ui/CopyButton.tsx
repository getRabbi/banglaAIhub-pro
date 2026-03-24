'use client'
interface Props { code: string; label?: string; fullWidth?: boolean }
export default function CopyButton({ code, label = 'কপি', fullWidth = false }: Props) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(code)}
      className={`text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap btn-secondary py-2 ${fullWidth ? 'flex-1 justify-center' : ''}`}
    >
      {label}
    </button>
  )
}
