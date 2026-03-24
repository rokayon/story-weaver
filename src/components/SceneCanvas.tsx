import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Stars, Cloud, Environment } from "@react-three/drei";
import * as THREE from "three";

export interface SceneData {
  text?: string;
  weather?: string;
  timeOfDay?: string;
  environment?: string;
  [key: string]: any;
}

interface Props {
  scene: SceneData;
  className?: string;
}

/* ─── Helper: time-of-day colors ─── */
const getAmbient = (tod: string) => {
  switch (tod) {
    case "night": return { color: "#1a1a3e", intensity: 0.15, sunPos: [0, -1, 0] as [number, number, number], fogColor: "#0a0a1a" };
    case "evening": return { color: "#c44e2e", intensity: 0.4, sunPos: [-1, 0.05, 0.5] as [number, number, number], fogColor: "#1a0a2e" };
    case "morning": return { color: "#e8a060", intensity: 0.5, sunPos: [1, 0.2, 0.5] as [number, number, number], fogColor: "#2a1a3e" };
    default: return { color: "#87ceeb", intensity: 0.8, sunPos: [1, 1, 0.5] as [number, number, number], fogColor: "#b0d8f0" };
  }
};

/* ─── Rain particles ─── */
const Rain = ({ count = 500 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) - 0.3;
      pos.setY(i, y < -1 ? 20 : y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#aaccff" size={0.05} transparent opacity={0.6} />
    </points>
  );
};

/* ─── Snow particles ─── */
const Snow = ({ count = 300 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null!);
  const drifts = useRef(Array.from({ length: count }, () => Math.random() * Math.PI * 2));
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - 0.03;
      let x = pos.getX(i) + Math.sin(t + drifts.current[i]) * 0.01;
      if (y < -1) { y = 20; x = (Math.random() - 0.5) * 30; }
      pos.setX(i, x);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.12} transparent opacity={0.8} />
    </points>
  );
};

/* ─── Ground plane ─── */
const Ground = ({ env }: { env: string }) => {
  const color = useMemo(() => {
    switch (env) {
      case "forest": return "#1a4a1a";
      case "ocean": return "#1a3a5a";
      case "city": return "#2a2a2a";
      case "mountain": return "#3a4a3a";
      case "interior": return "#2a2015";
      default: return "#2a5a2a";
    }
  }, [env]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

/* ─── Trees (forest) ─── */
const Trees = () => {
  const treeData = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 25, 0, -3 - Math.random() * 15] as [number, number, number],
      height: 2 + Math.random() * 3,
      scale: 0.6 + Math.random() * 0.6,
      seed: i,
    })), []);

  return (
    <>
      {treeData.map((t, i) => (
        <group key={i} position={t.pos}>
          {/* Trunk */}
          <mesh position={[0, t.height / 2 - 1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, t.height * 0.4, 6]} />
            <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, t.height * 0.5, 0]} castShadow>
            <coneGeometry args={[t.scale, t.height * 0.6, 6]} />
            <meshStandardMaterial color={`hsl(${120 + t.seed * 3}, 35%, ${20 + t.seed}%)`} roughness={0.8} />
          </mesh>
          <mesh position={[0, t.height * 0.7, 0]} castShadow>
            <coneGeometry args={[t.scale * 0.7, t.height * 0.4, 6]} />
            <meshStandardMaterial color={`hsl(${125 + t.seed * 3}, 40%, ${22 + t.seed}%)`} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
};

/* ─── Water surface (ocean) ─── */
const Water = () => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.position.y = -0.5 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[60, 60, 32, 32]} />
      <meshStandardMaterial color="#1a5a8a" transparent opacity={0.85} roughness={0.3} metalness={0.2} />
    </mesh>
  );
};

/* ─── Buildings (city) ─── */
const Buildings = () => {
  const bData = useMemo(() =>
    Array.from({ length: 14 }, () => ({
      pos: [(Math.random() - 0.5) * 24, 0, -4 - Math.random() * 14] as [number, number, number],
      h: 2 + Math.random() * 6,
      w: 0.8 + Math.random() * 1.5,
      d: 0.8 + Math.random() * 1.5,
    })), []);

  return (
    <>
      {bData.map((b, i) => (
        <mesh key={i} position={[b.pos[0], b.h / 2 - 1, b.pos[2]]} castShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={`hsl(220, 8%, ${18 + i * 2}%)`} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
};

/* ─── Mountains ─── */
const Mountains = () => {
  const mData = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      pos: [(i - 2) * 6, 0, -12 - Math.random() * 5] as [number, number, number],
      h: 5 + Math.random() * 5,
      r: 3 + Math.random() * 2,
    })), []);

  return (
    <>
      {mData.map((m, i) => (
        <mesh key={i} position={[m.pos[0], m.h / 2 - 1, m.pos[2]]} castShadow>
          <coneGeometry args={[m.r, m.h, 6]} />
          <meshStandardMaterial color={`hsl(210, 12%, ${28 - i * 3}%)`} roughness={0.9} />
        </mesh>
      ))}
    </>
  );
};

/* ─── Interior room ─── */
const InteriorRoom = () => (
  <group>
    {/* Floor */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
    </mesh>
    {/* Back wall */}
    <mesh position={[0, 2, -5]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#2a2015" roughness={0.9} />
    </mesh>
    {/* Side walls */}
    <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#2a2015" roughness={0.9} />
    </mesh>
    <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#2a2015" roughness={0.9} />
    </mesh>
    {/* Warm light */}
    <pointLight position={[0, 3, 0]} intensity={1} color="#ffcc80" distance={10} />
  </group>
);

/* ─── Animated camera orbit ─── */
const CameraRig = () => {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.1) * 0.5;
    camera.position.y = 2 + Math.sin(t * 0.15) * 0.2;
    camera.lookAt(0, 0, -5);
  });
  return null;
};

/* ─── Main scene content ─── */
const SceneContent = ({ scene }: { scene: SceneData }) => {
  const tod = scene.timeOfDay || "day";
  const weather = scene.weather || "clear";
  const env = scene.environment || "field";
  const amb = getAmbient(tod);

  return (
    <>
      <CameraRig />
      <ambientLight intensity={amb.intensity} color={amb.color} />
      <directionalLight
        position={[amb.sunPos[0] * 10, amb.sunPos[1] * 10, amb.sunPos[2] * 10]}
        intensity={tod === "night" ? 0.1 : 0.6}
        color={tod === "evening" ? "#ff8844" : tod === "morning" ? "#ffcc88" : "#ffffff"}
        castShadow
      />
      <fog attach="fog" args={[amb.fogColor, 15, 40]} />

      {/* Sky */}
      {tod !== "night" && (
        <Sky
          sunPosition={amb.sunPos}
          turbidity={tod === "evening" ? 10 : 4}
          rayleigh={tod === "evening" ? 4 : 2}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      )}
      {tod === "night" && <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />}

      {/* Clouds */}
      {weather !== "clear" && tod !== "night" && (
        <>
          <Cloud position={[-4, 8, -10]} speed={0.2} opacity={0.5} />
          <Cloud position={[4, 9, -8]} speed={0.15} opacity={0.4} />
        </>
      )}

      {/* Weather */}
      {(weather === "rain" || weather === "storm") && <Rain count={weather === "storm" ? 1000 : 500} />}
      {weather === "snow" && <Snow />}

      {/* Environment */}
      {env === "forest" && <><Ground env="forest" /><Trees /></>}
      {env === "ocean" && <Water />}
      {env === "city" && <><Ground env="city" /><Buildings /></>}
      {env === "mountain" && <><Ground env="mountain" /><Mountains /></>}
      {env === "interior" && <InteriorRoom />}
      {env === "field" && <Ground env="field" />}
    </>
  );
};

/* ─── Exported component ─── */
const SceneCanvas = ({ scene, className = "" }: Props) => (
  <div className={`w-full h-full ${className}`}>
    <Canvas
      shadows
      camera={{ position: [0, 2, 8], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <SceneContent scene={scene} />
      </Suspense>
    </Canvas>
  </div>
);

export default SceneCanvas;
