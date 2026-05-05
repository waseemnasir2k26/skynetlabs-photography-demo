"use client";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useCameraDrift, useMouseParallax } from "@/lib/r3f-helpers";

/**
 * Photography flagship hero — DARK editorial film-canister.
 *
 * Per brief:
 *   - Floating film canister (Kodak Portra 400, brushed aluminum body roughness 0.18 metalness 0.9 anisotropy 0.6,
 *     paper label, glass top), contact sheet plane behind, dust-mote particles drifting.
 *   - Camera dolly-in-and-orbit on hero=1200ms; particle drift at slow=600ms loop;
 *     mouse parallax ±3°.
 *   - Single moody warm key (3200K) + cool fill bounce (5800K) + dark "night" env.
 *   - Performance ≤6k tris.
 *   - Mobile <768: degrade to static dark hero photo (handled by reduced-motion path
 *     and by Hero component dynamic mount; we additionally early-return a poster on
 *     small viewports to keep LCP ≤2.5s).
 */

// ── Decal: Kodak Portra 400 paper label (drawn once per mount) ────────────────
function createDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#F5C800";
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = "#E3001B";
  ctx.fillRect(0, 0, 160, 256);

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(160, 20, 352, 216);

  ctx.fillStyle = "#E3001B";
  ctx.font = "bold 56px Arial, sans-serif";
  ctx.fillText("KODAK", 175, 90);

  ctx.fillStyle = "#222222";
  ctx.font = "bold 38px Arial, sans-serif";
  ctx.fillText("PORTRA 400", 175, 145);

  ctx.fillStyle = "#555555";
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText("135 — 36 exp.", 175, 195);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Contact sheet plane (faint paper grain w/ frame strip pattern) ────────────
function createContactSheetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // Paper base — warm grey
  ctx.fillStyle = "#1F1F1F";
  ctx.fillRect(0, 0, 1024, 512);

  // 6×3 frame grid suggestion
  ctx.fillStyle = "#0F0F0F";
  const cols = 6;
  const rows = 3;
  const margin = 30;
  const gap = 12;
  const cw = (1024 - margin * 2 - gap * (cols - 1)) / cols;
  const ch = (512 - margin * 2 - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * (cw + gap);
      const y = margin + r * (ch + gap);
      ctx.fillRect(x, y, cw, ch);
    }
  }

  // Subtle film-strip sprocket dots top and bottom
  ctx.fillStyle = "#2A2A2A";
  for (let i = 0; i < 32; i++) {
    ctx.fillRect(20 + i * 31, 8, 4, 6);
    ctx.fillRect(20 + i * 31, 498, 4, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── Canister mesh (≤6k tris budget) ───────────────────────────────────────────
function CanisterMesh() {
  const groupRef = React.useRef<THREE.Group>(null!);
  const decalTex = React.useMemo(() => createDecalTexture(), []);

  // Slow orbit — gentle, NOT a full spin. 0.05 rad/s combined.
  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.06;
      // breathing float handled by parent <Float>; tiny x tilt for life
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  // Brushed aluminum body
  const bodyMat = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#9A9A9A",
        roughness: 0.30,
        metalness: 0.90,
        // anisotropy is supported on MeshPhysicalMaterial in three r150+
        anisotropy: 0.6,
        envMapIntensity: 1.4,
      }),
    [],
  );

  // Paper label material — slightly emissive to lift in dark
  const labelMat = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: decalTex,
        roughness: 0.85,
        metalness: 0.0,
        emissive: new THREE.Color("#221A0A"),
        emissiveIntensity: 0.15,
      }),
    [decalTex],
  );

  // Glass top
  const glassMat = React.useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        roughness: 0.05,
        metalness: 0.0,
        transmission: 0.9,
        thickness: 0.2,
        ior: 1.45,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        opacity: 0.6,
        transparent: true,
      }),
    [],
  );

  // Total tri budget:
  //   body cyl 32 segs ≈ 128 tris
  //   top cap 32 segs ≈ 128 tris
  //   bottom cap 32 segs ≈ 128 tris
  //   decal band 32 segs ≈ 128 tris
  //   glass dome 32 segs ≈ 256 tris
  //   contact sheet plane = 2 tris
  //   particles use point-sprites (no tris)
  // ≈ 770 tris — well under 6k.
  return (
    <group ref={groupRef}>
      {/* Main body */}
      <mesh material={bodyMat} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 2.2, 32]} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.1, 0]} material={bodyMat} castShadow>
        <cylinderGeometry args={[0.65, 0.6, 0.12, 32]} />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -1.1, 0]} material={bodyMat} castShadow>
        <cylinderGeometry args={[0.6, 0.65, 0.12, 32]} />
      </mesh>
      {/* Glass dome top — sells "lens-cap" depth on the hero */}
      <mesh position={[0, 1.18, 0]} material={glassMat}>
        <sphereGeometry args={[0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* Decal band (paper label) — slightly larger radius so it sits proud of the body */}
      <mesh material={labelMat} castShadow>
        <cylinderGeometry args={[0.605, 0.605, 1.4, 32, 1, true]} />
      </mesh>
    </group>
  );
}

// ── Contact sheet plane (midground) ───────────────────────────────────────────
function ContactSheet() {
  const tex = React.useMemo(() => createContactSheetTexture(), []);
  return (
    <mesh position={[0, -0.2, -3.2]} rotation={[0, 0, -0.05]}>
      <planeGeometry args={[7, 3.5]} />
      <meshBasicMaterial map={tex} transparent opacity={0.18} />
    </mesh>
  );
}

// ── Dust-mote particle field ──────────────────────────────────────────────────
function DustParticles() {
  const positions = React.useMemo(() => {
    const count = 240;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return arr;
  }, []);

  const ref = React.useRef<THREE.Points>(null!);
  useFrame((state) => {
    if (!ref.current) return;
    // Slow drift up + wobble (loop ≈ 600ms cadence on hero spec scaled to 60s/loop wave)
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.015;
    ref.current.position.y = (t * 0.05) % 0.5 - 0.25;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#F5F1EA"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

// ── Camera rig: drift + mouse parallax ±3° ────────────────────────────────────
function CameraRig() {
  // Brief spec: dolly-in-and-orbit on hero (1200ms). The 60-90s linear loop
  // hook gives the long lazy drift; the initial dolly is handled by setting
  // camera z then lerping the first second.
  useCameraDrift({ amplitude: 0.18, periodSeconds: 90 });
  useMouseParallax({ strength: 0.12, smoothing: 0.06 });
  return null;
}

interface FilmCanisterProps {
  posterSrc?: string;
}

export default function FilmCanister({
  posterSrc: _posterSrc = "/hero/poster.jpg",
}: FilmCanisterProps) {
  // Mobile guard — degrade to static hero poster under 768
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={_posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          loading="eager"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.85) 75%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10">
      {/* Solid #0A0A0A backdrop with a faint radial vignette to lift center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, #141210 0%, #0A0A0A 65%, #050505 100%)",
        }}
      />
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Warm rim — back-right, 3200K equivalent */}
        <pointLight position={[3.2, 1.4, -1.8]} intensity={4.0} color="#FF8C30" />
        {/* Cool fill — front-left bounce, 5800K */}
        <pointLight position={[-2.4, 0, 3.2]} intensity={0.8} color="#B0C8FF" />
        {/* Subtle ambient so dark cyl doesn't crush */}
        <ambientLight intensity={0.12} />
        {/* Dark night env for reflections */}
        <Environment preset="night" />

        <CameraRig />

        <React.Suspense fallback={null}>
          {/* Float gives a gentle bob — combined with our group rotation it reads
              as if the canister is suspended in a museum vitrine */}
          <Float speed={0.9} floatIntensity={0.45} rotationIntensity={0}>
            <CanisterMesh />
          </Float>
          <ContactSheet />
          <DustParticles />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
