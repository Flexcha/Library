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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 aged-paper-card p-3 rounded-lg border border-[#ded5c2] shadow-2xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {searchFilter && (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-[#fcfbf7] border border-[#d5ccba] rounded pl-9 pr-3 py-1.5 text-xs text-stone-900 font-serif-data placeholder-stone-400 focus:outline-none focus:border-[#92400e] transition"
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
            className="p-1.5 bg-[#fcfbf7] hover:bg-[#f1ebe0] text-stone-700 hover:text-stone-900 border border-[#d5ccba] rounded text-xs flex items-center gap-1 transition cursor-pointer font-serif-data"
            title={`Chuyển chế độ hiển thị (${density === 'compact' ? 'Gọn gàng' : 'Thoáng đãng'})`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{density === 'compact' ? 'Gọn' : 'Thoáng'}</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Table Container with Aged Paper Texture */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg overflow-hidden shadow-xs">
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
              <thead className="ledger-header bg-[#f2ece0] text-stone-900 uppercase tracking-wider font-serif-display font-bold select-none">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-4 py-3 text-[11px] ${
                        col.sortable ? 'cursor-pointer hover:text-[#92400e] transition' : ''
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
                          <span className="text-stone-400">
                            {sortKey === col.key ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-[#92400e]" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-[#92400e]" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 hover:text-stone-700" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7dfcf] text-stone-900 font-serif-data">
                {paginatedData.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    className="ledger-row transition duration-150"
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

        {/* Table Pagination Footer with Ledger Double Border Treatment */}
        {!loading && totalItems > 0 && (
          <div className="ledger-summary-double px-4 py-3 bg-[#f6f0e2] border-t-2 border-[#b5a790] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700 font-serif-data">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-stone-900 font-bold font-serif">{startEntry}</strong> đến{' '}
                <strong className="text-stone-900 font-bold font-serif">{endEntry}</strong> trong tổng số{' '}
                <strong className="text-stone-900 font-bold font-serif">{totalItems}</strong> bản ghi
              </span>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Số dòng:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#fcfbf7] border border-[#d5ccba] rounded px-1.5 py-0.5 text-stone-900 focus:outline-none focus:border-[#92400e] font-serif"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
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
                className="p-1 rounded border border-[#d5ccba] bg-[#fcfbf7] text-stone-700 hover:bg-[#f1ebe0] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-0.5 text-xs font-semibold text-stone-800 font-serif">
                Trang {validPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="p-1 rounded border border-[#d5ccba] bg-[#fcfbf7] text-stone-700 hover:bg-[#f1ebe0] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
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
