
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FiActivity,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUsers,
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

const stats = [
  { title: "Total users", value: "1,284", icon: FiUsers },
  { title: "Revenue", value: "₦842,500", icon: FiCreditCard },
  { title: "Active sessions", value: "326", icon: FiActivity },
]

const navigation = [
  { label: "Overview", href: "/dashboard", icon: FiHome },
  { label: "Users", href: "/dashboard/users", icon: FiUsers },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: FiCreditCard,
  },
  {
    label: "Profile Settings",
    href: "/dashboard/profile",
    icon: FiSettings,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()

  const [authorized, setAuthorized] = React.useState(false)
  const [profileName, setProfileName] = React.useState("Admin")
  const [profilePicture, setProfilePicture] = React.useState("")

  const currentPage =
    navigation.find((item) => item.href === pathname) ?? navigation[0]

  React.useEffect(() => {
    if (localStorage.getItem("demo-authenticated") !== "true") {
      router.replace("/login")
      return
    }

    setProfileName(localStorage.getItem("demo-profile-name") || "Admin")
    setProfilePicture(
      localStorage.getItem("demo-profile-picture") || ""
    )
    setAuthorized(true)
  }, [router])

  function logout() {
    localStorage.removeItem("demo-authenticated")
    router.replace("/login")
  }

  if (!authorized) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading dashboard...
        </p>
      </main>
    )
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card p-5 md:flex">
        <Link href="/dashboard" className="mb-10 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FiActivity size={20} />
          </div>
          <span className="text-lg font-semibold">Workspace</span>
        </Link>

        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = item.href === pathname

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mb-4 flex items-center gap-3 rounded-xl border p-3">
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <FiUsers size={17} className="text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profileName}</p>
            <p className="text-xs text-muted-foreground">Demo account</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <FiLogOut className="mr-2" />
          Log out
        </Button>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b px-5 sm:px-8">
          <div>
            <p className="text-sm text-muted-foreground">Workspace</p>
            <h1 className="font-semibold">{currentPage.label}</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/dashboard/profile"
              aria-label="Profile settings"
              className="flex size-9 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-medium"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="size-full object-cover"
                />
              ) : (
                profileName.charAt(0).toUpperCase()
              )}
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={logout}
            >
              <FiLogOut className="mr-2" />
              Log out
            </Button>
          </div>
        </header>

        <div className="space-y-8 p-5 sm:p-8">
          <section>
            <p className="text-sm text-muted-foreground">Your workspace</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Welcome back, {profileName}!
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
                      Demo data
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </section>

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
                <p className="font-medium">No recent activity</p>
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
      </main>
    </div>
  )
}