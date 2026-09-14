import { useEffect, useRef } from "react";

export type Keys = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  wave: boolean;
  dance: boolean;
  /** analog movement from touch joystick or gamepad, -1..1 */
  moveX: number;
  moveY: number;
  /** accumulated camera turn request (radians), consumed each frame */
  lookDx: number;
};

type BoolKey = "forward" | "back" | "left" | "right" | "run" | "jump" | "wave" | "dance";

const MAP: Record<string, BoolKey> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
  ShiftRight: "run",
  Space: "jump",
  KeyE: "wave",
  KeyF: "dance",
};

export function useKeyboard() {
  const keys = useRef<Keys>({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    wave: false,
    dance: false,
    moveX: 0,
    moveY: 0,
    lookDx: 0,
  });

  useEffect(() => {
    const set = (code: string, value: boolean) => {
      const key = MAP[code];
      if (key) keys.current[key] = value;
    };
    const down = (e: KeyboardEvent) => {
      if (MAP[e.code]) e.preventDefault();
      set(e.code, true);
    };
    const up = (e: KeyboardEvent) => set(e.code, false);
    const blur = () => {
      const k = keys.current;
      k.forward = k.back = k.left = k.right = false;
      k.run = k.jump = k.wave = k.dance = false;
      k.moveX = k.moveY = 0;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  return keys;
}

/** Pointer position in normalized device coords (-1..1), for the look-at-cursor effect. */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return pointer;
}

export type PadState = {
  moveX: number;
  moveY: number;
  lookDx: number;
  run: boolean;
  jump: boolean;
  wave: boolean;
  dance: boolean;
  connected: boolean;
};

const dead = (v: number, d = 0.18) => (Math.abs(v) < d ? 0 : (v - Math.sign(v) * d) / (1 - d));

/** Reads the first connected gamepad. Call once per frame. */
export function pollGamepad(dt: number): PadState {
  const out: PadState = {
    moveX: 0,
    moveY: 0,
    lookDx: 0,
    run: false,
    jump: false,
    wave: false,
    dance: false,
    connected: false,
  };
  if (typeof navigator === "undefined" || !navigator.getGamepads) return out;
  const pads = navigator.getGamepads();
  let pad: Gamepad | null = null;
  for (const p of pads) if (p && p.connected) { pad = p; break; }
  if (!pad) return out;

  out.connected = true;
  out.moveX = dead(pad.axes[0] ?? 0);
  out.moveY = -dead(pad.axes[1] ?? 0);
  out.lookDx = -dead(pad.axes[2] ?? 0) * 2.6 * dt;

  const btn = (i: number) => !!pad!.buttons[i]?.pressed;
  out.jump = btn(0);
  out.wave = btn(2);
  out.dance = btn(3);
  out.run = btn(6) || btn(7) || btn(10) || Math.hypot(out.moveX, out.moveY) > 0.85;
  return out;
}
