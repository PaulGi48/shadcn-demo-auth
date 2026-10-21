
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  FiArrowRight,
  FiClock,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
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

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginValues = z.infer<typeof loginSchema>

const QUICK_LOGIN_DURATION = 30 * 1000

const LAST_LOGIN_EMAIL_KEY = "demo-last-login-email"
const LAST_LOGIN_TIME_KEY = "demo-last-login-time"

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState(false)
  const [now, setNow] = React.useState(0)
  const [lastLoginEmail, setLastLoginEmail] = React.useState("")
  const [lastLoginAt, setLastLoginAt] = React.useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  React.useEffect(() => {
    function loadLastLogin() {
      const email = localStorage.getItem(LAST_LOGIN_EMAIL_KEY) ?? ""
      const storedTime = Number(
        localStorage.getItem(LAST_LOGIN_TIME_KEY)
      )

      if (
        !email ||
        !Number.isFinite(storedTime) ||
        storedTime <= 0 ||
        Date.now() - storedTime >= QUICK_LOGIN_DURATION
      ) {
        localStorage.removeItem(LAST_LOGIN_EMAIL_KEY)
        localStorage.removeItem(LAST_LOGIN_TIME_KEY)
        setLastLoginEmail("")
        setLastLoginAt(null)
      } else {
        setLastLoginEmail(email)
        setLastLoginAt(storedTime)
      }

      setNow(Date.now())
    }

    loadLastLogin()

    const interval = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)

      const storedTime = Number(
        localStorage.getItem(LAST_LOGIN_TIME_KEY)
      )

      if (
        storedTime > 0 &&
        currentTime - storedTime >= QUICK_LOGIN_DURATION
      ) {
        localStorage.removeItem(LAST_LOGIN_EMAIL_KEY)
        localStorage.removeItem(LAST_LOGIN_TIME_KEY)
        setLastLoginEmail("")
        setLastLoginAt(null)
      }
    }, 1000)

    window.addEventListener("focus", loadLastLogin)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", loadLastLogin)
    }
  }, [])

  const elapsed =
    lastLoginAt !== null && now > 0
      ? now - lastLoginAt
      : 0

  const remaining = Math.max(0, QUICK_LOGIN_DURATION - elapsed)

  const quickLoginReady =
    Boolean(lastLoginEmail) &&
    lastLoginAt !== null &&
    now > 0 &&
    elapsed >= 0 &&
    elapsed < QUICK_LOGIN_DURATION

  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  function onSubmit(values: LoginValues) {
    clearErrors()

    const result = loginSchema.safeParse(values)

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]

        if (field === "email" || field === "password") {
          setError(field, {
            type: "validation",
            message: issue.message,
          })
        }
      }

      return
    }

    if (
      result.data.email.toLowerCase() !== "admin@example.com" ||
      result.data.password !== "Password123!"
    ) {
      setError("root", {
        type: "manual",
        message: "Incorrect email or password.",
      })
      return
    }

    const email = result.data.email.toLowerCase()
    const timestamp = Date.now()

    localStorage.setItem("demo-authenticated", "true")
    localStorage.setItem(LAST_LOGIN_EMAIL_KEY, email)
    localStorage.setItem(LAST_LOGIN_TIME_KEY, String(timestamp))

    router.replace("/dashboard")
  }

  function handleQuickLogin() {
    if (!quickLoginReady || !lastLoginAt || !lastLoginEmail) {
      return
    }

    const currentTime = Date.now()

    if (currentTime - lastLoginAt >= QUICK_LOGIN_DURATION) {
      localStorage.removeItem(LAST_LOGIN_EMAIL_KEY)
      localStorage.removeItem(LAST_LOGIN_TIME_KEY)
      setLastLoginEmail("")
      setLastLoginAt(null)
      setNow(currentTime)
      return
    }

    localStorage.setItem("demo-authenticated", "true")
    router.replace("/dashboard")
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FiLock size={22} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your account.
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="gap-1">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password below.
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
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                  />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    className="h-11 rounded-xl pl-10"
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={Boolean(errors.password)}
                    className="h-11 rounded-xl pr-11"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl"
                disabled={isSubmitting}
              >
                Continue
                <FiArrowRight className="ml-2" size={17} />
              </Button>
            </form>
          </CardContent>
        </Card>

        {lastLoginEmail && (
          <Card className="mt-4 rounded-2xl border-primary/20 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {quickLoginReady ? (
                  <FiZap size={19} />
                ) : (
                  <FiClock size={19} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Last login</p>

                <p className="truncate text-xs text-muted-foreground">
                  {lastLoginEmail}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {quickLoginReady
                    ? `Quick login expires in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
                    : "Quick login has expired. Sign in again."}
                </p>
              </div>

              <Button
                size="sm"
                variant={quickLoginReady ? "default" : "outline"}
                disabled={!quickLoginReady}
                onClick={handleQuickLogin}
              >
                Quick login
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo email: admin@example.com
          <br />
          Demo password: Password123!
        </p>
      </div>
    </main>
  )
}