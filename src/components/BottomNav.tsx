"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Aujourd'hui", icon: "home" },
  { href: "/feeding", label: "Tétées", icon: "bottle" },
  { href: "/sleep", label: "Sommeil", icon: "moon" },
  { href: "/history", label: "Historique", icon: "history" },
] as const;

function Icon({ name }: { name: (typeof items)[number]["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" } as const;
  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "bottle") {
    return (
      <svg {...common}>
        <rect x="9" y="8" width="6" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 8V5.5a2 2 0 0 1 4 0V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg {...common}>
        <path
          d="M19.5 14.2A8 8 0 1 1 9.8 4.5a6.3 6.3 0 0 0 9.7 9.7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/90 backdrop-blur"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="flex items-stretch justify-around max-w-md mx-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-accent" : "text-text-muted"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
