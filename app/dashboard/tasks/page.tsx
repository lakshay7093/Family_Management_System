"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { db } from "@/firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import AdminOnly from "@/components/AdminOnly"

interface Task {
  id: string
  title: string
  assignedTo: string
  status: string
  createdAt?: unknown
}

export default function TasksPage() {
  return (
    <AdminOnly>
      <TasksContent />
    </AdminOnly>
  )
}

function TasksContent() {
  const [title, setTitle] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null)

  const tasksCollection = useMemo(() => collection(db, "tasks"), [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getDocs(tasksCollection)
      const taskList = data.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Task, "id">) }))
      setTasks(taskList)
    } catch (err) {
      console.error("Failed to load tasks", err)
      setError("Unable to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [tasksCollection])

  const addTask = async () => {
    if (!title.trim() || !assignedTo.trim()) {
      setError("Please provide a title and assignee.")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addDoc(tasksCollection, {
        title,
        assignedTo,
        status: "pending",
        createdAt: new Date(),
      })
      setTitle("")
      setAssignedTo("")
      await fetchTasks()
    } catch (err) {
      console.error("Failed to add task", err)
      setError("Unable to add task. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const taskDoc = doc(db, "tasks", id)
      await deleteDoc(taskDoc)
      await fetchTasks()
    } catch (err) {
      console.error("Failed to delete task", err)
      setError("Unable to delete task. Please try again.")
    }
  }

  const markCompleted = async (id: string) => {
    try {
      const taskDoc = doc(db, "tasks", id)
      await updateDoc(taskDoc, { status: "completed" })
      await fetchTasks()
    } catch (err) {
      console.error("Failed to update task", err)
      setError("Unable to update task status. Please try again.")
    }
  }

  useEffect(() => {
    void fetchTasks()
  }, [fetchTasks])

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Tasks</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track chores and responsibilities for everyone in your family.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchTasks} size="md">
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
        title="Delete task"
        description={
          confirmDelete
            ? `Are you sure you want to remove "${confirmDelete.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return
          void deleteTask(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Add new task"
          subtitle="Create a task and assign it to someone in your family."
          className="max-w-xl"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Task title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Buy groceries"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Assigned to</span>
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Neha"
              />
            </label>
            <Button type="button" onClick={addTask} disabled={saving} className="w-full">
              {saving ? "Saving task..." : "Add task"}
            </Button>
          </div>
        </Card>

        <Card title="Current tasks" footer={`${tasks.length} tasks`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Loading tasks…</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              No tasks yet. Create one using the form.
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="p-5"
                  title={task.title}
                  footer={
                    <div className="flex flex-wrap gap-2">
                      {task.status !== "completed" && (
                        <Button size="sm" variant="secondary" onClick={() => markCompleted(task.id)}>
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmDelete({ id: task.id, title: task.title })}
                      >
                        Delete
                      </Button>
                    </div>
                  }
                >
                  <p className="text-sm text-slate-600">Assigned to: {task.assignedTo}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Status: <span className={task.status === "completed" ? "text-emerald-600" : "text-indigo-600"}>{task.status}</span>
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
