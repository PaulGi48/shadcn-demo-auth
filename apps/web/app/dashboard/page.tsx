
"use client"

import Link from "next/link"
import {
  FiActivity,
  FiArrowDownLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCreditCard,
  FiUsers,
} from "react-icons/fi"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { useUsersStore } from "@/stores/users-store"
import { useTransactionsStore } from "@/stores/transactions-store"
import { useActivityStore } from "@/stores/activity-store"

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function getMonthlyData(
  transactions: {
    date: string
    amount: number
    type: "Credit" | "Debit"
  }[]
) {
  const now = new Date()

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 5 + index,
      1
    )

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleString("en-NG", { month: "short" }),
      transactions: 0,
      credits: 0,
      debits: 0,
    }
  })

  const monthMap = new Map(
    months.map((month) => [month.key, month])
  )

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)

    if (Number.isNaN(date.getTime())) return

    const key = `${date.getFullYear()}-${date.getMonth()}`
    const month = monthMap.get(key)

    if (!month) return

    month.transactions += 1

    if (transaction.type === "Credit") {
      month.credits += transaction.amount
    } else {
      month.debits += transaction.amount
    }
  })

  return months
}

export default function DashboardPage() {
  const users = useUsersStore((state) => state.users)
  const usersHydrated = useUsersStore(
    (state) => state.hasHydrated
  )

  const transactions = useTransactionsStore(
    (state) => state.transactions
  )
  const transactionsHydrated = useTransactionsStore(
    (state) => state.hasHydrated
  )

  const activities = useActivityStore(
    (state) => state.activities
  )
  const activitiesHydrated = useActivityStore(
    (state) => state.hasHydrated
  )

  const isReady =
    usersHydrated &&
    transactionsHydrated &&
    activitiesHydrated

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length

  const completedTransactions = transactions.filter(
    (transaction) => transaction.status === "Completed"
  )

  const pendingTransactions = transactions.filter(
    (transaction) => transaction.status === "Pending"
  )

  const failedTransactions = transactions.filter(
    (transaction) => transaction.status === "Failed"
  )

  const completedCredits = completedTransactions
    .filter((transaction) => transaction.type === "Credit")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const completedDebits = completedTransactions
    .filter((transaction) => transaction.type === "Debit")
    .reduce((total, transaction) => total + transaction.amount, 0)

  const chartData = getMonthlyData(transactions)

  const stats = [
    {
      title: "Total users",
      value: users.length.toLocaleString("en-NG"),
      description: `${activeUsers} active users`,
      icon: FiUsers,
    },
    {
      title: "Completed credits",
      value: naira.format(completedCredits),
      description: "Successful incoming transactions",
      icon: FiArrowDownLeft,
    },
    {
      title: "Completed debits",
      value: naira.format(completedDebits),
      description: "Successful outgoing transactions",
      icon: FiArrowUpRight,
    },
    {
      title: "Total transactions",
      value: transactions.length.toLocaleString("en-NG"),
      description: `${completedTransactions.length} completed`,
      icon: FiCreditCard,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      {/* Page heading */}
      <section>
        <p className="text-sm text-muted-foreground">
          Your workspace
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Welcome back!
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Here is an overview of your workspace.
        </p>
      </section>

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>
                  {stat.title}
                </CardDescription>

                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
              </CardHeader>

              <CardContent>
                <CardTitle className="text-2xl font-semibold">
                  {isReady ? stat.value : "—"}
                </CardTitle>

                <p className="mt-2 text-xs text-muted-foreground">
                  {isReady
                    ? stat.description
                    : "Loading saved data..."}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Transaction count chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
          <CardDescription>
            Number of recorded transactions over the last six months.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <FiCreditCard
                size={28}
                className="mb-3 text-muted-foreground"
              />
              <p className="font-medium">
                No transactions recorded yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add transactions to see your chart.
              </p>
              <Link
                href="/dashboard/transactions"
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Go to transactions
              </Link>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 12,
                    left: -15,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value) => [
                      value ?? 0,
                      "Transactions",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--primary)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credit and debit chart */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Credits vs. Debits</CardTitle>
          <CardDescription>
            Recorded incoming and outgoing transaction amounts by month.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Loading transaction amounts...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Transaction data will appear here when available.
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 12,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-NG", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(Number(value))
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value) => [
                      naira.format(Number(value ?? 0)),
                    ]}
                  />

                  <Bar
                    dataKey="credits"
                    name="Credits"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="debits"
                    name="Debits"
                    fill="var(--muted-foreground)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction status summary */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">
              {isReady ? completedTransactions.length : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">
              {isReady ? pendingTransactions.length : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl">
              {isReady ? failedTransactions.length : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Unsuccessful transactions
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Recent logins and workspace changes.
            </CardDescription>
          </div>

          <FiActivity
            size={20}
            className="text-muted-foreground"
          />
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Loading activity...
            </p>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiActivity size={22} />
              </div>

              <p className="font-medium">No recent activity</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Logins and workspace changes will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.slice(0, 10).map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FiActivity size={15} />
                    </div>

                    <p className="text-sm font-medium">
                      {activity.message}
                    </p>
                  </div>

                  <time
                    className="pl-11 text-xs text-muted-foreground sm:pl-0 sm:text-right"
                    dateTime={new Date(
                      activity.timestamp
                    ).toISOString()}
                  >
                    {formatTimestamp(activity.timestamp)}
                  </time>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 border-t pt-4">
            <Link
              href="/dashboard/transactions"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View transactions
              <FiArrowRight size={15} />
            </Link>
          </div>
        </CardContent>
      </Card>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground">
        <p>Workspace Dashboard</p>

        <Link
          href="/dashboard/profile"
          className="transition-colors hover:text-foreground"
        >
          Edit profile
        </Link>
      </footer>
    </div>
  )
}