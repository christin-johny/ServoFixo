import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Layers, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as categoryRepo from "../../../../infrastructure/repositories/serviceCategoryRepository";
import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";

// Components
import CategoryCard from "../../../components/Admin/CategoryCard";
import CategoryModal from "../../../components/Modals/CategoryModal";
import ConfirmModal from "../../../components/Modals/ConfirmModal";

const Services: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  // --- Data State ---
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- Filter State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "" | "true" | "false"
  const debouncedSearch = useDebounce(search, 500);

  // --- UI State ---
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Delete State ---
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Data
  useEffect(() => {
    loadCategories();
  }, [debouncedSearch, filterStatus, page]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryRepo.getCategories({
        page,
        limit: 10,
        search: debouncedSearch,
        isActive: filterStatus
      });
      setCategories(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      showError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryRepo.updateCategory(editingCategory._id, formData);
        showSuccess("Category updated successfully");
      } else {
        await categoryRepo.createCategory(formData);
        showSuccess("Category created successfully");
      }
      setIsModalOpen(false);
      loadCategories(); // Refresh list
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to save category";
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await categoryRepo.deleteCategory(deleteId);
      showSuccess("Category deleted successfully");
      setDeleteId(null);
      
      // Pagination fix: go back if empty
      if (categories.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        loadCategories();
      }
    } catch (err: any) {
      showError(err.response?.data?.error || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="text-blue-600" /> Service Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage service categories and their specific offerings.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm font-bold"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* --- Filter Bar --- */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
        <div className="flex gap-3 w-full sm:w-auto flex-1 max-w-2xl">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 h-11 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filter */}
          <div className="relative w-40 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full h-11 pl-4 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
          {total} Records
        </span>
      </div>

      {/* --- Content Grid --- */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <RefreshCw size={32} className="animate-spin opacity-20" />
            <p className="text-sm font-medium">Loading catalog...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Layers size={40} className="opacity-20" />
            <p className="text-sm font-medium">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {categories.map((cat) => (
              <CategoryCard 
                key={cat._id}
                category={cat}
                isExpanded={expandedId === cat._id}
                onToggleExpand={() => setExpandedId(expandedId === cat._id ? null : cat._id)}
                onEdit={() => handleEdit(cat)}
                onDelete={() => setDeleteId(cat._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Pagination Footer --- */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 shrink-0">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* --- Modals --- */}
      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure? This will delete the category icon from S3 and remove the category from the database."
        confirmText="Delete Permanently"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Services;