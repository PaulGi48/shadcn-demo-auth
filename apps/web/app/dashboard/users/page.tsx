
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FiArrowLeft,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

type UserStatus = "Active" | "Inactive"

type UserRecord = {
  id: number
  name: string
  email: string
  role: string
  status: UserStatus
}

const STORAGE_KEY = "demo-dashboard-users"

const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: "Amara Okafor",
    email: "amara@example.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 2,
    name: "Daniel Adeyemi",
    email: "daniel@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 3,
    name: "Zara Ibrahim",
    email: "zara@example.com",
    role: "Viewer",
    status: "Inactive",
  },
  {
    id: 4,
    name: "David Eze",
    email: "david@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 5,
    name: "Tomiwa Bello",
    email: "tomiwa@example.com",
    role: "Viewer",
    status: "Inactive",
  },
]

export default function UsersPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = React.useState(false)
  const [users, setUsers] = React.useState<UserRecord[]>([])
  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("Viewer")
  const [status, setStatus] = React.useState<UserStatus>("Active")
  const [formError, setFormError] = React.useState("")

  React.useEffect(() => {
    if (localStorage.getItem("demo-authenticated") !== "true") {
      router.replace("/login")
      return
    }

    try {
      const savedUsers = localStorage.getItem(STORAGE_KEY)
      setUsers(savedUsers ? JSON.parse(savedUsers) : initialUsers)
    } catch {
      setUsers(initialUsers)
    }

    setAuthorized(true)
  }, [router])

  function saveUsers(updatedUsers: UserRecord[]) {
    setUsers(updatedUsers)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers))
  }

  function openAddForm() {
    setEditingId(null)
    setName("")
    setEmail("")
    setRole("Viewer")
    setStatus("Active")
    setFormError("")
    setShowForm(true)
  }

  function openEditForm(user: UserRecord) {
    setEditingId(user.id)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setStatus(user.status)
    setFormError("")
    setShowForm(true)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError("")

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || !cleanEmail) {
      setFormError("Please enter the user's name and email.")
      return
    }

    const emailIsUsed = users.some(
      (user) =>
        user.email.toLowerCase() === cleanEmail &&
        user.id !== editingId
    )

    if (emailIsUsed) {
      setFormError("A user with this email already exists.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (editingId !== null) {
      saveUsers(
        users.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name: cleanName,
                email: cleanEmail,
                role,
                status,
              }
            : user
        )
      )
    } else {
      const newUser: UserRecord = {
        id: Date.now(),
        name: cleanName,
        email: cleanEmail,
        role,
        status,
      }

      saveUsers([newUser, ...users])
    }

    setShowForm(false)
  }

  function deleteUser(user: UserRecord) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    )

    if (!confirmed) return

    saveUsers(users.filter((item) => item.id !== user.id))
  }

  function logout() {
    localStorage.removeItem("demo-authenticated")
    router.replace("/login")
  }

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role} ${user.status}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  )

  if (!authorized) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8">
        <div>
          <Link
            href="/dashboard"
            className="mb-1 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <FiArrowLeft size={13} />
            Back to overview
          </Link>
          <h1 className="font-semibold">Users</h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Manage users
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit, search, and manage workspace users.
            </p>
          </div>

          <Button onClick={openAddForm}>
            <FiPlus className="mr-2" size={17} />
            Add user
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Total users</p>
                <p className="mt-2 text-2xl font-semibold">{users.length}</p>
              </div>
              <FiUsers className="text-primary" size={22} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active users</p>
              <p className="mt-2 text-2xl font-semibold">
                {users.filter((user) => user.status === "Active").length}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Inactive users</p>
              <p className="mt-2 text-2xl font-semibold">
                {users.filter((user) => user.status === "Inactive").length}
              </p>
            </CardContent>
          </Card>
        </section>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>User directory</CardTitle>
            <CardDescription>
              Search the directory or manage individual users.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={17}
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, role, or status..."
                className="pl-10"
                aria-label="Search users"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-4 py-4">{user.role}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.status === "Active"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Edit ${user.name}`}
                            onClick={() => openEditForm(user)}
                          >
                            <FiEdit2 size={15} />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Delete ${user.name}`}
                            onClick={() => deleteUser(user)}
                          >
                            <FiTrash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No users found. Try another search or add a user.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <Card className="w-full max-w-lg rounded-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>
                  {editingId !== null ? "Edit user" : "Add user"}
                </CardTitle>
                <CardDescription className="mt-1">
                  Enter the user's details below.
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                <FiX size={18} />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full name</Label>
                  <Input
                    id="user-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">Email address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  <select
                    id="user-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-status">Status</Label>
                  <select
                    id="user-status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as UserStatus)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {formError && (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId !== null ? "Save changes" : "Add user"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}