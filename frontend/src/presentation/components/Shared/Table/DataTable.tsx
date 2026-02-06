import React from 'react';
import { RefreshCw, Inbox } from 'lucide-react';

export interface TableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string; // Use for widths (e.g., 'w-[200px]') or alignment ('text-right')
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  //  FIX: Allow string OR ReactNode (JSX) to fix the error
  emptyMessage?: string | React.ReactNode; 
  onRowClick?: (item: T) => void;
  renderMobileCard?: (item: T) => React.ReactNode;
}

export const DataTable = <T,>({
  data,
  columns,
  keyField,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
  renderMobileCard
}: DataTableProps<T>) => {
  
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[400px]">
        <RefreshCw size={32} className="animate-spin opacity-20" />
        <p className="text-sm font-medium">Loading Data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-[400px]">
        {/*  FIX: Render custom JSX if provided, else default string */}
        {typeof emptyMessage === 'string' ? (
           <>
             <Inbox size={48} className="opacity-20 mb-2" />
             <p>{emptyMessage}</p>
           </>
        ) : (
           emptyMessage
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      
      {/* === MOBILE VIEW (Cards) === */}
      {renderMobileCard && (
        <div className="md:hidden p-4 space-y-4 overflow-y-auto bg-gray-50/50">
          {data.map((item) => (
            <div key={String(item[keyField])}>
              {renderMobileCard(item)}
            </div>
          ))}
        </div>
      )}

      {/* === DESKTOP VIEW (Table) === */}
      <div className={`${renderMobileCard ? 'hidden md:block' : 'block'} overflow-x-auto flex-1`}>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr 
                key={String(item[keyField])} 
                onClick={() => onRowClick && onRowClick(item)}
                className={`group hover:bg-gray-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, index) => (
                  <td key={index} className="py-4 px-6 align-middle">
                    {col.render 
                      ? col.render(item) 
                      : (item[col.accessorKey!] as React.ReactNode)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};