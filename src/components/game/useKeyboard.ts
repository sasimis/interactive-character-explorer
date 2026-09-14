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
    const blur = () =>
      Object.keys(keys.current).forEach((k) => {
        keys.current[k as keyof Keys] = false;
      });

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
