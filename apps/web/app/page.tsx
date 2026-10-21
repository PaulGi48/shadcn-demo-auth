
import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Page() {
  return (
    <div className="relative flex min-h-svh p-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We've already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="text-muted-foreground font-mono text-xs">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
