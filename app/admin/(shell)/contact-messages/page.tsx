'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import {
  fetchAdminContactMessages,
  getCurrentUser,
  markContactMessageRead,
  type ContactMessage,
} from '@/app/lib/booking-api'
import { InitialsAvatar } from '../../components/initials-avatar'
import { StatusBadge } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

export default function AdminContactMessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [search, setSearch] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const loadData = async () => {
    try {
      setMessages(await fetchAdminContactMessages())
    } catch (loadError) {
      console.error('Unable to load contact messages', loadError)
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return messages
    return messages.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q)
    )
  }, [messages, search])

  const unreadCount = messages.filter((m) => !m.is_read).length

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message)
    if (!message.is_read) {
      try {
        const updated = await markContactMessageRead(message.id)
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        setSelectedMessage(updated)
      } catch (readError) {
        console.error('Unable to mark message read', readError)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search messages…"
        resultCount={filtered.length}
        totalCount={messages.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {unreadCount > 0 && (
        <p className="text-xs font-semibold text-[#EE6C52]">
          {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold">From</th>
              <th className="px-4 py-3 font-bold">Subject</th>
              <th className="px-4 py-3 font-bold">Received</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((message) => (
              <tr key={message.id} className={`hover:bg-slate-50/80 transition ${message.is_read ? '' : 'bg-orange-50/30'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={message.full_name} />
                    <div className="min-w-0">
                      <p className={`truncate ${message.is_read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                        {message.full_name}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">{message.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-64 truncate">{message.subject}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(message.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={message.is_read ? 'Read' : 'Unread'} tone={message.is_read ? 'neutral' : 'warning'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <IconActionButton icon={Eye} label="View message" onClick={() => openMessage(message)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  {messages.length === 0 ? 'No contact messages yet.' : 'No messages match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMessage && (
        <DetailModal
          title={selectedMessage.subject}
          subtitle={`${selectedMessage.full_name} · ${selectedMessage.email}`}
          onClose={() => setSelectedMessage(null)}
          fields={[
            { label: 'Phone', value: selectedMessage.phone || '—' },
            { label: 'Received', value: new Date(selectedMessage.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) },
          ]}
          footer={
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
              <a
                href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                className="block w-full text-center rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
              >
                Reply by email
              </a>
            </div>
          }
        />
      )}
    </div>
  )
}
