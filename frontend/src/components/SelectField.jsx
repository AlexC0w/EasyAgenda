const SelectField = ({ label, options, value, onChange, placeholder, disabled, className = '' }) => (
  <label className="flex flex-col gap-2 text-sm">
    <span className="text-slate-700 dark:text-slate-300">{label}</span>
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
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
