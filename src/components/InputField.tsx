interface InputFieldProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
}

export default function InputField({ value, onChange, placeholder }: InputFieldProps) {
  return <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="w-full p-3 mb-4 border rounded text-gray-800" />
}
