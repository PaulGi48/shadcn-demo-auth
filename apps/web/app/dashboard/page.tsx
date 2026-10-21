
"use client"

import Link from "next/link"
import {
  FiActivity,
  FiCreditCard,
  FiUsers,
} from "react-icons/fi"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const stats = [
  { title: "Total users", value: "1,284", icon: FiUsers },
  { title: "Revenue", value: "₦842,500", icon: FiCreditCard },
  { title: "Active sessions", value: "326", icon: FiActivity },
]

const transactionChartData = [
  { month: "May", transactions: 120 },
  { month: "Jun", transactions: 185 },
  { month: "Jul", transactions: 160 },
  { month: "Aug", transactions: 240 },
  { month: "Sep", transactions: 210 },
  { month: "Oct", transactions: 310 },
]

export default function DashboardPage() {
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

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>
                  {stat.title}
                </CardDescription>

                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
              </CardHeader>

              <CardContent>
                <CardTitle className="text-2xl font-semibold">
                  {stat.value}
                </CardTitle>

                <p className="mt-2 text-xs text-muted-foreground">
                  Demo data
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      {/* Transaction graph */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Transaction Overview</CardTitle>
          <CardDescription>
            Monthly transaction volume
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={transactionChartData}
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
                    value,
                    "Transactions",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--primary)",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Your latest workspace updates will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiActivity size={22} />
            </div>

            <p className="font-medium">
              No recent activity
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Activity will appear here as your workspace is used.
            </p>
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