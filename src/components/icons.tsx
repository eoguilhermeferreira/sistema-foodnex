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
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.418A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 0 1-4.274-1.247l-.306-.183-3.12.889.893-3.063-.2-.315A7.954 7.954 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
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
