export function GlassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h14l-7 8z" fill="currentColor" />
      <path d="M12 12v7M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function AllIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"
        fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CameraIcon({ strokeWidth = 1.7 }: { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-1.8A1.5 1.5 0 0 1 10.5 3.5h3a1.5 1.5 0 0 1 1.2.7L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"
        fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round"
      />
      <circle cx="12" cy="12.3" r="3.4" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

export function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 17l5-4.5 3.5 3 3-2.5L20 17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h14l-5.5 7v6l-3 2v-8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
