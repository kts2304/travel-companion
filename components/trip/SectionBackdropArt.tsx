type ArtVariant =
  | "members"
  | "expenses"
  | "bookings"
  | "flights"
  | "hotels"
  | "activities";

interface SectionBackdropArtProps {
  variant: ArtVariant;
}

const variantStyles: Record<ArtVariant, string> = {
  members: "text-fuchsia-700/10",
  expenses: "text-amber-600/10",
  bookings: "text-violet-700/10",
  flights: "text-fuchsia-700/10",
  hotels: "text-emerald-700/10",
  activities: "text-violet-700/10",
};

export function SectionBackdropArt({ variant }: SectionBackdropArtProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${variantStyles[variant]}`}
    >
      <div className="absolute -right-8 top-4 h-40 w-40 rounded-full bg-current blur-3xl" />
      <div className="absolute left-8 top-10 h-24 w-24 rounded-full border border-current/80" />

      {variant === "members" && (
        <>
          <svg
            viewBox="0 0 320 220"
            className="absolute -bottom-3 right-6 h-44 w-72"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <circle cx="82" cy="82" r="26" />
            <path d="M42 146c9-24 31-38 58-38 29 0 49 14 58 38" />
            <circle cx="208" cy="72" r="20" />
            <path d="M178 126c7-18 23-28 43-28 21 0 35 10 43 28" />
            <rect x="20" y="26" width="274" height="166" rx="24" />
          </svg>
          <svg
            viewBox="0 0 180 80"
            className="absolute left-10 bottom-6 h-18 w-40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M14 64h152" />
            <path d="M40 52v-18m34 18V24m34 28V18m34 34V30" />
            <circle cx="40" cy="28" r="6" />
            <circle cx="74" cy="20" r="6" />
            <circle cx="108" cy="14" r="6" />
            <circle cx="142" cy="26" r="6" />
          </svg>
        </>
      )}

      {variant === "expenses" && (
        <>
          <svg
            viewBox="0 0 320 220"
            className="absolute -bottom-2 right-6 h-44 w-72"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <rect x="24" y="22" width="272" height="176" rx="24" />
            <path d="M58 154h34M58 122h64M58 90h94" />
            <path d="M196 64h60v96h-60z" />
            <path d="M210 118h32M224 80v64" />
          </svg>
          <svg
            viewBox="0 0 220 120"
            className="absolute left-10 top-12 h-24 w-44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M16 98h184" />
            <path d="M34 98V64h24v34M84 98V46h24v52M134 98V30h24v68" />
            <path d="M28 42c32-28 68-22 92-8 18 10 34 12 74-8" />
          </svg>
        </>
      )}

      {variant === "bookings" && (
        <>
          <svg
            viewBox="0 0 340 220"
            className="absolute -bottom-2 right-4 h-44 w-80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <rect x="26" y="28" width="288" height="160" rx="24" />
            <path d="M78 80h112M78 112h184M78 144h96" />
            <circle cx="250" cy="82" r="18" />
            <path d="M240 82h20M250 72v20" />
          </svg>
          <svg
            viewBox="0 0 240 120"
            className="absolute left-12 top-14 h-24 w-48"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M24 88c22-18 52-28 88-28 44 0 74 12 104 28" />
            <path d="M38 40h48l14 18H52z" />
            <path d="M126 36h58v40h-58z" />
          </svg>
        </>
      )}

      {variant === "flights" && (
        <>
          <svg
            viewBox="0 0 380 240"
            className="absolute -bottom-2 right-0 h-48 w-84"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M34 136c68-46 124-60 174-60 50 0 94 14 138 48" />
            <path d="M48 152c84-18 166-16 286 4" />
            <path d="M194 44l22 44 72 12-58 18-12 42-22-36-74 8 52-22-14-32z" />
            <circle cx="42" cy="138" r="10" />
            <circle cx="336" cy="124" r="10" />
          </svg>
          <svg
            viewBox="0 0 220 120"
            className="absolute left-8 top-14 h-24 w-52"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <rect x="14" y="18" width="190" height="84" rx="18" />
            <path d="M40 46h62M40 68h140M40 90h88" />
          </svg>
        </>
      )}

      {variant === "hotels" && (
        <>
          <svg
            viewBox="0 0 360 240"
            className="absolute -bottom-3 right-4 h-48 w-80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <rect x="46" y="52" width="108" height="140" rx="18" />
            <rect x="170" y="28" width="140" height="164" rx="20" />
            <path d="M82 80h34M82 108h34M82 136h34M82 164h34" />
            <path d="M198 64h24M250 64h24M198 96h24M250 96h24M198 128h24M250 128h24" />
            <path d="M234 192v-40h24v40" />
          </svg>
          <svg
            viewBox="0 0 220 110"
            className="absolute left-10 top-12 h-24 w-44"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M18 92h184" />
            <path d="M26 92V48h34c14 0 24 10 24 22s-10 22-24 22z" />
            <path d="M84 92V60h54c16 0 28 14 28 32" />
          </svg>
        </>
      )}

      {variant === "activities" && (
        <>
          <svg
            viewBox="0 0 360 240"
            className="absolute -bottom-3 right-4 h-48 w-80"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M48 182c42-58 92-86 152-86 42 0 82 12 112 32" />
            <path d="M90 164l18 18 40-54" />
            <circle cx="90" cy="164" r="16" />
            <rect x="196" y="56" width="104" height="124" rx="22" />
            <path d="M224 86h48M224 114h48M224 142h30" />
          </svg>
          <svg
            viewBox="0 0 220 120"
            className="absolute left-10 top-14 h-24 w-48"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          >
            <path d="M22 94h176" />
            <path d="M44 94V42h132v52" />
            <path d="M84 42V18h52v24" />
            <path d="M78 68h64" />
          </svg>
        </>
      )}
    </div>
  );
}
