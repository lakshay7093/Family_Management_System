"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import AdminOnly from "@/components/AdminOnly"

interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  category: string
  createdAt?: unknown
}

export default function ExpensesPage() {
  return (
    <AdminOnly>
      <ExpensesContent />
    </AdminOnly>
  )
}

function ExpensesContent() {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [category, setCategory] = useState("")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)

  const expensesCollection = useMemo(() => collection(db, "expenses"), [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocs(expensesCollection)
      const expenseList = data.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Expense, "id">),
      }))
      setExpenses(expenseList)
    } catch (err) {
      console.error("Failed to load expenses", err)
      setError("Unable to load expenses. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [expensesCollection])

  const addExpense = async () => {
    if (!title.trim() || !amount.trim() || !paidBy.trim() || !category.trim()) {
      setError("Please provide all details for the expense.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(expensesCollection, {
        title,
        amount: Number(amount),
        paidBy,
        category,
        createdAt: new Date(),
      })
      setTitle("")
      setAmount("")
      setPaidBy("")
      setCategory("")
      await fetchExpenses()
    } catch (err) {
      console.error("Failed to add expense", err)
      setError("Unable to add expense. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const expenseDoc = doc(db, "expenses", id)
      await deleteDoc(expenseDoc)
      await fetchExpenses()
    } catch (err) {
      console.error("Failed to delete expense", err)
      setError("Unable to delete expense. Please try again.")
    }
  }

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Expenses</h1>
          <p className="mt-2 text-sm text-slate-600">
            Record shared costs and keep track of who paid and why.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchExpenses} size="md">
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
        title="Delete expense"
        description={
          confirmDelete
            ? `Remove ${confirmDelete.title} from your expenses? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteExpense(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Add a new expense"
          subtitle="Log an expense and note who paid and why."
          className="max-w-xl"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Grocery shopping"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Amount</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. 1200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Paid by</span>
              <input
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Ajay"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Utilities"
              />
            </label>

            <Button type="button" onClick={addExpense} disabled={saving} className="w-full">
              {saving ? "Saving expense..." : "Add expense"}
            </Button>
          </div>
        </Card>

        <Card title="Recent expenses" footer={`${expenses.length} items`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading expenses…</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              No expenses logged yet. Add one using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {expenses.map((expense) => (
                <Card
                  key={expense.id}
                  className="p-5"
                  title={expense.title}
                  footer={
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                      <p className="text-sm font-semibold text-slate-700">₹{expense.amount}</p>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmDelete({ id: expense.id, title: expense.title })}
                      >
                        Delete
                      </Button>
                    </div>
                  }
                >
                  <p className="text-sm text-slate-600">Category: {expense.category}</p>
                  <p className="mt-2 text-sm text-slate-500">Paid by: {expense.paidBy}</p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
