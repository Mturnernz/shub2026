import { create } from 'zustand'

interface UIStore {
  // Onboarding
  onboardingStep: number
  setOnboardingStep: (step: number) => void

  // Sheets
  profileSheetOpen: boolean
  connectSheetOpen: boolean
  notificationTrayOpen: boolean
  activeSheetProvider: string | null

  // Toast
  toastMsg: string | null

  // Setters
  setProfileSheetOpen: (open: boolean) => void
  setConnectSheetOpen: (open: boolean) => void
  setNotificationTrayOpen: (open: boolean) => void
  setActiveSheetProvider: (id: string | null) => void
  showToast: (msg: string) => void
  clearToast: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  onboardingStep: 0,
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  profileSheetOpen: false,
  connectSheetOpen: false,
  notificationTrayOpen: false,
  activeSheetProvider: null,

  toastMsg: null,

  setProfileSheetOpen: (profileSheetOpen) => set({ profileSheetOpen }),
  setConnectSheetOpen: (connectSheetOpen) => set({ connectSheetOpen }),
  setNotificationTrayOpen: (notificationTrayOpen) => set({ notificationTrayOpen }),
  setActiveSheetProvider: (activeSheetProvider) => set({ activeSheetProvider }),
  showToast: (msg) => set({ toastMsg: msg }),
  clearToast: () => set({ toastMsg: null }),
}))
