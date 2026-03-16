"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

interface Member {
  id: string
  name: string
  email: string
  relation: string
  createdAt?: unknown
}

export default function MembersPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [relation, setRelation] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  const membersCollection = useMemo(() => collection(db, "members"), [])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocs(membersCollection)
      const memberList = data.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }))
      setMembers(memberList)
    } catch (err) {
      console.error("Failed to load members", err)
      setError("Unable to load members. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [membersCollection])

  const handleAddMember = async () => {
    if (!name.trim() || !email.trim() || !relation.trim()) {
      setError("Please complete all fields before adding a member.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(membersCollection, {
        name,
        email,
        relation,
        createdAt: new Date(),
      })
      setName("")
      setEmail("")
      setRelation("")
      await fetchMembers()
    } catch (err) {
      console.error("Failed to add member", err)
      setError("Unable to add member. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const memberDoc = doc(db, "members", id)
      await deleteDoc(memberDoc)
      await fetchMembers()
    } catch (err) {
      console.error("Failed to delete member", err)
      setError("Unable to delete member. Please try again.")
    }
  }

  useEffect(() => {
    void fetchMembers()
  }, [fetchMembers])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Members</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add and manage members of your family. Everyone added here can be assigned tasks and tracked in other sections.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchMembers} size="md">
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
        title="Remove member"
        description={
          confirmDelete
            ? `Remove ${confirmDelete.name} from the family list? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteMember(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Add a new member"
          subtitle="Enter member details to add them to your family list."
          className="max-w-xl"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Priya Sharma"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="email@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Relation</span>
              <input
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Father, Sister"
              />
            </label>

            <Button type="button" onClick={handleAddMember} disabled={saving} className="w-full">
              {saving ? "Adding member…" : "Add member"}
            </Button>
          </div>
        </Card>

        <Card title="All members" footer={`${members.length} members`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading members…</p>
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              No members yet. Add someone using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="p-5"
                  title={member.name}
                  footer={
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete({ id: member.id, name: member.name })}
                    >
                      Remove
                    </Button>
                  }
                >
                  <p className="text-sm text-slate-600">{member.relation}</p>
                  <p className="mt-2 text-sm text-slate-500">{member.email}</p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
