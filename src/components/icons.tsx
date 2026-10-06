interface IconProps {
  className?: string;
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function KitchenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M10 2C7.8 2 6 3.8 6 6c0 1.5.7 2.8 1.8 3.6L7 17h6l-.8-7.4C13.3 8.8 14 7.5 14 6c0-2.2-1.8-4-4-4z" fill="currentColor" opacity="0.85" />
      <rect x="4" y="17" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function PickupIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="4" r="2.5" fill="currentColor" opacity="0.85" />
      <path d="M6 18v-6l-1.5-3.5C4 7.3 4.8 6 6 6h8c1.2 0 2 1.3 1.5 2.5L14 12v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DeliveryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M2 12h10l2-5h3l1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="14.5" r="1.5" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r="1.5" fill="currentColor" />
      <path d="M2 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="3" y="8" width="14" height="5" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="5" y="13" width="2" height="4" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="13" y="13" width="2" height="4" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="7" y="3" width="6" height="5" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="14" height="2" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="3" y="7" width="10" height="2" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="3" y="11" width="12" height="2" rx="1" fill="currentColor" opacity="0.65" />
      <rect x="3" y="15" width="8" height="2" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function ReportsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="3" y="12" width="3" height="5" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="8.5" y="8" width="3" height="9" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="14" y="4" width="3" height="13" rx="1" fill="currentColor" opacity="0.9" />
      <path d="M3 3l4.5 4.5L11 4l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 0 1 6.93 11.97L18 18l-4.17-1.07A8 8 0 1 1 10 2zm0 1.5a6.5 6.5 0 1 0 3.4 12.04l.34-.2 2.7.69-.69-2.62.22-.36A6.5 6.5 0 0 0 10 3.5z" fill="currentColor" opacity="0.85" />
      <path d="M7.5 8.5c.3.7.8 1.4 1.5 2s1.3 1.1 2 1.4l.6-.7c.2-.2.5-.3.7-.2.5.2 1 .4 1.4.5.3.1.5.4.5.7v1.3c0 .4-.3.7-.7.7C8.8 14.2 6 11.4 6 8.2c0-.4.3-.7.7-.7H8c.3 0 .6.2.7.5.1.4.3.9.5 1.4.1.2 0 .5-.2.7l-.5.4z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="2.5" fill="currentColor" opacity="0.9" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function HamburgerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function WaiterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="4" r="2.5" fill="currentColor" opacity="0.85" />
      <path d="M5 19v-5.5L3.5 10C3 8.8 3.8 7.5 5 7.5h10c1.2 0 2 1.3 1.5 2.5L15 13.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7.5" y1="13.5" x2="12.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M7 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 14l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
