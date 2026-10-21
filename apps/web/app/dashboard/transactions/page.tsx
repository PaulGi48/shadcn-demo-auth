
"use client"

import * as React from "react"
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiEye,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
  useTransactionsStore,
  type Transaction,
  type TransactionStatus,
  type TransactionType,
} from "@/stores/transactions-store"
import { useActivityStore } from "@/stores/activity-store"

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
})

const transactionSchema = z.object({
  customer: z.string().trim().min(2, "Enter the customer's name."),
  email: z.string().trim().email("Enter a valid email address."),
  type: z.enum(["Credit", "Debit"]),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  status: z.enum(["Completed", "Pending", "Failed"]),
  description: z.string().trim().min(2, "Enter a description."),
  date: z.string().min(1, "Select a transaction date."),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

function formatDate(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return "Invalid date"

  return parsed.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function toDateInputValue(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return ""

  const local = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000
  )

  return local.toISOString().slice(0, 16)
}

export default function TransactionsPage() {
  const transactions = useTransactionsStore((state) => state.transactions)
  const hasHydrated = useTransactionsStore((state) => state.hasHydrated)
  const addTransaction = useTransactionsStore((state) => state.addTransaction)
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction)
  const deleteTransaction = useTransactionsStore((state) => state.deleteTransaction)
  const addActivity = useActivityStore((state) => state.addActivity)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formError, setFormError] = React.useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customer: "",
      email: "",
      type: "Credit",
      amount: 0,
      status: "Pending",
      description: "",
      date: toDateInputValue(new Date().toISOString()),
    },
  })

  function openAddForm() {
    setEditingId(null)
    setFormError("")
    reset({
      customer: "",
      email: "",
      type: "Credit",
      amount: 0,
      status: "Pending",
      description: "",
      date: toDateInputValue(new Date().toISOString()),
    })
    setShowForm(true)
  }

  function openEditForm(transaction: Transaction) {
    setEditingId(transaction.id)
    setFormError("")
    reset({
      customer: transaction.customer,
      email: transaction.email,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      description: transaction.description,
      date: toDateInputValue(transaction.date),
    })
    setSelectedTransaction(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormError("")
  }

  function onSubmit(values: TransactionFormValues) {
    setFormError("")

    const cleanData = {
      customer: values.customer.trim(),
      email: values.email.trim().toLowerCase(),
      type: values.type as TransactionType,
      amount: Number(values.amount),
      status: values.status as TransactionStatus,
      description: values.description.trim(),
      date: new Date(values.date).toISOString(),
    }

    try {
      if (editingId) {
        updateTransaction(editingId, cleanData)
        addActivity({
          type: "transaction_updated",
          message: `Updated transaction ${editingId} for ${cleanData.customer}.`,
        })
      } else {
        const id = `TXN-${Date.now()}`
        addTransaction({ id, ...cleanData })
        addActivity({
          type: "transaction_added",
          message: `Added transaction ${id} for ${cleanData.customer}.`,
        })
      }

      closeForm()
    } catch {
      setFormError("Unable to save this transaction. Please try again.")
    }
  }

  function handleDelete(transaction: Transaction) {
    if (!window.confirm(`Delete transaction ${transaction.id}?`)) return

    deleteTransaction(transaction.id)
    setSelectedTransaction(null)

    addActivity({
      type: "transaction_deleted",
      message: `Deleted transaction ${transaction.id}.`,
    })
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = search.trim().toLowerCase()
    const matchesSearch =
      `${transaction.id} ${transaction.customer} ${transaction.email} ${transaction.description}`
        .toLowerCase()
        .includes(searchText)

    const matchesStatus =
      statusFilter === "All" || transaction.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const completedTransactions = transactions.filter(
    (transaction) => transaction.status === "Completed"
  )

  const totalCredits = completedTransactions
    .filter((transaction) => transaction.type === "Credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const totalDebits = completedTransactions
    .filter((transaction) => transaction.type === "Debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const completedCount = completedTransactions.length
  const pendingCount = transactions.filter(
    (transaction) => transaction.status === "Pending"
  ).length

  function exportCsv() {
    const headers = [
      "Transaction ID",
      "Customer",
      "Email",
      "Type",
      "Amount (NGN)",
      "Status",
      "Date",
      "Description",
    ]

    const rows = filteredTransactions.map((transaction) => [
      transaction.id,
      transaction.customer,
      transaction.email,
      transaction.type,
      transaction.amount,
      transaction.status,
      transaction.date,
      transaction.description,
    ])

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "workspace-transactions.csv"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <p className="text-sm text-muted-foreground">
          Loading transactions...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review payments, transfers, and transaction statuses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button onClick={openAddForm}>
            <FiPlus className="mr-2" size={16} />
            Add transaction
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total transactions", value: String(transactions.length) },
          { label: "Completed", value: String(completedCount) },
          { label: "Pending", value: String(pendingCount) },
          { label: "Completed credits", value: naira.format(totalCredits) },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>
            Search records, filter by status, and inspect transaction details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={17}
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ID, customer, or description..."
                className="pl-10"
                aria-label="Search transactions"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by transaction status"
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="All">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Transaction</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <p className="font-medium">{transaction.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {transaction.customer}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2">
                        {transaction.type === "Credit" ? (
                          <FiArrowDownLeft className="text-primary" size={16} />
                        ) : (
                          <FiArrowUpRight className="text-muted-foreground" size={16} />
                        )}
                        {transaction.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {naira.format(transaction.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          transaction.status === "Completed"
                            ? "bg-primary/10 text-primary"
                            : transaction.status === "Pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`View ${transaction.id}`}
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <FiEye size={15} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Edit ${transaction.id}`}
                          onClick={() => openEditForm(transaction)}
                        >
                          <FiEdit2 size={15} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Delete ${transaction.id}`}
                          onClick={() => handleDelete(transaction)}
                        >
                          <FiTrash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.length} transactions.
            Completed debits total {naira.format(totalDebits)}.
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
                <CardTitle>{editingId ? "Edit transaction" : "Add transaction"}</CardTitle>
                <CardDescription className="mt-1">
                  Enter the transaction details.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={closeForm} aria-label="Close form">
                <FiX size={18} />
              </Button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-customer">Customer</Label>
                  <Input id="transaction-customer" {...register("customer")} />
                  {errors.customer && <p className="text-sm text-destructive">{errors.customer.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction-email">Email</Label>
                  <Input id="transaction-email" type="email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-type">Type</Label>
                    <select id="transaction-type" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("type")}>
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-amount">Amount (₦)</Label>
                    <Input id="transaction-amount" type="number" min="0.01" step="0.01" {...register("amount")} />
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-status">Status</Label>
                    <select id="transaction-status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("status")}>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-date">Date</Label>
                    <Input id="transaction-date" type="datetime-local" {...register("date")} />
                    {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction-description">Description</Label>
                  <Input id="transaction-description" {...register("description")} />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingId ? "Save changes" : "Add transaction"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <Card className="w-full max-w-md rounded-2xl" onClick={(event) => event.stopPropagation()}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Transaction details</CardTitle>
                <CardDescription className="mt-1">{selectedTransaction.id}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" aria-label="Close details" onClick={() => setSelectedTransaction(null)}>
                <FiX size={18} />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-1 text-2xl font-semibold">{naira.format(selectedTransaction.amount)}</p>
              </div>

              {[
                ["Customer", selectedTransaction.customer],
                ["Email", selectedTransaction.email],
                ["Type", selectedTransaction.type],
                ["Status", selectedTransaction.status],
                ["Description", selectedTransaction.description],
                ["Date", formatDate(selectedTransaction.date)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b pb-3 text-sm last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}

              <Button className="w-full" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}