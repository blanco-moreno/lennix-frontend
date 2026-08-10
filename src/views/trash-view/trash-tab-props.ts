/** The contract every papelera tab receives from `TrashView`. */
export interface TrashTabProps {
  onPurge: (id: string) => void
  canPurge: boolean
  page: number
  onPageChange: (next: number) => void
}
