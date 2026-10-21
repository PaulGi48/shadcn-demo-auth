import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserStatus = "Active" | "Inactive";
export type UserRole = "Administrator" | "Editor" | "Viewer";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

const initialUsers: UserRecord[] = [
  {
    id: 1,
    name: "Amara Okafor",
    email: "amara@example.com",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 2,
    name: "Daniel Adeyemi",
    email: "daniel@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 3,
    name: "Zara Ibrahim",
    email: "zara@example.com",
    role: "Viewer",
    status: "Inactive",
  },
  {
    id: 4,
    name: "David Eze",
    email: "david@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 5,
    name: "Tomiwa Bello",
    email: "tomiwa@example.com",
    role: "Viewer",
    status: "Inactive",
  },
];

type UsersState = {
  users: UserRecord[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addUser: (user: Omit<UserRecord, "id">) => void;
  updateUser: (id: number, updates: Omit<UserRecord, "id">) => void;
  deleteUser: (id: number) => void;
};

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addUser: (user) => {
        const email = user.email.trim().toLowerCase();

        // Prevent duplicate email addresses.
        if (
          get().users.some(
            (existing) => existing.email.trim().toLowerCase() === email
          )
        ) {
          return;
        }

        set((state) => ({
          users: [
            {
              ...user,
              email,
              id: Date.now(),
            },
            ...state.users,
          ],
        }));
      },

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id
              ? {
                  ...user,
                  ...updates,
                  email: updates.email.trim().toLowerCase(),
                }
              : user
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),
    }),
    {
      name: "demo-dashboard-users-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          try {
            const current = localStorage.getItem(
              "demo-dashboard-users-store"
            );
            const legacy = localStorage.getItem("demo-dashboard-users");

            if (!current && legacy) {
              const parsed: unknown = JSON.parse(legacy);

              if (Array.isArray(parsed)) {
                useUsersStore.setState({
                  users: parsed as UserRecord[],
                });
              }
            }
          } catch {
            // Keep the initialized data if legacy storage is invalid.
          }
        }

        state?.setHasHydrated(true);
      },
    }
  )
)