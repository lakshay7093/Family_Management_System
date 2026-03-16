"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface DocumentItem {
  id: string
  title: string
  url?: string
  notes?: string
  createdAt?: unknown
}

export default function DocumentsPage() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)

  const documentsCollection = useMemo(() => collection(db, "documents"), [])

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocs(documentsCollection)
      const list = data.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DocumentItem, "id">),
      }))
      setDocuments(list)
    } catch (err) {
      console.error("Failed to load documents", err)
      setError("Unable to load documents. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [documentsCollection])

  const addDocument = async () => {
    if (!title.trim()) {
      setError("Please provide a title for the document.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(documentsCollection, {
        title,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      })
      setTitle("")
      setUrl("")
      setNotes("")
      await fetchDocuments()
    } catch (err) {
      console.error("Failed to add document", err)
      setError("Unable to add document. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const docRef = doc(db, "documents", id)
      await deleteDoc(docRef)
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Documents</h1>
          <p className="mt-2 text-sm text-slate-600">
            Store links, notes, and important files for everyone to access.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchDocuments} size="md">
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete document"
        description={
          confirmDelete
            ? `Delete "${confirmDelete.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteDocument(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Add a document"
          subtitle="Add a link or note that everyone can reference."
          className="max-w-xl"
        >
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
              {saving ? "Saving…" : "Add document"}
            </Button>
          </div>
        </Card>

        <Card title="Saved documents" footer={`${documents.length} items`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading documents…</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              No documents saved yet. Add one using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <Card
                  key={document.id}
                  className="p-5"
                  title={document.title}
                  footer={
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete({ id: document.id, title: document.title })}
                    >
                      Delete
                    </Button>
                  }
                >
                  {document.url && (
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                      Open link
                    </a>
                  )}
                  {document.notes && (
                    <p className="mt-2 text-sm text-slate-600">{document.notes}</p>
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
