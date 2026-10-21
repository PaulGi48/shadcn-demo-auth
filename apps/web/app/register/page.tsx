"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
} from "react-icons/fi";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUsersStore } from "@/stores/users-store";

const ACCOUNTS_KEY = "demo-registered-accounts";

type RegisteredAccount = {
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

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
      .min(8, "Password must contain at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegistrationValues = z.infer<typeof registrationSchema>;

function readAccounts(): RegisteredAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (account): account is RegisteredAccount =>
        typeof account?.name === "string" &&
        typeof account?.email === "string" &&
        typeof account?.password === "string"
    );
  } catch {
    return [];
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const users = useUsersStore((state) => state.users);
  const addUser = useUsersStore((state) => state.addUser);
  const hasHydrated = useUsersStore((state) => state.hasHydrated);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Sync accounts registered before this fix into User Management.
  useEffect(() => {
    if (!hasHydrated) return;

    const registeredAccounts = readAccounts();

    registeredAccounts.forEach((account) => {
      const email = account.email.trim().toLowerCase();

      const alreadyInUsers = useUsersStore
        .getState()
        .users.some(
          (user) => user.email.trim().toLowerCase() === email
        );

      if (!alreadyInUsers) {
        addUser({
          name: account.name.trim(),
          email,
          role: "Viewer",
          status: "Active",
        });
      }
    });
  }, [hasHydrated, addUser]);

  const onSubmit = async (values: RegistrationValues) => {
    setRegistrationError("");

    const name = values.name.trim();
    const email = values.email.trim().toLowerCase();

    if (!hasHydrated) {
      setRegistrationError("Please wait for the user data to load.");
      return;
    }

    if (email === "admin@example.com") {
      setError("email", {
        type: "manual",
        message: "This email is reserved for the demo administrator.",
      });
      return;
    }

    // Check existing login accounts.
    const registeredAccounts = readAccounts();

    if (
      registeredAccounts.some(
        (account) => account.email.trim().toLowerCase() === email
      )
    ) {
      setError("email", {
        type: "manual",
        message: "An account with this email already exists.",
      });
      return;
    }

    // Also check the User Management store.
    const emailExists = users.some(
      (user) => user.email.trim().toLowerCase() === email
    );

    if (emailExists) {
      setError("email", {
        type: "manual",
        message: "This email already exists in User Management.",
      });
      return;
    }

    const newAccount: RegisteredAccount = {
      name,
      email,
      password: values.password,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save credentials for the existing demo login page.
      localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify([...registeredAccounts, newAccount])
      );

      // Add the same person to User Management.
      addUser({
        name,
        email,
        role: "Viewer",
        status: "Active",
      });

      router.push(`/login?registered=${encodeURIComponent(email)}`);
    } catch {
      setRegistrationError(
        "Registration could not be saved. Please check your browser storage and try again."
      );
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiUserPlus size={24} />
          </div>

          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>

          <CardDescription>
            Register to access the dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="pl-10"
                  autoComplete="name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-10"
                  autoComplete="new-password"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {registrationError && (
              <p className="text-sm text-destructive">
                {registrationError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !hasHydrated}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}