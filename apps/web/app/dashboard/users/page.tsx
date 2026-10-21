
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi"

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

import {
  useUsersStore,
  type UserRecord,
  type UserRole,
  type UserStatus,
} from "@/stores/users-store"
import { useActivityStore } from "@/stores/activity-store"

const userSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["Administrator", "Editor", "Viewer"]),
  status: z.enum(["Active", "Inactive"]),
})

type UserFormValues = z.infer<typeof userSchema>

export default function UsersPage() {
  const users = useUsersStore((state) => state.users)
  const hasHydrated = useUsersStore((state) => state.hasHydrated)
  const addUser = useUsersStore((state) => state.addUser)
  const updateUser = useUsersStore((state) => state.updateUser)
  const deleteUserFromStore = useUsersStore((state) => state.deleteUser)
  const addActivity = useActivityStore((state) => state.addActivity)

  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [formError, setFormError] = React.useState("")

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Viewer",
      status: "Active",
    },
  })

  function openAddForm() {
    setEditingId(null)
    setFormError("")
    clearErrors()
    reset({
      name: "",
      email: "",
      role: "Viewer",
      status: "Active",
    })
    setShowForm(true)
  }

  function openEditForm(user: UserRecord) {
    setEditingId(user.id)
    setFormError("")
    clearErrors()
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormError("")
    clearErrors()
    reset()
  }

  async function onSubmit(values: UserFormValues) {
    setFormError("")
    clearErrors()

    const cleanEmail = values.email.trim().toLowerCase()

    const emailIsUsed = users.some(
      (user) =>
        user.email.toLowerCase() === cleanEmail &&
        user.id !== editingId
    )

    if (emailIsUsed) {
      setError("email", {
        type: "manual",
        message: "A user with this email already exists.",
      })
      return
    }

    const userData = {
      name: values.name.trim(),
      email: cleanEmail,
      role: values.role as UserRole,
      status: values.status as UserStatus,
    }

    try {
      if (editingId !== null) {
        updateUser(editingId, userData)

        addActivity({
          type: "user_updated",
          message: `Updated user ${userData.name}.`,
        })
      } else {
        addUser(userData)

        addActivity({
          type: "user_added",
          message: `Added user ${userData.name}.`,
        })
      }

      closeForm()
    } catch {
      setFormError("Unable to save changes. Please try again.")
    }
  }

  function handleDelete(user: UserRecord) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    )

    if (!confirmed) return

    deleteUserFromStore(user.id)

    addActivity({
      type: "user_deleted",
      message: `Deleted user ${user.name}.`,
    })
  }

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role} ${user.status}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  )

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <p className="text-sm text-muted-foreground">
          Loading users...
        </p>
      </div>
    )
  }

  return (
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
              <p className="text-sm text-muted-foreground">
                Total users
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {users.length}
              </p>
            </div>
            <FiUsers className="text-primary" size={22} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Active users
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {activeUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Inactive users
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {inactiveUsers}
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
                          onClick={() => handleDelete(user)}
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

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={closeForm}
        >
          <Card
            className="w-full max-w-lg rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
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
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Close form"
                onClick={closeForm}
              >
                <FiX size={18} />
              </Button>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full name</Label>
                  <Input
                    id="user-name"
                    placeholder="Enter full name"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email">Email address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="name@example.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Role</Label>
                  <select
                    id="user-role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("role")}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  {errors.role && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-status">Status</Label>
                  <select
                    id="user-status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("status")}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.status.message}
                    </p>
                  )}
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
                    onClick={closeForm}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editingId !== null
                        ? "Save changes"
                        : "Add user"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}