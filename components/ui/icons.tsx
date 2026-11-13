// Iconos de línea en SVG inline: sin librería extra.
type P = { className?: string };
const svg = (path: React.ReactNode) =>
  function Icon({ className = "size-5" }: P) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        {path}
      </svg>
    );
  };

export const SearchIcon = svg(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const BagIcon = svg(<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>);
export const MenuIcon = svg(<path d="M4 7h16M4 12h16M4 17h16" />);
export const WhatsappIcon = svg(<><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" /></>);
