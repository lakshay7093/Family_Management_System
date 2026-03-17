"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { useAuth } from "@/context/AuthContext"
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import AdminOnly from "@/components/AdminOnly"

interface SplitExpense {
  id: string
  title: string
  totalAmount: number
  paidBy: string
  splitAmong: string[]
  settled: string[]
  createdAt?: unknown
}

export default function SplitPage() {
  return (
    <AdminOnly>
      <SplitContent />
    </AdminOnly>
  )
}

function SplitContent() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [splitAmong, setSplitAmong] = useState("")
  const [expenses, setExpenses] = useState<SplitExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const col = useMemo(() => collection(db, "split_expenses"), [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(col)
      setExpenses(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SplitExpense, "id">) })))
    } catch {
      setError("Failed to load split expenses.")
    } finally {
      setLoading(false)
    }
  }, [col])

  useEffect(() => { void fetchExpenses() }, [fetchExpenses])

  const addExpense = async () => {
    const members = splitAmong.split(",").map(s => s.trim()).filter(Boolean)
    if (!title.trim() || !amount.trim() || !paidBy.trim() || members.length === 0) {
      setError("Fill all fields. Separate members with commas.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await addDoc(col, {
        title, totalAmount: Number(amount), paidBy,
        splitAmong: members, settled: [], createdAt: new Date(),
      })
      setTitle(""); setAmount(""); setPaidBy(""); setSplitAmong("")
      await fetchExpenses()
    } catch {
      setError("Failed to add expense.")
    } finally {
      setSaving(false)
    }
  }

  const markSettled = async (expense: SplitExpense, member: string) => {
    const newSettled = [...expense.settled, member]
    await updateDoc(doc(db, "split_expenses", expense.id), { settled: newSettled })
    await fetchExpenses()
  }

  const deleteExpense = async (id: string) => {
    await deleteDoc(doc(db, "split_expenses", id))
    await fetchExpenses()
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Expense Split</h1>
        <p className="mt-2 text-sm text-slate-600">Split shared expenses and track who has settled up.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Add split expense" subtitle="Enter who paid and who shares the cost.">
          <div className="space-y-4">
            {[
              { label: "Title", value: title, set: setTitle, placeholder: "e.g. Dinner at restaurant" },
              { label: "Total Amount (₹)", value: amount, set: setAmount, placeholder: "e.g. 2400", type: "number" },
              { label: "Paid by", value: paidBy, set: setPaidBy, placeholder: "e.g. Ajay" },
              { label: "Split among (comma separated)", value: splitAmong, set: setSplitAmong, placeholder: "e.g. Ajay, Priya, Rahul" },
            ].map(({ label, value, set, placeholder, type }) => (
              <label key={label} className="block">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  type={type ?? "text"}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </label>
            ))}
            <Button onClick={addExpense} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Add split expense"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Split Expenses</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No split expenses yet.
            </div>
          ) : (
            expenses.map(exp => {
              const perPerson = (exp.totalAmount / exp.splitAmong.length).toFixed(2)
              const allSettled = exp.splitAmong.every(m => m === exp.paidBy || exp.settled.includes(m))
              return (
                <Card key={exp.id} title={exp.title} footer={
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${allSettled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {allSettled ? "✓ Fully settled" : "Pending"}
                    </span>
                    <Button size="sm" variant="danger" onClick={() => deleteExpense(exp.id)}>Delete</Button>
                  </div>
                }>
                  <p className="text-sm text-slate-600">Total: ₹{exp.totalAmount} · ₹{perPerson}/person</p>
                  <p className="text-sm text-slate-500 mt-1">Paid by: {exp.paidBy}</p>
                  <div className="mt-3 space-y-2">
                    {exp.splitAmong.filter(m => m !== exp.paidBy).map(member => {
                      const settled = exp.settled.includes(member)
                      return (
                        <div key={member} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <span className="text-sm text-slate-700">{member} owes ₹{perPerson}</span>
                          {settled ? (
                            <span className="text-xs text-green-600 font-medium">Settled ✓</span>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => markSettled(exp, member)}>
                              Mark settled
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
