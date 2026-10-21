
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
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

const ACCOUNTS_KEY = "demo-registered-accounts"

const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(60, "Name must not exceed 60 characters."),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type RegistrationValues = z.infer<typeof registrationSchema>

type RegisteredAccount = {
  name: string
  email: string
  password: string
  createdAt: string
}

function readAccounts(): RegisteredAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY)

    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)

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

export default function RegisterPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState(false)
  const [formError, setFormError] = React.useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: RegistrationValues) {
    setFormError("")

    const email = values.email.trim().toLowerCase()

    try {
      const accounts = readAccounts()

      if (email === "admin@example.com") {
        setFormError(
          "This email is reserved for the demo administrator."
        )
        return
      }

      if (accounts.some((account) => account.email === email)) {
        setFormError(
          "An account with this email already exists. Please sign in."
        )
        return
      }

      const account: RegisteredAccount = {
        name: values.name.trim(),
        email,
        password: values.password,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify([...accounts, account])
      )

      router.push(
        `/login?registered=${encodeURIComponent(email)}`
      )
    } catch {
      setFormError(
        "Unable to create your account. Please try again."
      )
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FiUser size={23} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Register to access your workspace.
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              Registration
            </CardTitle>

            <CardDescription>
              Enter your details to create your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>

                <div className="relative">
                  <FiUser
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden="true"
                  />

                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Your full name"
                    className="h-11 rounded-xl pl-10"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                </div>

                {errors.name && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>

                <div className="relative">
                  <FiMail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden="true"
                  />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-xl pl-10"
                    aria-invalid={Boolean(errors.email)}
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
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden="true"
                  />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl pl-10 pr-11"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm password
                </Label>

                <div className="relative">
                  <FiLock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={17}
                    aria-hidden="true"
                  />

                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="h-11 rounded-xl pl-10 pr-11"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl"
                disabled={isSubmitting}
              >
                Create account
                <FiArrowRight className="ml-2" size={17} />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}