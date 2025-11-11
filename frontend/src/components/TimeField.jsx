import { useEffect, useState } from 'react';
import { formatTimeDisplay, parseMeridiemTime } from '../utils/time.js';

const TimeField = ({
  value,
  onChange,
  placeholder = '9:00 AM',
  className = '',
  inputMode = 'text',
  autoComplete = 'off',
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value ? formatTimeDisplay(value) : '');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setInputValue(value ? formatTimeDisplay(value) : '');
  }, [value]);

  const commitValue = () => {
    if (!inputValue.trim()) {
      setInvalid(false);
      onChange('');
      return;
    }
    const parsed = parseMeridiemTime(inputValue);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onChange(parsed);
    setInputValue(formatTimeDisplay(parsed));
  };

  return (
    <input
      {...props}
      value={inputValue}
      inputMode={inputMode}
      autoComplete={autoComplete}
      spellCheck={false}
      onChange={(event) => {
        setInputValue(event.target.value);
        if (invalid) {
          setInvalid(false);
        }
      }}
      onBlur={commitValue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitValue();
        }
      }}
      placeholder={placeholder}
      className={`${className} ${invalid ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-400/40' : ''}`.trim()}
    />
  );
};

export default TimeField;
