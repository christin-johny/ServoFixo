import React, { useEffect, useState } from "react";
import { Plus, Layers, RefreshCw } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";

import * as categoryRepo from "../../../../infrastructure/repositories/admin/serviceCategoryRepository";
import * as serviceRepo from "../../../../infrastructure/repositories/admin/serviceItemRepository";

import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../../domain/types/ServiceItem";

import CategoryCard from "../../../components/Admin/category/CategoryCard";
import CategoryModal from "../../../components/Admin/category/CategoryModal";
import ServiceItemModal from "../../../components/Admin/Modals/ServiceItemModal";
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";

// Strict Error Helper
const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response: { data?: { error?: string; message?: string } } };
        return apiError.response.data?.error || apiError.response.data?.message || "Unknown server error";
    }
    if (error instanceof Error) return error.message;
    return "Network error";
};

const Services: React.FC = () => {
    const { showSuccess, showError } = useNotification();

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [servicesMap, setServicesMap] = useState<{ [key: string]: ServiceItem[] }>({});
    const [loadingServices, setLoadingServices] = useState(false);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"CATEGORY" | "SERVICE" | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [debouncedSearch, filterStatus, page]);

    useEffect(() => {
        if (expandedId && !servicesMap[expandedId]) {
            loadServicesForCategory(expandedId);
        }
    }, [expandedId]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const result = await categoryRepo.getCategories({
                page, 
                limit: 5, 
                search: debouncedSearch, 
                isActive: filterStatus
            });
            
            // Backend now uses 'categories' and 'id'
            const categoryList = result.categories || []; 
            setCategories(categoryList);
            
            setTotal(result.total);
            setTotalPages(result.totalPages);

            if (categoryList.length === 0 && page > 1) {
                setPage(1);
            }
        } catch (err: unknown) {
            console.error(err);
            showError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSearch("");
        setFilterStatus("");
        setPage(1);
    };

    const loadServicesForCategory = async (catId: string) => {
        try {
            setLoadingServices(true);
            const result = await serviceRepo.getServices({ categoryId: catId, page: 1, limit: 100 });
            setServicesMap(prev => ({ ...prev, [catId]: result.data || [] })); 
        } catch (err: unknown) {
            showError("Failed to load services");
        } finally {
            setLoadingServices(false);
        }
    };

    const handleSaveCategory = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            if (editingCategory) {
                await categoryRepo.updateCategory(editingCategory.id, formData);
                showSuccess("Category updated");
            } else {
                await categoryRepo.createCategory(formData);
                showSuccess("Category created");
            }
            setIsCatModalOpen(false);
            loadCategories();
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleCategoryStatus = async (e: React.MouseEvent, category: ServiceCategory) => {
        e.stopPropagation();
        try {
            const newStatus = !category.isActive;
            await categoryRepo.toggleCategoryStatus(category.id, newStatus);
            showSuccess(`Category ${category.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
            loadCategories();
        } catch (err: unknown) {
            console.error(err);
            showError("Failed to update status. " + getErrorMessage(err));
        }
    };

    const handleAddService = (catId: string) => {
        setEditingService(null);
        setActiveCategoryId(catId);
        setIsServiceModalOpen(true);
    };

    const handleEditService = (service: ServiceItem) => {
        setEditingService(service);
        setActiveCategoryId(service.categoryId);
        setIsServiceModalOpen(true);
    };

    const handleSaveService = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            if (editingService) {
                await serviceRepo.updateService(editingService.id, formData);
                showSuccess("Service updated successfully");
            } else {
                await serviceRepo.createService(formData);
                showSuccess("Service item added successfully");
            }
            setIsServiceModalOpen(false);
            if (activeCategoryId) loadServicesForCategory(activeCategoryId);
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleServiceStatus = async (service: ServiceItem) => {
        try {
            const newStatus = !service.isActive;
            await serviceRepo.toggleServiceStatus(service.id, newStatus);
            showSuccess(`Service ${service.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
            if (expandedId) loadServicesForCategory(expandedId);
        } catch (err: unknown) {
            showError("Failed to update status");
        }
    };

    const confirmDeleteCategory = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteId(id);
        setDeleteType("CATEGORY");
    };

    const confirmDeleteService = (id: string) => {
        setDeleteId(id);
        setDeleteType("SERVICE");
    };

    const executeDelete = async () => {
        if (!deleteId || !deleteType) return;
        try {
            setIsDeleting(true);
            if (deleteType === "CATEGORY") {
                await categoryRepo.deleteCategory(deleteId);
                showSuccess("Category deleted");
                if (categories.length === 1 && page > 1) setPage(p => p - 1);
                else loadCategories();
            } else {
                await serviceRepo.deleteService(deleteId);
                showSuccess("Service deleted");
                if (expandedId) loadServicesForCategory(expandedId);
            }
            setDeleteId(null);
            setDeleteType(null);
        } catch (err: unknown) {
            showError(getErrorMessage(err));
        } finally {
            setIsDeleting(false);
        }
    };

    const EmptyState = (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 mx-1 flex flex-col items-center">
            <Layers className="text-gray-300 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-400 mb-1">
                {debouncedSearch || filterStatus ? "No Categories Match Your Filter" : "No Service Categories Found"}
            </h3>
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Layers className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Service Catalog
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage categories and service items.</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm font-bold text-sm transition-colors">
                    <Plus size={18} /> New Category
                </button>
            </div>

            {/* Responsive Filter Bar */}
            <SearchFilterBar
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                searchPlaceholder="Search Categories..."
                filterStatus={filterStatus}
                onFilterChange={(val) => { setFilterStatus(val); setPage(1); }}
                onClear={handleClearFilters}
                filterOptions={[
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" }
                ]}
                totalItems={total}
                currentCount={categories.length}
                itemName="Categories"
            />

            {/* Content List Area */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3"><RefreshCw size={32} className="animate-spin opacity-20" /><p className="text-sm font-medium">Loading...</p></div>
                ) : (
                    <>
                        {categories.length === 0 ? (
                            EmptyState
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {categories.map((cat) => (
                                    <CategoryCard
                                        // FIX: Use .id
                                        key={cat.id}
                                        category={cat}
                                        isExpanded={expandedId === cat.id}
                                        onToggleExpand={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                                        onEdit={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsCatModalOpen(true); }}
                                        onDelete={(e) => confirmDeleteCategory(e, cat.id)}
                                        onToggleStatus={(e) => handleToggleCategoryStatus(e, cat)}
                                        onToggleServiceStatus={handleToggleServiceStatus}
                                        services={servicesMap[cat.id] || []}
                                        isLoadingServices={expandedId === cat.id && loadingServices}
                                        onAddService={() => handleAddService(cat.id)}
                                        onEditService={handleEditService}
                                        onDeleteService={confirmDeleteService}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            <div className="bg-white z-10 relative">
                <PaginationBar
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>

            {/* Modals */}
            <CategoryModal
                isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}
                onSave={handleSaveCategory} initialData={editingCategory} isLoading={isSubmitting}
            />

            {activeCategoryId && (
                <ServiceItemModal
                    isOpen={isServiceModalOpen}
                    onClose={() => setIsServiceModalOpen(false)}
                    onSave={handleSaveService}
                    categoryId={activeCategoryId}
                    initialData={editingService}
                    isLoading={isSubmitting}
                />
            )}

            <ConfirmModal
                isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteType(null); }}
                onConfirm={executeDelete} isLoading={isDeleting}
                title={deleteType === "CATEGORY" ? "Delete Category" : "Delete Service"}
                message={deleteType === "CATEGORY" ? "Delete this category and all its services? (Archived)" : "Permanently delete this service item?"}
                confirmText="Delete"
            />
        </div>
    );
};

export default Services;