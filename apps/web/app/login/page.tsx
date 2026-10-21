
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiZap,
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

import { ThemeToggle } from "@/components/theme-toggle"
import { useActivityStore } from "@/stores/activity-store"

const QUICK_LOGIN_DURATION = 5 * 60 * 1000

const AUTH_KEY = "demo-authenticated"
const EMAIL_KEY = "demo-last-login-email"
const TIME_KEY = "demo-last-login-time"
const ACCOUNTS_KEY = "demo-registered-accounts"

const DEMO_EMAIL = "admin@example.com"
const DEMO_PASSWORD = "Password123!"

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginValues = z.infer<typeof loginSchema>

type RegisteredAccount = {
  name: string
  email: string
  password: string
  createdAt: string
}

function readAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (account): account is RegisteredAccount =>
        account !== null &&
        typeof account === "object" &&
        typeof account.name === "string" &&
        typeof account.email === "string" &&
        typeof account.password === "string" &&
        typeof account.createdAt === "string"
    )
  } catch {
    return []
  }
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const addActivity = useActivityStore((state) => state.addActivity)

  const [showPassword, setShowPassword] = React.useState(false)
  const [loginError, setLoginError] = React.useState("")
  const [quickLoginRemaining, setQuickLoginRemaining] = React.useState(0)
  const [isLoggingIn, setIsLoggingIn] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_EMAIL,
      password: "",
    },
  })

  React.useEffect(() => {
    const registeredEmail = searchParams.get("registered")

    if (registeredEmail) {
      setValue("email", registeredEmail)
      setLoginError("Account created. Please sign in.")
      return
    }

    const previousEmail = localStorage.getItem(EMAIL_KEY)
    if (previousEmail) setValue("email", previousEmail)
  }, [searchParams, setValue])

  React.useEffect(() => {
    function updateQuickLoginRemaining() {
      const email = localStorage.getItem(EMAIL_KEY)
      const loginTime = Number(localStorage.getItem(TIME_KEY) || 0)

      if (!email || !loginTime) {
        setQuickLoginRemaining(0)
        return
      }

      const remaining = Math.max(
        0,
        QUICK_LOGIN_DURATION - (Date.now() - loginTime)
      )

      setQuickLoginRemaining(Math.ceil(remaining / 1000))
    }

    updateQuickLoginRemaining()
    const interval = window.setInterval(updateQuickLoginRemaining, 1000)

    return () => window.clearInterval(interval)
  }, [])

  function finishLogin(email: string, name: string, isQuickLogin = false) {
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const normalizedEmail = email.trim().toLowerCase()

      localStorage.setItem(AUTH_KEY, "true")
      localStorage.setItem(EMAIL_KEY, normalizedEmail)

      // Preserve the original expiry when using quick login.
      if (!isQuickLogin) {
        localStorage.setItem(TIME_KEY, String(Date.now()))
      }

      localStorage.setItem("demo-profile-name", name)

      addActivity({
        type: "login",
        message: `${isQuickLogin ? "Quick login" : "Successful login"}: ${normalizedEmail}.`,
      })

      window.dispatchEvent(new Event("profile-updated"))
      router.replace("/dashboard")
    } catch {
      setLoginError("Unable to complete login. Please try again.")
      setIsLoggingIn(false)
    }
  }

  function onSubmit(values: LoginValues) {
    setLoginError("")

    const email = values.email.trim().toLowerCase()
    const password = values.password

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      finishLogin(email, "Admin")
      return
    }

    const account = readAccounts().find(
      (item) =>
        item.email.trim().toLowerCase() === email &&
        item.password === password
    )

    if (!account) {
      setLoginError("Invalid email or password.")
      return
    }

    finishLogin(account.email, account.name)
  }

  function handleQuickLogin() {
    const email = localStorage.getItem(EMAIL_KEY)
    const loginTime = Number(localStorage.getItem(TIME_KEY) || 0)

    if (!email || !loginTime) {
      setLoginError("Quick login is unavailable. Please sign in normally.")
      return
    }

    if (Date.now() - loginTime >= QUICK_LOGIN_DURATION) {
      setQuickLoginRemaining(0)
      setLoginError("Quick login has expired. Please sign in normally.")
      return
    }

    const account = email === DEMO_EMAIL
      ? { name: "Admin" }
      : readAccounts().find(
          (item) => item.email.toLowerCase() === email.toLowerCase()
        )

    if (!account) {
      setLoginError("Account not found. Please sign in normally.")
      return
    }

    finishLogin(email, account.name, true)
  }

  function formatRemaining(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
  }

  const quickLoginAvailable = quickLoginRemaining > 0

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FiShield size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your workspace dashboard.
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your account details below.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    className="h-11 rounded-xl pl-10"
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 rounded-xl pl-10 pr-11"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <p role="status" className="text-sm text-muted-foreground">
                  {loginError}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Signing in..." : "Sign in"}
                <FiArrowRight className="ml-2" size={17} />
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl"
              disabled={!quickLoginAvailable || isLoggingIn}
              onClick={handleQuickLogin}
            >
              <FiZap className="mr-2" size={17} />
              {quickLoginAvailable
                ? `Quick login (${formatRemaining(quickLoginRemaining)})`
                : "Quick login unavailable"}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Quick login is available for five minutes after a successful sign-in.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="rounded-xl border border-dashed p-4 text-sm">
          <p className="font-medium">Demo credentials</p>
          <p className="mt-2 text-muted-foreground">
            Email: {DEMO_EMAIL}
          </p>
          <p className="text-muted-foreground">
            Password: {DEMO_PASSWORD}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 px-0"
            onClick={() => {
              setValue("email", DEMO_EMAIL)
              setValue("password", DEMO_PASSWORD)
              setLoginError("")
            }}
          >
            Fill demo credentials
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading login...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}