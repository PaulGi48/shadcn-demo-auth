
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type TransactionStatus = "Completed" | "Pending" | "Failed"
export type TransactionType = "Credit" | "Debit"

export type Transaction = {
  id: string
  customer: string
  email: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  date: string
  description: string
}

const initialTransactions: Transaction[] = [
  {
    id: "TXN-1001",
    customer: "Amara Okafor",
    email: "amara@example.com",
    type: "Credit",
    amount: 125000,
    status: "Completed",
    date: "2026-10-20T10:30:00",
    description: "Account funding",
  },
  {
    id: "TXN-1002",
    customer: "Daniel Adeyemi",
    email: "daniel@example.com",
    type: "Debit",
    amount: 45000,
    status: "Completed",
    date: "2026-10-20T09:15:00",
    description: "Service payment",
  },
  {
    id: "TXN-1003",
    customer: "Zara Ibrahim",
    email: "zara@example.com",
    type: "Credit",
    amount: 78000,
    status: "Pending",
    date: "2026-10-19T14:20:00",
    description: "Bank transfer",
  },
  {
    id: "TXN-1004",
    customer: "David Eze",
    email: "david@example.com",
    type: "Debit",
    amount: 22500,
    status: "Failed",
    date: "2026-10-19T11:05:00",
    description: "Subscription payment",
  },
  {
    id: "TXN-1005",
    customer: "Tomiwa Bello",
    email: "tomiwa@example.com",
    type: "Credit",
    amount: 210000,
    status: "Completed",
    date: "2026-10-18T16:45:00",
    description: "Account funding",
  },
  {
    id: "TXN-1006",
    customer: "Ngozi James",
    email: "ngozi@example.com",
    type: "Debit",
    amount: 18500,
    status: "Pending",
    date: "2026-10-18T12:10:00",
    description: "Service payment",
  },
]

function getInitialTransactions(): Transaction[] {
  if (typeof window === "undefined") return initialTransactions

  try {
    const legacy = localStorage.getItem("demo-dashboard-transactions")

    if (legacy) {
      const parsed: unknown = JSON.parse(legacy)
      if (Array.isArray(parsed)) return parsed as Transaction[]
    }
  } catch {
    // Fall back to the initial demo records.
  }

  return initialTransactions
}

type TransactionsState = {
  transactions: Transaction[]
  hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void
  deleteTransaction: (id: string) => void
}

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set) => ({
      transactions: initialTransactions,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...updates }
              : transaction
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== id
          ),
        })),
    }),
    {
      name: "demo-dashboard-transactions-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
      }),
      onRehydrateStorage: () => (state) => {
        try {
          const current = localStorage.getItem(
            "demo-dashboard-transactions-store"
          )

          if (!current && state) {
            const legacy = getInitialTransactions()
            useTransactionsStore.setState({ transactions: legacy })
          }
        } catch {
          // Keep initialized records if migration fails.
        }

        state?.setHasHydrated(true)
      },
    }
  )
)