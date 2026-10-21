
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [authorized, setAuthorized] = React.useState(false)
  const [profileName, setProfileName] = React.useState("Admin")
  const [profilePicture, setProfilePicture] = React.useState("")

  React.useEffect(() => {
    function checkAuthentication() {
      if (localStorage.getItem("demo-authenticated") !== "true") {
        router.replace("/login")
        return
      }

      setProfileName(
        localStorage.getItem("demo-profile-name") || "Admin"
      )
      setProfilePicture(
        localStorage.getItem("demo-profile-picture") || ""
      )
      setAuthorized(true)
    }

    checkAuthentication()

    window.addEventListener("focus", checkAuthentication)

    return () => {
      window.removeEventListener("focus", checkAuthentication)
    }
  }, [router])

  function logout() {
    localStorage.removeItem("demo-authenticated")
    router.replace("/login")
  }

  const currentPage =
    navigation.find((item) => item.href === pathname) ??
    (pathname.startsWith("/dashboard/profile")
      ? navigation[3]
      : navigation[0])

  if (!authorized) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          Loading workspace...
        </p>
      </main>
    )
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card p-5 md:flex">
        <Link
          href="/dashboard"
          className="mb-10 flex items-center gap-3"
        >
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
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`)

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
              <span className="text-sm font-medium">
                {profileName.charAt(0).toUpperCase()}
              </span>
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

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-5 sm:px-8">
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

        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  )
}