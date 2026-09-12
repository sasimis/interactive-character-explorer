import { useMemo } from "react";
import * as THREE from "three";
import { ARENA_RADIUS, CRATES, ROCKS, TREES } from "./world";
import { makeGroundTexture, makeStoneTexture } from "./textures";

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]} scale={s} rotation-y={x * 1.7}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.34, 2.2, 7]} />
        <meshStandardMaterial color="#6b4a2f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <icosahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial color="#3f7d43" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0.45, 3.5, 0.2]} castShadow>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#4d9450" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[-0.55, 3.1, -0.3]} castShadow>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#356b3b" flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}

function Rock({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <mesh position={[x, 0.45 * s, z]} scale={[s, s * 0.8, s]} rotation={[0.2, x, 0.1]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.9, 0]} />
      <meshStandardMaterial color="#8d8b85" flatShading roughness={1} />
    </mesh>
  );
}

function Fountain() {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.6, 24]} />
        <meshStandardMaterial color="#b9ab92" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.08, 24]} />
        <meshStandardMaterial color="#4f96b8" roughness={0.15} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.35, 1.3, 12]} />
        <meshStandardMaterial color="#c6b89f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#88c6dd" roughness={0.2} />
      </mesh>
    </group>
  );
}

export function World() {
  const grass = useMemo(() => makeGroundTexture(), []);
  const stone = useMemo(() => makeStoneTexture(), []);

  const fence = useMemo(() => {
    const posts: { x: number; z: number; a: number }[] = [];
    const count = 56;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      posts.push({ x: Math.cos(a) * ARENA_RADIUS, z: Math.sin(a) * ARENA_RADIUS, a });
    }
    return posts;
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[ARENA_RADIUS + 8, 64]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>

      {/* plaza */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} receiveShadow>
        <ringGeometry args={[2.6, 6.5, 48]} />
        <meshStandardMaterial map={stone} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <Fountain />

      {TREES.map((t, i) => (
        <Tree key={`t${i}`} {...t} />
      ))}
      {ROCKS.map((r, i) => (
        <Rock key={`r${i}`} {...r} />
      ))}
      {CRATES.map((c, i) => (
        <mesh key={`c${i}`} position={[c.x, 0.5, c.z]} rotation-y={c.r} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#a9793f" roughness={0.85} />
        </mesh>
      ))}

      {/* boundary fence */}
      {fence.map((p, i) => (
        <mesh key={`f${i}`} position={[p.x, 0.55, p.z]} rotation-y={-p.a} castShadow>
          <boxGeometry args={[0.16, 1.1, 0.16]} />
          <meshStandardMaterial color="#7d5c3b" roughness={0.9} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[ARENA_RADIUS - 0.4, ARENA_RADIUS, 64]} />
        <meshStandardMaterial color="#c2b38f" roughness={1} />
      </mesh>
    </group>
  );
}
