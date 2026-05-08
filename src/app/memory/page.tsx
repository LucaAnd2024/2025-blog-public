'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Plus, Search, Trash2, Edit2, Tag, X } from 'lucide-react'

type MemoryType = 'user' | 'feedback' | 'project' | 'reference'

interface Memory {
  id: string
  name: string
  description: string
  type: MemoryType
  tags: string[]
  content: string
  createdAt: string
  updatedAt: string
}

const typeColors: Record<MemoryType, string> = {
  user: 'bg-blue-100 text-blue-700',
  feedback: 'bg-orange-100 text-orange-700',
  project: 'bg-green-100 text-green-700',
  reference: 'bg-purple-100 text-purple-700'
}

const typeLabels: Record<MemoryType, string> = {
  user: '用户',
  feedback: '反馈',
  project: '项目',
  reference: '引用'
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<MemoryType | 'all'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', type: 'project' as MemoryType, tags: '', content: '' })

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memory')
      if (res.ok) {
        const data = await res.json()
        setMemories(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error('请输入名称')
      return
    }
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })
      })
      if (res.ok) {
        toast.success('添加成功')
        setShowAddForm(false)
        setForm({ name: '', description: '', type: 'project', tags: '', content: '' })
        fetchMemories()
      }
    } catch (e) {
      toast.error('添加失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    try {
      const res = await fetch(`/api/memory?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('删除成功')
        fetchMemories()
      }
    } catch (e) {
      toast.error('删除失败')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/memory?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        toast.success('更新成功')
        setEditingId(null)
        setForm({ name: '', description: '', type: 'project', tags: '', content: '' })
        fetchMemories()
      }
    } catch (e) {
      toast.error('更新失败')
    }
  }

  const startEdit = (m: Memory) => {
    setEditingId(m.id)
    setForm({ name: m.name, description: m.description, type: m.type, tags: m.tags.join(', '), content: m.content })
  }

  const filtered = memories.filter(m => {
    const matchSearch = m.name.includes(search) || m.description.includes(search) || m.content.includes(search) || m.tags.some(t => t.includes(search))
    const matchType = filterType === 'all' || m.type === filterType
    return matchSearch && matchType
  })

  return (
    <div className='flex min-h-screen flex-col items-center px-6 pt-28 pb-20'>
      <div className='w-full max-w-4xl'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>记忆系统</h1>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddForm(true)} className='brand-btn flex items-center gap-2 px-4 py-2'>
            <Plus className='size-4' /> 添加记忆
          </motion.button>
        </div>

        <div className='mb-6 flex gap-4'>
          <div className='relative flex-1'>
            <Search className='text-secondary absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='搜索记忆...' className='bg-card w-full rounded-xl border py-2 pl-10 pr-4 text-sm' />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value as MemoryType | 'all')} className='bg-card rounded-xl border px-4 py-2 text-sm'>
            <option value='all'>全部类型</option>
            {(Object.keys(typeLabels) as MemoryType[]).map(t => (
              <option key={t} value={t}>{typeLabels[t]}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className='text-secondary py-12 text-center'>加载中...</div>
        ) : filtered.length === 0 ? (
          <div className='text-secondary py-12 text-center'>暂无记忆</div>
        ) : (
          <div className='space-y-4'>
            {filtered.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='card p-6'>
                {editingId === m.id ? (
                  <div className='space-y-4'>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='名称' />
                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='描述' />
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as MemoryType })} className='bg-card rounded-lg border px-3 py-2 text-sm'>
                      {(Object.keys(typeLabels) as MemoryType[]).map(t => (
                        <option key={t} value={t}>{typeLabels[t]}</option>
                      ))}
                    </select>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='标签（逗号分隔）' />
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='内容' />
                    <div className='flex justify-end gap-2'>
                      <button onClick={() => setEditingId(null)} className='rounded-lg border px-4 py-1.5 text-sm'>取消</button>
                      <button onClick={() => handleUpdate(m.id)} className='brand-btn rounded-lg px-4 py-1.5 text-sm'>保存</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='mb-3 flex items-start justify-between'>
                      <div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[m.type]}`}>{typeLabels[m.type]}</span>
                        <h3 className='mt-2 text-lg font-medium'>{m.name}</h3>
                        {m.description && <p className='text-secondary mt-1 text-sm'>{m.description}</p>}
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => startEdit(m)} className='text-secondary hover:text-brand rounded p-1'><Edit2 className='size-4' /></button>
                        <button onClick={() => handleDelete(m.id)} className='text-secondary hover:text-red-500 rounded p-1'><Trash2 className='size-4' /></button>
                      </div>
                    </div>
                    {m.content && <p className='text-secondary mb-3 text-sm whitespace-pre-wrap'>{m.content}</p>}
                    {m.tags.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {m.tags.map(t => (
                          <span key={t} className='bg-brand/10 text-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'>
                            <Tag className='size-3' /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className='text-secondary mt-3 text-xs'>更新于 {new Date(m.updatedAt).toLocaleString()}</div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='card w-full max-w-lg p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-lg font-medium'>添加记忆</h2>
              <button onClick={() => setShowAddForm(false)} className='text-secondary hover:text-primary'><X className='size-5' /></button>
            </div>
            <div className='space-y-4'>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='名称 *' />
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='描述' />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as MemoryType })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm'>
                {(Object.keys(typeLabels) as MemoryType[]).map(t => (
                  <option key={t} value={t}>{typeLabels[t]}</option>
                ))}
              </select>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='标签（逗号分隔）' />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} className='bg-card w-full rounded-lg border px-3 py-2 text-sm' placeholder='内容' />
              <div className='flex justify-end gap-2'>
                <button onClick={() => setShowAddForm(false)} className='rounded-lg border px-4 py-2 text-sm'>取消</button>
                <button onClick={handleAdd} className='brand-btn rounded-lg px-4 py-2 text-sm'>添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}