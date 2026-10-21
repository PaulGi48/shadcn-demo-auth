
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  FiActivity,
  FiChevronDown,
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
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false)

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
    window.addEventListener("profile-updated", checkAuthentication)

    return () => {
      window.removeEventListener("focus", checkAuthentication)
      window.removeEventListener("profile-updated", checkAuthentication)
    }
  }, [router])

  React.useEffect(() => {
    function closeMenuOnOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-profile-menu]")
      ) {
        setProfileMenuOpen(false)
      }
    }

    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener("click", closeMenuOnOutsideClick)
    document.addEventListener("keydown", closeMenuOnEscape)

    return () => {
      document.removeEventListener("click", closeMenuOnOutsideClick)
      document.removeEventListener("keydown", closeMenuOnEscape)
    }
  }, [])

  function logout() {
    localStorage.removeItem("demo-authenticated")
    setProfileMenuOpen(false)
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
      {/* Sidebar */}
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
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Workspace</p>
            <h1 className="truncate text-sm font-semibold sm:text-base">
              {currentPage.label}
            </h1>
          </div>

          {/* Top-right controls */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <div
              className="relative"
              data-profile-menu
            >
              <button
                type="button"
                aria-label="Open profile menu"
                aria-expanded={profileMenuOpen}
                onClick={() =>
                  setProfileMenuOpen((open) => !open)
                }
                className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted sm:gap-3 sm:px-2"
              >
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-medium">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    profileName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-32 truncate text-sm font-medium">
                    {profileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Demo account
                  </p>
                </div>

                <FiChevronDown
                  size={15}
                  className="hidden text-muted-foreground sm:block"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-card p-1.5 shadow-lg">
                  <div className="border-b px-3 py-2">
                    <p className="truncate text-sm font-medium">
                      {profileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Demo account
                    </p>
                  </div>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <FiSettings size={16} />
                    Profile Settings
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-muted"
                  >
                    <FiLogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <nav className="flex gap-2 overflow-x-auto border-b px-4 py-2 md:hidden">
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
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </main>
    </div>
  )
}