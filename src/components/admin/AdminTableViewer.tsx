import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';

const TABLES = [
  { id: 'users', label: '1. Users (Auth & Roles)' },
  { id: 'farmer_profiles', label: '2. Farmer Profiles' },
  { id: 'provider_profiles', label: '3. Storage Provider Profiles' },
  { id: 'farms', label: '4. Farms & Survey Numbers' },
  { id: 'fields', label: '5. Sub-Field Plots' },
  { id: 'crop_history', label: '6. Crop Historical Cycles' },
  { id: 'crop_rotations', label: '7. Crop Rotation Sequences' },
  { id: 'soil_tests', label: '8. Soil Health Cards (12-Params)' },
  { id: 'soil_labs', label: '9. Soil Testing Laboratories' },
  { id: 'soil_test_requests', label: '10. Soil Sample Requests' },
  { id: 'plant_scans', label: '11. Plant Disease Scans & AI' },
  { id: 'warehouses', label: '12. Warehouses & Cold Storages' },
  { id: 'warehouse_bookings', label: '13. Warehouse Space Bookings' },
  { id: 'government_schemes', label: '14. Government Schemes' },
  { id: 'scheme_applications', label: '15. Scheme Applications' },
  { id: 'market_prices', label: '16. APMC Mandi Market Rates' },
  { id: 'buyers', label: '17. Verified Buyer Directory' },
  { id: 'crop_listings', label: '18. Farmer Produce Listings' },
  { id: 'audit_logs', label: '19. System Audit Logs' },
];

export const AdminTableViewer: React.FC = () => {
  const { showToast } = useApp();

  const [selectedTable, setSelectedTable] = useState('warehouses');
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterDemo, setFilterDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  // Selected row modal
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const loadTableData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTableData(selectedTable, {
        search: searchQuery,
        page: currentPage,
        limit: 10,
        sortKey,
        sortDir,
        filterDemo,
      });

      setTableData(res.data);
      setTotalRecords(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
      showToast(`Error loading table ${selectedTable}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [selectedTable, currentPage, sortKey, sortDir, filterDemo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTableData();
  };

  const handleSort = (column: string) => {
    if (sortKey === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(column);
      setSortDir('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to soft delete record ${id} from table ${selectedTable}?`)) {
      return;
    }
    try {
      await api.deleteAdminRecord(selectedTable, id);
      showToast(`Record ${id} removed.`);
      loadTableData();
    } catch (e) {
      showToast('Failed to delete record');
    }
  };

  const exportCSV = () => {
    if (tableData.length === 0) return;
    const headers = Object.keys(tableData[0]).join(',');
    const rows = tableData.map((row) =>
      Object.values(row)
        .map((val) => `"${typeof val === 'object' ? JSON.stringify(val).replace(/"/g, '""') : val}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedTable}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${selectedTable}.csv`);
  };

  const columns = tableData.length > 0 ? Object.keys(tableData[0]).slice(0, 6) : [];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Top Table Selector & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-stone-900">Relational Database Table Browser</h3>
            <p className="text-xs text-stone-500">Live PostgreSQL instance with 30+ relational schemas</p>
          </div>
        </div>

        {/* Table Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value);
              setCurrentPage(1);
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 text-stone-900"
          >
            {TABLES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center space-x-1"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search across all fields in ${selectedTable}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center space-x-3 text-stone-600">
          <span>Total Records: <strong>{totalRecords}</strong></span>
          <button
            onClick={() => loadTableData()}
            className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-stone-200 rounded-xl overflow-hidden overflow-x-auto shadow-2xs">
        <table className="w-full text-xs text-left divide-y divide-stone-200">
          <thead className="bg-stone-50 font-bold text-stone-700 uppercase tracking-wider text-[10px]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="p-3 cursor-pointer hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.replace(/_/g, ' ')}</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
              ))}
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 text-stone-700">
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-stone-400">
                  No records found in table `{selectedTable}`.
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                  {columns.map((col) => {
                    const val = row[col];
                    const display =
                      typeof val === 'object' && val !== null
                        ? Array.isArray(val)
                          ? `[${val.length} items]`
                          : '{...}'
                        : String(val ?? '');

                    return (
                      <td key={col} className="p-3 max-w-[200px] truncate font-mono text-[11px]">
                        {display}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedRow(row)}
                      className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-700 transition-colors"
                      title="View Complete JSON Record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id || String(idx))}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-700 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2">
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">Record Inspection: {selectedTable}</h3>
                <p className="text-xs text-stone-500">ID: {selectedRow.id || 'N/A'}</p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 bg-stone-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {JSON.stringify(selectedRow, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
