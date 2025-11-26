const variants = {
  success: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  error: 'border-rose-500/60 bg-rose-500/10 text-rose-700 dark:text-rose-200',
  info: 'border-slate-500/60 bg-slate-500/10 text-slate-700 dark:text-slate-200',
};

const Alert = ({ type = 'info', children }) => (
  <div className={`rounded-md border px-4 py-3 text-sm ${variants[type]}`}>{children}</div>
);

export default Alert;
