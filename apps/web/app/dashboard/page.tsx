
"use client"

import Link from "next/link"
import {
  FiActivity,
  FiCreditCard,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi"
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

function getMonthlyTransactionData(
  transactions: { date: string }[]
) {
  const now = new Date()
  const months: { key: string; month: string; transactions: number }[] = []

  for (let offset = 5; offset >= 0; offset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)

    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleString("en-NG", { month: "short" }),
      transactions: 0,
    })
  }

  const counts = new Map(
    months.map((month) => [month.key, month])
  )

  for (const transaction of transactions) {
    const date = new Date(transaction.date)

    if (Number.isNaN(date.getTime())) continue

    const key = `${date.getFullYear()}-${date.getMonth()}`
    const month = counts.get(key)

    if (month) month.transactions += 1
  }

  return months.map(({ month, transactions }) => ({
    month,
    transactions,
  }))
}

export default function DashboardPage() {
  const users = useUsersStore((state) => state.users)
  const usersHydrated = useUsersStore((state) => state.hasHydrated)

  const transactions = useTransactionsStore(
    (state) => state.transactions
  )
  const transactionsHydrated = useTransactionsStore(
    (state) => state.hasHydrated
  )

  const activities = useActivityStore((state) => state.activities)
  const activitiesHydrated = useActivityStore(
    (state) => state.hasHydrated
  )

  const isReady =
    usersHydrated && transactionsHydrated && activitiesHydrated

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length

  const completedCredits = transactions
    .filter(
      (transaction) =>
        transaction.status === "Completed" &&
        transaction.type === "Credit"
    )
    .reduce((total, transaction) => total + transaction.amount, 0)

  const chartData = getMonthlyTransactionData(transactions)

  const stats = [
    {
      title: "Total users",
      value: isReady ? users.length.toLocaleString("en-NG") : "—",
      description: `${activeUsers} active users`,
      icon: FiUsers,
    },
    {
      title: "Completed credits",
      value: isReady ? naira.format(completedCredits) : "—",
      description: "From completed credit transactions",
      icon: FiCreditCard,
    },
    {
      title: "Total transactions",
      value: isReady ? transactions.length.toLocaleString("en-NG") : "—",
      description: "All recorded transactions",
      icon: FiActivity,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.title}</CardDescription>

                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
              </CardHeader>

              <CardContent>
                <CardTitle className="text-2xl font-semibold">
                  {stat.value}
                </CardTitle>

                <p className="mt-2 text-xs text-muted-foreground">
                  {isReady ? stat.description : "Loading saved data..."}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
          <CardDescription>
            Monthly transaction volume based on recorded transactions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isReady ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <FiCreditCard size={28} className="mb-3 text-muted-foreground" />
              <p className="font-medium">No transactions recorded yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add transactions to see your monthly graph.
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
                    formatter={(value) => [value, "Transactions"]}
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

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Recent logins and workspace changes.
            </CardDescription>
          </div>

          <FiActivity size={20} className="text-muted-foreground" />
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
                    dateTime={new Date(activity.timestamp).toISOString()}
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