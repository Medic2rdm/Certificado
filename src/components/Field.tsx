import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 placeholder:font-normal placeholder:text-zinc-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cn(inputCls, className)} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={cn(inputCls, "appearance-none", className)}>
      {children}
    </select>
  );
}

export function Card({
  badge,
  title,
  subtitle,
  children,
  accent,
  action,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {badge}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold leading-tight text-zinc-900">{title}</h2>
          {subtitle && <p className="text-[11px] leading-tight text-zinc-500">{subtitle}</p>}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
        {children}
      </div>
    </section>
  );
}
