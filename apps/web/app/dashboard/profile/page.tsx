
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FiCamera, FiCheck, FiUser } from "react-icons/fi"

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

const NAME_KEY = "demo-profile-name"
const PICTURE_KEY = "demo-profile-picture"

export default function ProfilePage() {
  const router = useRouter()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const addActivity = useActivityStore((state) => state.addActivity)

  const [name, setName] = React.useState("Admin")
  const [picture, setPicture] = React.useState("")
  const [saved, setSaved] = React.useState(false)
  const [pictureError, setPictureError] = React.useState("")

  React.useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) || "Admin")
    setPicture(localStorage.getItem(PICTURE_KEY) || "")
  }, [])

  function handlePictureChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    if (!file) return

    setSaved(false)
    setPictureError("")

    if (!file.type.startsWith("image/")) {
      setPictureError("Please select an image file.")
      event.target.value = ""
      return
    }

    if (file.size > 1024 * 1024) {
      setPictureError("Choose an image smaller than 1 MB.")
      event.target.value = ""
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPicture(reader.result)
      }
    }

    reader.onerror = () => {
      setPictureError("Unable to read this image. Please try another.")
    }

    reader.readAsDataURL(file)
    event.target.value = ""
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setPictureError("Please enter a dashboard name.")
      return
    }

    try {
      localStorage.setItem(NAME_KEY, trimmedName)

      if (picture) {
        localStorage.setItem(PICTURE_KEY, picture)
      } else {
        localStorage.removeItem(PICTURE_KEY)
      }

      setName(trimmedName)
      setSaved(true)
      setPictureError("")

      window.dispatchEvent(new Event("profile-updated"))

      addActivity({
        type: "profile_updated",
        message: `Updated dashboard profile name to ${trimmedName}.`,
      })
    } catch {
      setPictureError(
        "Unable to save your changes. Try a smaller picture."
      )
      setSaved(false)
    }
  }

  function cancelChanges() {
    setName(localStorage.getItem(NAME_KEY) || "Admin")
    setPicture(localStorage.getItem(PICTURE_KEY) || "")
    setPictureError("")
    setSaved(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Profile settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your dashboard name and display picture.
        </p>
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Personal profile</CardTitle>
          <CardDescription>
            Change the name and picture displayed in your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={saveProfile} className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                {picture ? (
                  <img
                    src={picture}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <FiUser
                    size={32}
                    className="text-muted-foreground"
                  />
                )}
              </div>

              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <FiCamera className="mr-2" />
                  Change picture
                </Button>

                <p className="text-xs text-muted-foreground">
                  Image files only, up to 1 MB.
                </p>
              </div>
            </div>

            {pictureError && (
              <p role="alert" className="text-sm text-destructive">
                {pictureError}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="profile-name">Dashboard name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setSaved(false)
                }}
                maxLength={40}
                required
                placeholder="Enter your display name"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                <FiCheck className="mr-2" />
                Save changes
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={cancelChanges}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
              >
                Back to overview
              </Button>
            </div>

            {saved && (
              <p role="status" className="text-sm text-primary">
                Profile changes saved successfully.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}