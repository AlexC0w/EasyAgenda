const WeeklySchedule = ({ week, onSelectSlot, selectedDate, selectedTime }) => (
  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
    <div className="grid min-w-[640px] grid-cols-7 divide-x divide-slate-800">
      {week.map(({ date, label, availability }) => (
        <div key={date} className="flex flex-col">
          <div
            className={`border-b border-slate-800 p-3 text-center text-xs font-semibold uppercase tracking-wide ${
              selectedDate === date ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-300'
            }`}
          >
            {label}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {availability.length === 0 && (
              <span className="text-center text-xs text-slate-500">Sin turnos</span>
            )}
            {availability.map((slot) => {
              const isSelected = selectedDate === date && selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(date, slot)}
                  className={`rounded-md border px-2 py-1 text-sm transition ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-400 hover:text-emerald-200'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default WeeklySchedule;
