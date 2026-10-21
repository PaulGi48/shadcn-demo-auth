
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiZap,
} from "react-icons/fi"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ThemeToggle } from "@workspace/ui/components/theme-toggle"
import { useActivityStore } from "@/stores/activity-store"

const QUICK_LOGIN_DURATION = 5 * 60 * 1000

const AUTH_KEY = "demo-authenticated"
const EMAIL_KEY = "demo-last-login-email"
const TIME_KEY = "demo-last-login-time"

const DEMO_EMAIL = "admin@example.com"
const DEMO_PASSWORD = "Password123!"

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_EMAIL,
      password: "",
    },
  })

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

  function finishLogin(email: string, isQuickLogin = false) {
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const normalizedEmail = email.trim().toLowerCase()

      localStorage.setItem(AUTH_KEY, "true")
      localStorage.setItem(EMAIL_KEY, normalizedEmail)
      localStorage.setItem(TIME_KEY, String(Date.now()))

      addActivity({
        type: "login",
        message: `${isQuickLogin ? "Quick login" : "Successful login"}: ${normalizedEmail}.`,
      })

      router.push("/dashboard")
    } catch {
      setLoginError("Unable to complete login. Please try again.")
      setIsLoggingIn(false)
    }
  }

  function onSubmit(values: LoginFormValues) {
    const email = values.email.trim().toLowerCase()

    if (
      email !== DEMO_EMAIL &&
      email !== "admin@example.com"
    ) {
      setLoginError("Invalid email or password.")
      return
    }

    if (values.password !== DEMO_PASSWORD) {
      setLoginError("Invalid email or password.")
      return
    }

    finishLogin(email)
  }

  function handleQuickLogin() {
    const email = localStorage.getItem(EMAIL_KEY)
    const loginTime = Number(localStorage.getItem(TIME_KEY) || 0)

    if (!email || !loginTime) {
      setLoginError("Quick login is unavailable. Please sign in normally.")
      return
    }

    const elapsed = Date.now() - loginTime

    if (elapsed >= QUICK_LOGIN_DURATION) {
      setQuickLoginRemaining(0)
      setLoginError("Quick login has expired. Please sign in normally.")
      return
    }

    finishLogin(email, true)
  }

  const quickLoginAvailable = quickLoginRemaining > 0

  function formatRemaining(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
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

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
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
                  placeholder="admin@example.com"
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
              <p role="alert" className="text-sm text-destructive">
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
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
        </div>

        <div className="rounded-xl border border-dashed p-4 text-sm">
          <p className="font-medium">Demo credentials</p>
          <p className="mt-2 text-muted-foreground">
            Email: {DEMO_EMAIL}
          </p>
          <p className="text-muted-foreground">
            Password: {DEMO_PASSWORD}
          </p>
          <Button
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