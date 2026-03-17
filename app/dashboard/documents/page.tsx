"use client"

export const dynamic = "force-dynamic"

import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface DocumentItem {
  id: string
  title: string
  url?: string
  file_url?: string
  file_name?: string
  file_size?: number
  file_type?: string
  file_path?: string
  notes?: string
  uploaded_by?: string
  created_at?: string
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DOCS_BUCKET = "FAMILY_DOCUMENTS"
const IMAGES_BUCKET = "Family_images"

function getBucket(file: File) {
  return file.type.startsWith("image/") ? IMAGES_BUCKET : DOCS_BUCKET
}

export default function DocumentsPage() {
  const { role, user } = useAuth()
  const isAdmin = role === "admin"

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    title: string
    file_path?: string
    file_type?: string
  } | null>(null)

  const documentsCollection = collection(db, "documents")

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw new Error(error.message)
      setDocuments(data ?? [])
    } catch (err) {
      console.error("Failed to load documents", err)
      setError("Unable to load documents. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadToSupabase = async (file: File) => {
    const bucket = getBucket(file)
    const filePath = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    setUploadProgress(10)

    const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    setUploadProgress(80)

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    setUploadProgress(100)
    setTimeout(() => setUploadProgress(null), 500)

    return {
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_path: filePath,
    }
  }

  const addDocument = async () => {
    if (!title.trim()) {
      setError("Please provide a title.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      let fileData = {}

      if (file) {
        fileData = await uploadToSupabase(file)
      }

      const { data: inserted, error: supabaseError } = await supabase
        .from("documents")
        .insert({
          title,
          ...(url.trim() && { url: url.trim() }),
          ...(notes.trim() && { notes: notes.trim() }),
          uploaded_by: user?.email ?? "Unknown",
          ...fileData,
        })
        .select("id")
        .single()

      if (supabaseError) throw new Error(supabaseError.message)

      // Also save to Firebase Firestore with supabaseId for sync
      await addDoc(documentsCollection, {
        title,
        ...(url.trim() && { url: url.trim() }),
        ...(notes.trim() && { notes: notes.trim() }),
        uploadedBy: user?.email ?? "Unknown",
        supabaseId: inserted?.id ?? null,
        createdAt: new Date(),
        ...(fileData as Record<string, unknown>),
      })
      setTitle("")
      setUrl("")
      setNotes("")
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      await fetchDocuments()
    } catch (err) {
      console.error("Failed to add document", err)
      setError(err instanceof Error ? err.message : "Unable to add document.")
    } finally {
      setSaving(false)
    }
  }

  const deleteDocument = async (id: string, file_path?: string, file_type?: string) => {
    try {
      // Delete file from Supabase Storage
      if (file_path) {
        const bucket = file_type?.startsWith("image/") ? IMAGES_BUCKET : DOCS_BUCKET
        await supabase.storage.from(bucket).remove([file_path])
      }
      // Delete from Supabase DB
      const { error } = await supabase.from("documents").delete().eq("id", id)
      if (error) throw new Error(error.message)

      // Delete matching doc from Firebase (match by supabase id stored as supabaseId)
      const snap = await getDocs(documentsCollection)
      const match = snap.docs.find((d) => d.data().supabaseId === id)
      if (match) await deleteDoc(doc(db, "documents", match.id))

      await fetchDocuments()
    } catch (err) {
      console.error("Failed to delete document", err)
      setError("Unable to delete document. Please try again.")
    }
  }

  useEffect(() => {
    void fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? "Documents" : "Family Documents"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isAdmin
              ? "Manage important files and links for the family."
              : "View and add documents shared with your family."}
          </p>
        </div>
        <Button variant="secondary" onClick={fetchDocuments} size="md">Refresh</Button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete document"
        description={confirmDelete ? `Delete "${confirmDelete.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteDocument(confirmDelete.id, confirmDelete.file_path, confirmDelete.file_type)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Add a document" subtitle="Upload a file or add a link with notes.">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Home insurance policy"
              />
            </label>

            <div>
              <span className="text-sm font-medium text-slate-700">Upload file (optional)</span>
              <div
                className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800">📎 {file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl">📁</p>
                    <p className="mt-2 text-sm text-slate-600">Click to select a file</p>
                    <p className="text-xs text-slate-400">PDF, images, docs — any format</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Uploading…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Link (optional)</span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="https://example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Add a note or description"
                rows={3}
              />
            </label>

            <Button type="button" onClick={addDocument} disabled={saving} className="w-full">
              {saving
                ? uploadProgress !== null ? `Uploading ${uploadProgress}%…` : "Saving…"
                : "Add document"}
            </Button>
          </div>
        </Card>

        <Card title="Saved documents" footer={`${documents.length} items`}>
          {loading ? (
            <p className="text-sm text-slate-600">Loading documents…</p>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              No documents yet. Add one using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <Card
                  key={document.id}
                  className="p-5"
                  title={document.title}
                  footer={
                    isAdmin ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          setConfirmDelete({
                            id: document.id,
                            title: document.title,
                            file_path: document.file_path,
                            file_type: document.file_type,
                          })
                        }
                      >
                        Delete
                      </Button>
                    ) : undefined
                  }
                >
                  {document.file_url && (
                    document.file_type?.startsWith("image/") ? (
                      <div className="mt-2">
                        <img
                          src={document.file_url}
                          alt={document.file_name}
                          className="w-full rounded-lg border border-slate-200 object-cover max-h-48"
                        />
                        <a href={document.file_url} target="_blank" rel="noreferrer"
                          className="mt-1 inline-block text-xs text-indigo-600 hover:underline">
                          Open full image ↗
                        </a>
                      </div>
                    ) : (
                      <a
                        href={document.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                      >
                        <span>📎</span>
                        <span className="flex-1 truncate">{document.file_name ?? "Download file"}</span>
                        {document.file_size && (
                          <span className="text-xs text-slate-400 shrink-0">{formatBytes(document.file_size)}</span>
                        )}
                      </a>
                    )
                  )}

                  {document.url && (
                    <a href={document.url} target="_blank" rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
                      Open link ↗
                    </a>
                  )}

                  {document.notes && (
                    <p className="mt-2 text-sm text-slate-500">{document.notes}</p>
                  )}

                  {document.uploaded_by && (
                    <p className="mt-2 text-xs text-slate-400">Added by {document.uploaded_by}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
