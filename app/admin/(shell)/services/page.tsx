'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, LayoutGrid, List, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  createAdminCategory,
  createAdminService,
  deleteAdminCategory,
  deleteAdminService,
  fetchAdminCategories,
  getCurrentUser,
  updateAdminCategory,
  updateAdminService,
  type CatalogCategory,
  type CatalogService,
} from '@/app/lib/booking-api'
import { StatusBadge } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { Pagination } from '../../components/pagination'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

const PAGE_SIZE = 10

type ViewMode = 'categories' | 'all-services'

type CategoryFormState = {
  name: string
  display_name: string
  icon: string
  tagline: string
  is_active: boolean
  sort_order: string
}

type ServiceFormState = {
  category_id: string
  name: string
  subtitle: string
  price: string
  is_active: boolean
  sort_order: string
}

const EMPTY_CATEGORY_FORM: CategoryFormState = { name: '', display_name: '', icon: '', tagline: '', is_active: true, sort_order: '0' }
const EMPTY_SERVICE_FORM: ServiceFormState = { category_id: '', name: '', subtitle: '', price: '', is_active: true, sort_order: '0' }

export default function AdminServicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [search, setSearch] = useState('')
  const [categoryPage, setCategoryPage] = useState(1)
  const [servicePage, setServicePage] = useState(1)

  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM)
  const [addingCategory, setAddingCategory] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)

  const [editingService, setEditingService] = useState<{ category: CatalogCategory; service: CatalogService | null } | null>(null)
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(EMPTY_SERVICE_FORM)
  const [savingService, setSavingService] = useState(false)

  const loadData = async () => {
    try {
      setCategories(await fetchAdminCategories())
    } catch (loadError) {
      console.error('Unable to load categories', loadError)
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const user = await getCurrentUser('admin')
        if (user.role !== 'admin') {
          router.push('/admin/login')
          return
        }
      } catch {
        router.push('/admin/login')
        return
      }
      await loadData()
      if (active) setLoading(false)
    }
    init()
    return () => {
      active = false
    }
  }, [router])

  useAutoRefreshOnFocus(() => {
    if (!loading) loadData()
  })

  const allServiceRows = useMemo(
    () => categories.flatMap((category) => category.services.map((service) => ({ service, category }))),
    [categories]
  )

  const filteredServiceRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allServiceRows
    return allServiceRows.filter(
      ({ service, category }) =>
        service.name.toLowerCase().includes(q) ||
        (service.subtitle || '').toLowerCase().includes(q) ||
        category.display_name.toLowerCase().includes(q)
    )
  }, [allServiceRows, search])

  const servicePageCount = Math.max(1, Math.ceil(filteredServiceRows.length / PAGE_SIZE))
  const currentServicePage = Math.min(servicePage, servicePageCount)
  const pagedServiceRows = useMemo(
    () => filteredServiceRows.slice((currentServicePage - 1) * PAGE_SIZE, currentServicePage * PAGE_SIZE),
    [filteredServiceRows, currentServicePage]
  )

  const categoryPageCount = Math.max(1, Math.ceil(categories.length / PAGE_SIZE))
  const currentCategoryPage = Math.min(categoryPage, categoryPageCount)
  const pagedCategories = useMemo(
    () => categories.slice((currentCategoryPage - 1) * PAGE_SIZE, currentCategoryPage * PAGE_SIZE),
    [categories, currentCategoryPage]
  )

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openAddCategory = () => {
    setError('')
    setCategoryForm(EMPTY_CATEGORY_FORM)
    setAddingCategory(true)
  }

  const openEditCategory = (category: CatalogCategory) => {
    setError('')
    setCategoryForm({
      name: category.name,
      display_name: category.display_name,
      icon: category.icon || '',
      tagline: category.tagline || '',
      is_active: category.is_active,
      sort_order: String(category.sort_order),
    })
    setEditingCategory(category)
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) return
    setSavingCategory(true)
    setError('')
    try {
      const payload = {
        name: categoryForm.name.trim(),
        display_name: categoryForm.display_name.trim() || categoryForm.name.trim(),
        icon: categoryForm.icon.trim() || undefined,
        tagline: categoryForm.tagline.trim() || undefined,
        is_active: categoryForm.is_active,
        sort_order: Number(categoryForm.sort_order) || 0,
      }
      if (editingCategory) {
        const updated = await updateAdminCategory(editingCategory.id, payload)
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...updated, services: c.services } : c)))
        setEditingCategory(null)
      } else {
        const created = await createAdminCategory(payload)
        setCategories((prev) => [...prev, created])
        setAddingCategory(false)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save category.')
    } finally {
      setSavingCategory(false)
    }
  }

  const removeCategory = async (category: CatalogCategory) => {
    if (!window.confirm(`Delete "${category.display_name}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteAdminCategory(category.id)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete category.')
    }
  }

  const openAddService = (category: CatalogCategory) => {
    setError('')
    setServiceForm({ ...EMPTY_SERVICE_FORM, category_id: category.id })
    setEditingService({ category, service: null })
  }

  const openEditService = (category: CatalogCategory, service: CatalogService) => {
    setError('')
    setServiceForm({
      category_id: category.id,
      name: service.name,
      subtitle: service.subtitle || '',
      price: service.price != null ? String(service.price) : '',
      is_active: service.is_active,
      sort_order: String(service.sort_order),
    })
    setEditingService({ category, service })
  }

  const saveService = async () => {
    if (!serviceForm.name.trim() || !editingService) return
    setSavingService(true)
    setError('')
    try {
      const priceValue = serviceForm.price.trim() ? Number(serviceForm.price) : undefined
      if (editingService.service) {
        const updated = await updateAdminService(editingService.service.id, {
          name: serviceForm.name.trim(),
          subtitle: serviceForm.subtitle.trim() || undefined,
          price: priceValue,
          is_active: serviceForm.is_active,
          sort_order: Number(serviceForm.sort_order) || 0,
        })
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingService.category.id
              ? { ...c, services: c.services.map((s) => (s.id === updated.id ? updated : s)) }
              : c
          )
        )
      } else {
        const created = await createAdminService({
          category_id: serviceForm.category_id,
          name: serviceForm.name.trim(),
          subtitle: serviceForm.subtitle.trim() || undefined,
          price: priceValue,
          is_active: serviceForm.is_active,
          sort_order: Number(serviceForm.sort_order) || 0,
        })
        setCategories((prev) =>
          prev.map((c) => (c.id === serviceForm.category_id ? { ...c, services: [...c.services, created] } : c))
        )
      }
      setEditingService(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save service.')
    } finally {
      setSavingService(false)
    }
  }

  const removeService = async (category: CatalogCategory, service: CatalogService) => {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteAdminService(service.id)
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, services: c.services.filter((s) => s.id !== service.id) } : c))
      )
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete service.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  const showingCategoryForm = addingCategory || editingCategory !== null
  const categoryFormTitle = editingCategory ? `Edit ${editingCategory.display_name}` : 'Add category'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('categories')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'categories' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Categories
          </button>
          <button
            onClick={() => setViewMode('all-services')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'all-services' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> All services
          </button>
        </div>
        <button
          onClick={openAddCategory}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE6C52] px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add category
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      {viewMode === 'categories' && (
      <div className="space-y-3">
        {pagedCategories.map((category) => {
          const isOpen = expanded.has(category.id)
          return (
            <div key={category.id} className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate">{category.display_name}</p>
                    <p className="text-[11px] text-slate-400">{category.services.length} service{category.services.length === 1 ? '' : 's'}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge label={category.is_active ? 'Active' : 'Inactive'} tone={category.is_active ? 'good' : 'neutral'} />
                  <IconActionButton icon={Plus} label="Add service" onClick={() => openAddService(category)} />
                  <IconActionButton icon={Pencil} label="Edit category" onClick={() => openEditCategory(category)} />
                  <IconActionButton icon={Trash2} label="Delete category" tone="danger" onClick={() => removeCategory(category)} />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100">
                  {category.services.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">No services in this category yet.</p>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                        <tr>
                          <th className="px-4 py-2.5 font-bold">Service</th>
                          <th className="px-4 py-2.5 font-bold">Price</th>
                          <th className="px-4 py-2.5 font-bold">Status</th>
                          <th className="px-4 py-2.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {category.services.map((service) => (
                          <tr key={service.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 py-2.5">
                              <p className="font-semibold text-slate-800">{service.name}</p>
                              {service.subtitle && <p className="text-[11px] text-slate-400">{service.subtitle}</p>}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500">{service.price_label || '—'}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge label={service.is_active ? 'Active' : 'Inactive'} tone={service.is_active ? 'good' : 'neutral'} />
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-1.5">
                                <IconActionButton icon={Pencil} label="Edit service" onClick={() => openEditService(category, service)} />
                                <IconActionButton icon={Trash2} label="Delete service" tone="danger" onClick={() => removeService(category, service)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {categories.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center text-xs text-slate-400">
            No categories yet. Add one to get started.
          </div>
        )}
        <Pagination page={currentCategoryPage} pageCount={categoryPageCount} onPageChange={setCategoryPage} />
      </div>
      )}

      {viewMode === 'all-services' && (
        <div className="space-y-3">
          <TableToolbar
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setServicePage(1)
            }}
            placeholder="Search services…"
            resultCount={filteredServiceRows.length}
            totalCount={allServiceRows.length}
          />
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-bold">Service</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Price</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedServiceRows.map(({ service, category }) => (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-800">{service.name}</td>
                    <td className="px-4 py-3 text-slate-500">{category.display_name}</td>
                    <td className="px-4 py-3 text-slate-500">{service.price != null ? `Rs. ${service.price.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={service.is_active ? 'Active' : 'Inactive'}
                        tone={service.is_active ? 'good' : 'neutral'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconActionButton icon={Pencil} label="Edit service" onClick={() => openEditService(category, service)} />
                        <IconActionButton icon={Trash2} label="Delete service" tone="danger" onClick={() => removeService(category, service)} />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServiceRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                      {allServiceRows.length === 0 ? 'No services yet.' : 'No services match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={currentServicePage} pageCount={servicePageCount} onPageChange={setServicePage} />
        </div>
      )}

      {showingCategoryForm && (
        <DetailModal
          title={categoryFormTitle}
          onClose={() => {
            setAddingCategory(false)
            setEditingCategory(null)
          }}
          fields={[]}
          footer={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Name</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Solar Panel Installation"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Display name (optional)</label>
                <input
                  value={categoryForm.display_name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Shown to customers — defaults to Name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Tagline (optional)</label>
                <input
                  value={categoryForm.tagline}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Short description shown on the category page"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#EE6C52]"
                />
                Active (visible to customers)
              </label>
              <button
                onClick={saveCategory}
                disabled={!categoryForm.name.trim() || savingCategory}
                className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {savingCategory ? 'Saving…' : editingCategory ? 'Save changes' : 'Create category'}
              </button>
            </div>
          }
        />
      )}

      {editingService && (
        <DetailModal
          title={editingService.service ? `Edit ${editingService.service.name}` : `Add service to ${editingService.category.display_name}`}
          onClose={() => setEditingService(null)}
          fields={[]}
          footer={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Name</label>
                <input
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Pipe Repair"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Subtitle (optional)</label>
                <input
                  value={serviceForm.subtitle}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Fixed market price (Rs., optional)</label>
                <input
                  type="number"
                  min={0}
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#EE6C52]"
                />
                Active (visible to customers)
              </label>
              <button
                onClick={saveService}
                disabled={!serviceForm.name.trim() || savingService}
                className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {savingService ? 'Saving…' : editingService.service ? 'Save changes' : 'Add service'}
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}
