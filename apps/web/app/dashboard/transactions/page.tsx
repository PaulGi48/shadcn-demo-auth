
"use client"

import * as React from "react"
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
  FiEye,
  FiSearch,
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

type TransactionStatus = "Completed" | "Pending" | "Failed"
type TransactionType = "Credit" | "Debit"

type Transaction = {
  id: string
  customer: string
  email: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  date: string
  description: string
}

const STORAGE_KEY = "demo-dashboard-transactions"

const initialTransactions: Transaction[] = [
  {
    id: "TXN-1001",
    customer: "Amara Okafor",
    email: "amara@example.com",
    type: "Credit",
    amount: 125000,
    status: "Completed",
    date: "2026-10-20T10:30:00",
    description: "Account funding",
  },
  {
    id: "TXN-1002",
    customer: "Daniel Adeyemi",
    email: "daniel@example.com",
    type: "Debit",
    amount: 45000,
    status: "Completed",
    date: "2026-10-20T09:15:00",
    description: "Service payment",
  },
  {
    id: "TXN-1003",
    customer: "Zara Ibrahim",
    email: "zara@example.com",
    type: "Credit",
    amount: 78000,
    status: "Pending",
    date: "2026-10-19T14:20:00",
    description: "Bank transfer",
  },
  {
    id: "TXN-1004",
    customer: "David Eze",
    email: "david@example.com",
    type: "Debit",
    amount: 22500,
    status: "Failed",
    date: "2026-10-19T11:05:00",
    description: "Subscription payment",
  },
  {
    id: "TXN-1005",
    customer: "Tomiwa Bello",
    email: "tomiwa@example.com",
    type: "Credit",
    amount: 210000,
    status: "Completed",
    date: "2026-10-18T16:45:00",
    description: "Account funding",
  },
  {
    id: "TXN-1006",
    customer: "Ngozi James",
    email: "ngozi@example.com",
    type: "Debit",
    amount: 18500,
    status: "Pending",
    date: "2026-10-18T12:10:00",
    description: "Service payment",
  },
]

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
})

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed: unknown = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          setTransactions(parsed as Transaction[])
          return
        }
      }

      setTransactions(initialTransactions)
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialTransactions)
      )
    } catch {
      setTransactions(initialTransactions)
    }
  }, [])

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

        <Button variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Total transactions
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {transactions.length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="mt-2 text-2xl font-semibold">
              {completedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="mt-2 text-2xl font-semibold">
              {pendingCount}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Completed credits
            </p>
            <p className="mt-2 text-xl font-semibold">
              {naira.format(totalCredits)}
            </p>
          </CardContent>
        </Card>
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
                  <th className="px-4 py-3 text-right font-medium">
                    Details
                  </th>
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
                          <FiArrowDownLeft
                            className="text-primary"
                            size={16}
                          />
                        ) : (
                          <FiArrowUpRight
                            className="text-muted-foreground"
                            size={16}
                          />
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

                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`View ${transaction.id}`}
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <FiEye size={15} />
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
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

      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <Card
            className="w-full max-w-md rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Transaction details</CardTitle>
                <CardDescription className="mt-1">
                  {selectedTransaction.id}
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="sm"
                aria-label="Close transaction details"
                onClick={() => setSelectedTransaction(null)}
              >
                <FiX size={18} />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-1 text-2xl font-semibold">
                  {naira.format(selectedTransaction.amount)}
                </p>
              </div>

              {[
                ["Customer", selectedTransaction.customer],
                ["Email", selectedTransaction.email],
                ["Type", selectedTransaction.type],
                ["Status", selectedTransaction.status],
                ["Description", selectedTransaction.description],
                ["Date", formatDate(selectedTransaction.date)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b pb-3 text-sm last:border-0"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{value}</span>
                </div>
              ))}

              <Button
                className="w-full"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}