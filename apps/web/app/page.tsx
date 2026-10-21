"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FiLock } from "react-icons/fi"

import { ThemeToggle } from "@/components/theme-toggle"
import { Spinner } from "@workspace/ui/components/spinner"

export default function Page() {
  const router = useRouter()

  React.useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-background px-6 text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <FiLock size={25} />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting to login...
        </p>

        <Spinner
          className="mt-8 size-6 text-primary"
          role="status"
          aria-label="Loading"
        />
      </div>
    </main>
  )
}