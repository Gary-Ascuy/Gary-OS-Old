export interface DockOption {
  id: string
  name: string
  icon: string

  action: () => Promise<void>
}
