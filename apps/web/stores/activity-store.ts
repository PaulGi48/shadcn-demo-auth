
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ActivityType =
  | "login"
  | "logout"
  | "user_added"
  | "user_updated"
  | "user_deleted"
  | "profile_updated"
  | "transaction_added"
  | "transaction_updated"
  | "transaction_deleted"

export type ActivityRecord = {
  id: string
  type: ActivityType
  message: string
  timestamp: number
}

type ActivityState = {
  activities: ActivityRecord[]
  hasHydrated: boolean
  addActivity: (activity: {
    type: ActivityType
    message: string
  }) => void
  clearActivities: () => void
  setHasHydrated: (value: boolean) => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addActivity: (activity) =>
        set((state) => ({
          activities: [
            {
              ...activity,
              id: `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 9)}`,
              timestamp: Date.now(),
            },
            ...state.activities,
          ].slice(0, 100),
        })),

      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: "demo-dashboard-activities",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activities: state.activities,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)