import { Button } from "@/components/ui/button";

interface ServicePaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function ServicePagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
}: ServicePaginationProps) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span>
        {" – "}
        <span className="font-medium text-slate-700">{end}</span>
        {" of "}
        <span className="font-medium text-slate-700">
          {total.toLocaleString()}
        </span>
        {" services"}
      </p>

      <div className="flex items-center gap-2">
        <Button
          className="bg-[#dff3f1] text-[#13776f] hover:text-[#dff3f1] hover:bg-[#13776f] cursor-pointer"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="px-2 text-sm text-slate-600">
          Page {page} of {pageCount}
        </span>

        <Button
          className="bg-[#dff3f1] text-[#13776f] hover:text-[#dff3f1] hover:bg-[#13776f] cursor-pointer"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
