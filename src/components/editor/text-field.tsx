type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  rows?: number
}

/**
 * Labeled text input or textarea for the CMS editor.
 * @param label - Field label
 * @param value - Current value
 * @param onChange - Change handler
 * @param multiline - Use textarea when true
 * @param rows - Textarea rows
 */
export const TextField = ({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
}: TextFieldProps) => {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-[#1a1a1a]">
      {label}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-[10px] border-2 border-[#e6e6e6] px-3 py-2 text-sm font-normal outline-none focus:border-[#0c29ab]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-sm font-normal outline-none focus:border-[#0c29ab]"
        />
      )}
    </label>
  )
}
