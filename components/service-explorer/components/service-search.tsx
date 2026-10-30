import { Search, X } from "lucide-react";

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ServiceSearch({ value, onChange }: ServiceSearchProps) {
  return (
    <label className="relative mt-6 flex min-h-12 items-center rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#20837e] focus-within:ring-4 focus-within:ring-[#20837e]/10">
      <Search className="ml-4 size-4 text-slate-400" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
        placeholder="Search services, providers, or categories..."
        aria-label="Search services"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mr-3 rounded p-1 text-slate-400 hover:text-slate-700"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}
