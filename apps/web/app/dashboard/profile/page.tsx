
"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  FiCamera,
  FiImage,
  FiMail,
  FiSave,
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

import { useActivityStore } from "@/stores/activity-store"

const PROFILE_NAME_KEY = "demo-profile-name"
const PROFILE_PICTURE_KEY = "demo-profile-picture"
const MAX_IMAGE_SIZE = 1024 * 1024

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters.")
    .max(60, "Name must not exceed 60 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address."),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const addActivity = useActivityStore(
    (state) => state.addActivity
  )

  const [profilePicture, setProfilePicture] = React.useState("")
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [savedMessage, setSavedMessage] = React.useState("")
  const [pictureError, setPictureError] = React.useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "Admin",
      email: "admin@example.com",
    },
  })

  React.useEffect(() => {
    const name =
      localStorage.getItem(PROFILE_NAME_KEY) || "Admin"

    const email =
      localStorage.getItem("demo-last-login-email") ||
      "admin@example.com"

    const picture =
      localStorage.getItem(PROFILE_PICTURE_KEY) || ""

    reset({ name, email })
    setProfilePicture(picture)
    setIsLoaded(true)
  }, [reset])

  function onSubmit(values: ProfileValues) {
    setSavedMessage("")

    try {
      const previousName =
        localStorage.getItem(PROFILE_NAME_KEY) || "Admin"

      const nextName = values.name.trim()

      localStorage.setItem(PROFILE_NAME_KEY, nextName)

      window.dispatchEvent(new Event("profile-updated"))

      addActivity({
        type: "profile_updated",
        message:
          previousName !== nextName
            ? `Profile name changed from ${previousName} to ${nextName}.`
            : "Profile settings saved.",
      })

      setSavedMessage("Your profile has been saved.")
    } catch {
      setSavedMessage(
        "Unable to save your profile. Please try again."
      )
    }
  }

  function handlePictureChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setPictureError("")
    setSavedMessage("")

    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setPictureError("Please select a valid image file.")
      event.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setPictureError("Choose an image that is 1 MB or smaller.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setPictureError("Unable to read this image.")
        return
      }

      try {
        localStorage.setItem(
          PROFILE_PICTURE_KEY,
          reader.result
        )

        setProfilePicture(reader.result)

        window.dispatchEvent(new Event("profile-updated"))

        addActivity({
          type: "profile_updated",
          message: "Profile picture updated.",
        })

        setSavedMessage("Profile picture updated.")
      } catch {
        setPictureError(
          "Unable to save the image. Try a smaller image."
        )
      }
    }

    reader.onerror = () => {
      setPictureError("Unable to read this image.")
    }

    reader.readAsDataURL(file)
    event.target.value = ""
  }

  function removePicture() {
    try {
      localStorage.removeItem(PROFILE_PICTURE_KEY)
      setProfilePicture("")

      window.dispatchEvent(new Event("profile-updated"))

      addActivity({
        type: "profile_updated",
        message: "Profile picture removed.",
      })

      setSavedMessage("Profile picture removed.")
      setPictureError("")
    } catch {
      setPictureError("Unable to remove the profile picture.")
    }
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-4xl p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">
          Loading profile settings...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-5 sm:p-8">
      {/* Page heading */}
      <section>
        <p className="text-sm text-muted-foreground">
          Account
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Profile Settings
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile information and picture.
        </p>
      </section>

      {/* Profile picture */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <CardDescription>
            Upload a picture for your workspace profile.
            Maximum file size: 1 MB.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-muted-foreground">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Your profile"
                  className="size-full object-cover"
                />
              ) : (
                <FiUser size={36} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureChange}
              />

              <Button
                type="button"
                onClick={() =>
                  document
                    .getElementById("profile-picture")
                    ?.click()
                }
              >
                <FiCamera className="mr-2" size={16} />
                Upload picture
              </Button>

              {profilePicture && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removePicture}
                >
                  Remove picture
                </Button>
              )}
            </div>
          </div>

          {pictureError && (
            <p
              className="mt-4 text-sm text-destructive"
              role="alert"
            >
              {pictureError}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>
            Update your profile name and email address.
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
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={17}
                />

                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="h-11 rounded-xl pl-10"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "name-error" : undefined
                  }
                  {...register("name")}
                />
              </div>

              {errors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <div className="relative">
                <FiMail
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={17}
                />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="h-11 rounded-xl pl-10"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.email.message}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                This demo saves your profile locally. Changing this
                email does not change your login credentials.
              </p>
            </div>

            {savedMessage && (
              <p
                className="text-sm text-muted-foreground"
                role="status"
              >
                {savedMessage}
              </p>
            )}

            <div className="flex justify-end border-t pt-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl"
              >
                <FiSave className="mr-2" size={16} />
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account details */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>
            Details about this demo profile.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FiImage size={19} />
          </div>

          <div>
            <p className="text-sm font-medium">
              Local demo profile
            </p>
            <p className="text-xs text-muted-foreground">
              Changes are saved in this browser.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}