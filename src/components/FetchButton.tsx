interface FetchButtonProps {
  onClick: () => void
  disabled: boolean
  text: string
}

export default function FetchButton({ onClick, disabled, text }: FetchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded mb-4 ${disabled ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 transition'}`}
      disabled={disabled}
      type="button"
    >
      {text}
    </button>
  )
}
