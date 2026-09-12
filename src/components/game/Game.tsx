import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, Lightformer, useProgress } from "@react-three/drei";
import { World } from "./World";
import { Character } from "./Character";
import { HUD } from "./HUD";
import { useKeyboard } from "./useKeyboard";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-lg bg-card/85 px-4 py-2 font-mono text-sm text-card-foreground shadow">
        {Math.round(progress)}%
      </div>
    </Html>
  );
}

export function Game() {
  const keys = useKeyboard();
  const [action, setAction] = useState("Idle");

  return (
    <div className="fixed inset-0">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 4, 16], fov: 55 }}>
        <color attach="background" args={["#bfe0ef"]} />
        <fog attach="fog" args={["#bfe0ef", 34, 78]} />

        <hemisphereLight args={["#cfe8f5", "#5c7a45", 0.85]} />
        <directionalLight
          position={[14, 20, 10]}
          intensity={1.9}
          color="#fff2d8"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-34}
          shadow-camera-right={34}
          shadow-camera-top={34}
          shadow-camera-bottom={-34}
        />
        <Environment>
          <Lightformer intensity={1.6} position={[0, 6, 0]} scale={[12, 12, 1]} />
          <Lightformer
            intensity={0.8}
            color="#8fb9d6"
            position={[-6, 2, -4]}
            rotation-y={Math.PI / 2}
            scale={[20, 2, 1]}
          />
        </Environment>

        <World />

        <Suspense fallback={<Loader />}>
          <Character keys={keys} onState={(s) => setAction((a) => (a === s.action ? a : s.action))} />
        </Suspense>
      </Canvas>
      <HUD action={action} />
    </div>
  );
}
