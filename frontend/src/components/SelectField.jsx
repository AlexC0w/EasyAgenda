const SelectField = ({ label, options, value, onChange, placeholder, disabled }) => (
  <label className="flex flex-col gap-2 text-sm">
    <span className="text-slate-300">{label}</span>
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export default SelectField;
