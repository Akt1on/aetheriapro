import { useEffect, useState } from "react";
import { initSound, onSound, setSound } from "@/lib/sound";

export function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { const off = onSound(setOn); initSound(); return off; }, []);
  return (
    <button
      type="button"
      aria-label={on ? "Выключить звук" : "Включить звук"}
      aria-pressed={on}
      onClick={() => setSound(!on)}
      className="glass flex h-9 w-9 items-center justify-center gap-[3px] rounded-full"
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-foreground/85"
          style={{
            height: on ? undefined : 4,
            animation: on ? `aeth-eq 0.9s ${i * 0.12}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </button>
  );
}
