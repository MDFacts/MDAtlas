export function Disclaimer() {
  return (
    <p className="mt-5 flex gap-2 rounded-xl border border-line bg-white/60 p-3 text-[11px] leading-relaxed text-muted">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="mt-px shrink-0 text-brand"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        MDAtlas offers possible explanations and educational information — <b>not a diagnosis</b>. It
        cannot replace an examination by a qualified professional. If symptoms are severe, worsening,
        or worrying you, seek medical care.
      </span>
    </p>
  )
}
