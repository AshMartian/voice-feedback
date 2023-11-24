import create from 'zustand'

export interface SettingsInterface {
  color: string
  scrubberPreview: boolean
  scrubberPreviewSize: number
  predictionInterval: number
  predictionBuffer: number
  showNote: boolean
}

interface SettingsStore {
  settings: SettingsInterface
  setSettings: (settings: Partial<SettingsInterface>) => void
  resetSettings: () => void
}

export const defaultSettings = {
  color: 'yellow',
  scrubberPreview: true,
  scrubberPreviewSize: 0.3,
  predictionInterval: 1000,
  predictionBuffer: 128,
  showNote: true
};

export const getSettings = (): SettingsInterface => localStorage.getItem('settings') !== null
  ? {... defaultSettings, ...JSON.parse(localStorage.getItem('settings') as string)} as SettingsInterface 
  : defaultSettings;

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: getSettings(),
  resetSettings: () => {
    localStorage.removeItem('settings')
    set({ settings: defaultSettings })
  },
  setSettings: (settings: Partial<SettingsInterface>) => {
    set((state) => {
      localStorage.setItem('settings', JSON.stringify({
        ...state.settings,
        ...settings
      }))

      return {
        settings: {
          ...state.settings,
          ...settings
        }
      }
    })
  }
}))
