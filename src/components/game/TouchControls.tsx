import { useEffect, useRef, useState } from "react";
import type { Keys } from "./useKeyboard";

const STICK_R = 56;

/** Thumb-stick + action buttons for touch devices. Writes straight into the shared keys ref. */
export function TouchControls({ keys }: { keys: React.RefObject<Keys> }) {
  const [touch, setTouch] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const padRef = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window);
  }, []);

  if (!touch) return null;

  const update = (e: React.PointerEvent) => {
    const el = padRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > STICK_R) {
      dx = (dx / d) * STICK_R;
      dy = (dy / d) * STICK_R;
    }
    setKnob({ x: dx, y: dy });
    const k = keys.current;
    k.moveX = dx / STICK_R;
    k.moveY = -dy / STICK_R;
    k.run = Math.hypot(k.moveX, k.moveY) > 0.85;
  };

  const release = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    const k = keys.current;
    k.moveX = 0;
    k.moveY = 0;
    k.run = false;
  };

  const hold = (field: "jump" | "wave" | "dance") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      keys.current.dance = field === "dance" ? true : keys.current.dance;
      keys.current[field] = true;
    },
    onPointerUp: () => {
      if (field !== "dance") keys.current[field] = false;
    },
    onPointerLeave: () => {
      if (field !== "dance") keys.current[field] = false;
    },
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none" data-nolook>
      <div
        ref={padRef}
        data-nolook
        onPointerDown={(e) => {
          e.preventDefault();
          active.current = e.pointerId;
          (e.target as Element).setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => active.current === e.pointerId && update(e)}
        onPointerUp={release}
        onPointerCancel={release}
        className="pointer-events-auto absolute bottom-24 left-6 h-36 w-36 touch-none rounded-full border border-border/60 bg-card/50 backdrop-blur"
      >
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 rounded-full bg-card/90 shadow-lg"
          style={{ transform: `translate(-50%,-50%) translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      <div className="absolute bottom-24 right-6 flex flex-col items-end gap-3">
        <div className="flex gap-3">
          <Btn label="Wave" {...hold("wave")} />
          <Btn label="Dance" {...hold("dance")} />
        </div>
        <Btn label="Jump" big {...hold("jump")} />
      </div>
    </div>
  );
}

function Btn({
  label,
  big,
  ...handlers
}: { label: string; big?: boolean } & React.ComponentProps<"button">) {
  return (
    <button
      {...handlers}
      data-nolook
      className={`pointer-events-auto touch-none rounded-full border border-border/60 bg-card/70 font-medium text-card-foreground shadow-lg backdrop-blur active:bg-card ${
        big ? "h-20 w-20 text-sm" : "h-14 w-14 text-xs"
      }`}
    >
      {label}
    </button>
  );
}
