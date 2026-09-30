import React, { useState, useMemo, ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  FolderOpen,
} from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton.tsx';
import { EmptyState } from './EmptyState.tsx';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  actions?: ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Không tìm thấy bản ghi mục lục nào',
  emptyDescription = 'Không có dòng dữ liệu nào khớp với tiêu chí tìm kiếm.',
  searchPlaceholder = 'Tìm kiếm dữ liệu thư viện...',
  searchFilter,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  actions,
  keyExtractor = (item, index) => item.id ?? index,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, searchQuery.trim()));
  }, [data, searchQuery, searchFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validPage, pageSize]);

  const handleSort = (key: string, isSortable?: boolean) => {
    if (!isSortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const startEntry = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endEntry = Math.min(validPage * pageSize, totalItems);

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ui-card p-3 border border-white/10">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {searchFilter && (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          {actions}

          {/* Density toggle */}
          <button
            type="button"
            onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
            className="p-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
            title={`Chuyển chế độ hiển thị (${density === 'compact' ? 'Gọn gàng' : 'Thoáng đãng'})`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{density === 'compact' ? 'Gọn' : 'Thoáng'}</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table Container */}
      <div className="ui-card border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={columns.length} />
        ) : paginatedData.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-indigo-300 uppercase tracking-wider font-semibold select-none border-b border-white/10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-4 py-3 text-[11px] ${
                        col.sortable ? 'cursor-pointer hover:text-white transition' : ''
                      } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                        col.className || ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                        }`}
                      >
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="text-slate-500">
                            {sortKey === col.key ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 hover:text-slate-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {paginatedData.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    className="hover:bg-indigo-500/10 transition duration-150"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${density === 'compact' ? 'px-4 py-2' : 'px-4 py-3.5'} ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render ? col.render(item) : (item[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {!loading && totalItems > 0 && (
          <div className="px-4 py-3 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-white">{startEntry}</strong> đến{' '}
                <strong className="text-white">{endEntry}</strong> trong tổng số{' '}
                <strong className="text-white">{totalItems}</strong> bản ghi
              </span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                <span>Số dòng:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border border-slate-700/80 rounded px-2 py-0.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage <= 1}
                className="p-1 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-0.5 text-xs font-semibold text-white">
                Trang {validPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="p-1 rounded border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

