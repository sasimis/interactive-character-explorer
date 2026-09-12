import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ARENA_RADIUS, OBSTACLES } from "./world";
import { usePointer, type Keys } from "./useKeyboard";

const MODEL = "/models/robot.glb";
useGLTF.preload(MODEL);

const WALK_SPEED = 3.2;
const RUN_SPEED = 6.6;
const ACCEL = 12;
const DAMPING = 9;
const GRAVITY = 22;
const JUMP_V = 7.5;
const RADIUS = 0.55;
const FADE = 0.22;

export type CharState = { moving: boolean; running: boolean; action: string };

export function Character({
  keys,
  onState,
}: {
  keys: React.RefObject<Keys>;
  onState: (s: CharState) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions } = useAnimations(animations, group);
  const pointer = usePointer();

  const head = useMemo(() => scene.getObjectByName("Head") as THREE.Bone | undefined, [scene]);
  // normalize the model to a ~1.8 unit tall character
  const modelScale = useMemo(() => {
    const size = new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
    return 1.8 / (size.y || 1);
  }, [scene]);
  const headBase = useRef(new THREE.Euler());

  const pos = useRef(new THREE.Vector3(0, 0, 8));
  const vel = useRef(new THREE.Vector3());
  const yaw = useRef(Math.PI);
  const vy = useRef(0);
  const camYaw = useRef(Math.PI);
  const clip = useRef<string>("Idle");
  const oneShot = useRef<{ name: string; until: number } | null>(null);
  const dancing = useRef(false);
  const camPos = useRef(new THREE.Vector3(0, 4, 16));

  useLayoutEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    if (head) headBase.current.copy(head.rotation);
  }, [scene, head]);

  // camera orbit by dragging
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      camYaw.current -= (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    const up = () => (dragging = false);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const play = (name: string) => {
    if (clip.current === name) return;
    actions[clip.current]?.fadeOut(FADE);
    const next = actions[name];
    if (next) {
      next.reset().fadeIn(FADE).play();
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    clip.current = name;
  };

  useEffect(() => {
    actions["Idle"]?.reset().play();
    clip.current = "Idle";
  }, [actions]);

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const k = keys.current;
    const now = performance.now() / 1000;

    // input direction in camera space
    const ix = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    const iz = (k.forward ? 1 : 0) - (k.back ? 1 : 0);
    const moving = ix !== 0 || iz !== 0;
    if (moving) dancing.current = false;

    const sin = Math.sin(camYaw.current);
    const cos = Math.cos(camYaw.current);
    const dir = new THREE.Vector3(ix * cos - iz * sin, 0, -ix * sin - iz * cos);
    if (dir.lengthSq() > 0) dir.normalize();

    const running = k.run && moving;
    const target = dir.multiplyScalar(running ? RUN_SPEED : WALK_SPEED);
    vel.current.x += (target.x - vel.current.x) * Math.min(1, ACCEL * dt);
    vel.current.z += (target.z - vel.current.z) * Math.min(1, ACCEL * dt);
    if (!moving) {
      const damp = Math.exp(-DAMPING * dt);
      vel.current.x *= damp;
      vel.current.z *= damp;
    }

    pos.current.x += vel.current.x * dt;
    pos.current.z += vel.current.z * dt;

    // obstacle push-out
    for (const o of OBSTACLES) {
      const dx = pos.current.x - o.x;
      const dz = pos.current.z - o.z;
      const min = o.r + RADIUS;
      const d = Math.hypot(dx, dz);
      if (d < min && d > 0.0001) {
        pos.current.x = o.x + (dx / d) * min;
        pos.current.z = o.z + (dz / d) * min;
      }
    }
    // arena bounds
    const dist = Math.hypot(pos.current.x, pos.current.z);
    const limit = ARENA_RADIUS - 0.8;
    if (dist > limit) {
      pos.current.x = (pos.current.x / dist) * limit;
      pos.current.z = (pos.current.z / dist) * limit;
    }

    // jump / gravity
    const grounded = pos.current.y <= 0.001 && vy.current <= 0;
    if (grounded && k.jump) {
      vy.current = JUMP_V;
      oneShot.current = { name: "Jump", until: now + 0.9 };
    }
    vy.current -= GRAVITY * dt;
    pos.current.y = Math.max(0, pos.current.y + vy.current * dt);
    if (pos.current.y === 0) vy.current = 0;

    // gestures
    if (k.wave && !oneShot.current) oneShot.current = { name: "Wave", until: now + 2.2 };
    if (k.dance) dancing.current = true;

    // face movement direction
    if (moving) {
      const want = Math.atan2(vel.current.x, vel.current.z);
      let diff = want - yaw.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      yaw.current += diff * (1 - Math.exp(-10 * dt));
    }

    if (group.current) {
      group.current.position.copy(pos.current);
      group.current.rotation.y = yaw.current;
    }

    // animation selection
    if (oneShot.current && now > oneShot.current.until) oneShot.current = null;
    const speed = Math.hypot(vel.current.x, vel.current.z);
    const active = oneShot.current
      ? oneShot.current.name
      : dancing.current
        ? "Dance"
        : speed > 4.2
          ? "Running"
          : speed > 0.25
            ? "Walking"
            : "Idle";
    play(active);
    onState({ moving: speed > 0.25, running: speed > 4.2, action: active });

    // head follows the cursor when standing still (runs after the mixer update)
    if (head) {
      const idle = speed < 0.6 && !oneShot.current && !dancing.current;
      const ty = idle ? THREE.MathUtils.clamp(pointer.current.x * 0.8, -0.8, 0.8) : 0;
      const tx = idle ? THREE.MathUtils.clamp(-pointer.current.y * 0.45, -0.4, 0.4) : 0;
      const a = 1 - Math.exp(-6 * dt);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, headBase.current.y + ty, a);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, headBase.current.x + tx, a);
    }

    // chase camera
    const back = 7.5;
    const desired = new THREE.Vector3(
      pos.current.x + Math.sin(camYaw.current) * back,
      pos.current.y + 3.6,
      pos.current.z + Math.cos(camYaw.current) * back,
    );
    camPos.current.lerp(desired, 1 - Math.exp(-6 * dt));
    camera.position.copy(camPos.current);
    camera.lookAt(pos.current.x, pos.current.y + 1.3, pos.current.z);
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={modelScale} />
    </group>
  );
}
