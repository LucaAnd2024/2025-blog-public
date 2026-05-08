import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const MEMORY_DIR = path.join(process.env.HOME || '/Users/lijialiang', '.claude_memory-system')
const INDEX_FILE = path.join(MEMORY_DIR, 'memory.json')
const BLOG_PUBLIC_DATA = '/Users/lijialiang/Projects/2025-blog-public/public/data/memory.json'

interface Memory {
  id: string
  name: string
  description: string
  type: 'user' | 'feedback' | 'project' | 'reference'
  tags: string[]
  content: string
  createdAt: string
  updatedAt: string
}

async function ensureDir() {
  if (!existsSync(MEMORY_DIR)) {
    await mkdir(MEMORY_DIR, { recursive: true })
    await mkdir(path.join(MEMORY_DIR, 'projects'), { recursive: true })
    await mkdir(path.join(MEMORY_DIR, 'config'), { recursive: true })
    await mkdir(path.join(MEMORY_DIR, 'notes'), { recursive: true })
  }
}

async function getMemories(): Promise<Memory[]> {
  try {
    await ensureDir()
    if (!existsSync(INDEX_FILE)) {
      return []
    }
    const data = await readFile(INDEX_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveMemories(memories: Memory[]) {
  await ensureDir()
  await writeFile(INDEX_FILE, JSON.stringify(memories, null, 2), 'utf-8')
  // Sync to blog public folder
  const blogDir = path.dirname(BLOG_PUBLIC_DATA)
  if (!existsSync(blogDir)) {
    await mkdir(blogDir, { recursive: true })
  }
  await writeFile(BLOG_PUBLIC_DATA, JSON.stringify(memories, null, 2), 'utf-8')
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function GET() {
  try {
    const memories = await getMemories()
    return NextResponse.json(memories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read memories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, tags, content } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const memories = await getMemories()
    const now = new Date().toISOString()

    const newMemory: Memory = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim() || '',
      type: type || 'project',
      tags: Array.isArray(tags) ? tags : [],
      content: content?.trim() || '',
      createdAt: now,
      updatedAt: now
    }

    memories.push(newMemory)
    await saveMemories(memories)

    return NextResponse.json(newMemory, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const memories = await getMemories()
    const index = memories.findIndex(m => m.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    memories[index] = {
      ...memories[index],
      ...body,
      id,
      updatedAt: new Date().toISOString()
    }

    await saveMemories(memories)

    return NextResponse.json(memories[index])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const memories = await getMemories()
    const filtered = memories.filter(m => m.id !== id)

    if (filtered.length === memories.length) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    await saveMemories(filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
}