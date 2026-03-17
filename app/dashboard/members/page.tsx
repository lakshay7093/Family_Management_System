"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import AdminOnly from "@/components/AdminOnly"

interface Member {
  id: string
  name: string
  email: string
  relation: string
  role?: string
  createdAt?: unknown
}

function MembersContent() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [relation, setRelation] = useState("")
  const [memberRole, setMemberRole] = useState<"member" | "admin">("member")
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
      setMembers(data.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, "id">) })))
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
        role: memberRole,
        createdAt: new Date(),
      })
      setName("")
      setEmail("")
      setRelation("")
      setMemberRole("member")
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
      await deleteDoc(doc(db, "members", id))
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
            Add and manage members of your family.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchMembers} size="md">Refresh</Button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove member"
        description={confirmDelete ? `Remove ${confirmDelete.name} from the family list? This cannot be undone.` : ""}
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
        <Card title="Add a new member" subtitle="Enter member details to add them to your family." className="max-w-xl">
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
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as "member" | "admin")}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Button type="button" onClick={handleAddMember} disabled={saving} className="w-full">
              {saving ? "Adding member…" : "Add member"}
            </Button>
          </div>
        </Card>

        <Card title="All members" footer={`${members.length} members`}>
          {loading ? (
            <p className="text-sm text-slate-600">Loading members…</p>
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
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
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ id: member.id, name: member.name })}>
                      Remove
                    </Button>
                  }
                >
                  <p className="text-sm text-slate-600">{member.relation}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${member.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>
                    {member.role === "admin" ? "👑 Admin" : "👤 Member"}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

export default function MembersPage() {
  return (
    <AdminOnly>
      <MembersContent />
    </AdminOnly>
  )
}
