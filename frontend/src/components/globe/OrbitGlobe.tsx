import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { Satellite as SatelliteData } from "../../types/satellite";
import type { OrbitPoint } from "../../services/orbitService";

interface OrbitGlobeProps {
  satellite?: SatelliteData | null;
  orbit?: OrbitPoint[];
  satellites?: SatelliteData[];
}

/*
 * Convert geographic coordinates into a 3D position
 * on the Earth sphere.
 */
function latLonToVector3(
  latitude: number,
  longitude: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  const x =
    -radius *
    Math.sin(phi) *
    Math.cos(theta);

  const y =
    radius *
    Math.cos(phi);

  const z =
    radius *
    Math.sin(phi) *
    Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}


function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[1.7, 64, 64]} />

      <meshStandardMaterial
        color="#063b70"
        wireframe
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}


function OrbitRing({
  rotation,
  speed,
}: {
  rotation: [number, number, number];
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * speed;
    }
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      <mesh>
        <torusGeometry
          args={[2.15, 0.012, 16, 160]}
        />

        <meshBasicMaterial
          color="#00bfff"
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}


function RealSatellite({
  satellite,
  orbit,
  visualOffset,
}: {
  satellite: SatelliteData;
  orbit?: OrbitPoint[];
  visualOffset?: [number, number, number];
}) {
  const satelliteRef = useRef<THREE.Group>(null);

  const earthRadius = 6371;

  const fallbackPosition = useMemo(() => {
    const visualRadius =
      1.7 *
      ((earthRadius + satellite.altitude) / earthRadius);

    const position = latLonToVector3(
      satellite.latitude,
      satellite.longitude,
      visualRadius
    );

    if (visualOffset) {
      position.x += visualOffset[0];
      position.y += visualOffset[1];
      position.z += visualOffset[2];
    }

    return position;
  }, [
    satellite.latitude,
    satellite.longitude,
    satellite.altitude,
    visualOffset,
  ]);

  const orbitPositions = useMemo(() => {
    if (!orbit || orbit.length < 2) {
      return [];
    }

    return orbit.map((point) => {
      const visualRadius =
        1.7 *
        ((earthRadius + point.altitude) / earthRadius);

      return latLonToVector3(
        point.latitude,
        point.longitude,
        visualRadius
      );
    });
  }, [orbit]);

  useFrame((state) => {
    if (!satelliteRef.current) {
      return;
    }

    /*
     * Move along the REAL orbit returned
     * by the FastAPI backend.
     */
    if (
      orbit &&
      orbit.length >= 2 &&
      orbitPositions.length >= 2
    ) {
      const elapsed = state.clock.getElapsedTime();

      /*
       * Compress the 90-minute predicted orbit
       * into 90 seconds visually.
       */
      const animationDuration = 90;

      const progress =
        (elapsed % animationDuration) /
        animationDuration;

      const scaledPosition =
        progress * (orbitPositions.length - 1);

      const index = Math.floor(scaledPosition);

      const nextIndex = Math.min(
        index + 1,
        orbitPositions.length - 1
      );

      const fraction =
        scaledPosition - index;

      satelliteRef.current.position.lerpVectors(
        orbitPositions[index],
        orbitPositions[nextIndex],
        fraction
      );
    } else {
      /*
       * If orbit data is unavailable,
       * smoothly move to the current real position.
       */
      satelliteRef.current.position.lerp(
        fallbackPosition,
        0.08
      );
    }

    /*
     * Slowly rotate the satellite itself.
     */
    satelliteRef.current.rotation.y += 0.01;
  });

  return (
    <group
      ref={satelliteRef}
      position={fallbackPosition}
      scale={0.75}
    >
      {/* =========================
          SATELLITE MAIN BODY
         ========================= */}

      <mesh>
        <boxGeometry args={[0.22, 0.14, 0.16]} />

        <meshStandardMaterial
          color="#b8c4d0"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>


      {/* =========================
          GOLDEN FRONT PANEL
         ========================= */}

      <mesh position={[0, 0, 0.085]}>
        <boxGeometry args={[0.16, 0.10, 0.012]} />

        <meshStandardMaterial
          color="#d8a83e"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>


      {/* =========================
          LEFT SOLAR PANEL
         ========================= */}

      <mesh position={[-0.28, 0, 0]}>
        <boxGeometry args={[0.30, 0.12, 0.025]} />

        <meshStandardMaterial
          color="#123f75"
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>


      {/* Solar panel grid */}
      <mesh position={[-0.28, 0, 0.015]}>
        <boxGeometry args={[0.26, 0.09, 0.008]} />

        <meshBasicMaterial
          color="#00aaff"
        />
      </mesh>


      {/* =========================
          RIGHT SOLAR PANEL
         ========================= */}

      <mesh position={[0.28, 0, 0]}>
        <boxGeometry args={[0.30, 0.12, 0.025]} />

        <meshStandardMaterial
          color="#123f75"
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>


      {/* Solar panel grid */}
      <mesh position={[0.28, 0, 0.015]}>
        <boxGeometry args={[0.26, 0.09, 0.008]} />

        <meshBasicMaterial
          color="#00aaff"
        />
      </mesh>


      {/* =========================
          ANTENNA
         ========================= */}

      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry
          args={[0.012, 0.012, 0.18, 8]}
        />

        <meshStandardMaterial
          color="#d8dde5"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>


      {/* Antenna tip */}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />

        <meshBasicMaterial
          color="#00eaff"
        />
      </mesh>


      {/* =========================
          GLOW
         ========================= */}

      <pointLight
        position={[0, 0, 0]}
        intensity={1.5}
        distance={1.2}
        color="#00eaff"
      />
    </group>
  );
}

function RealOrbit({
  points,
}: {
  points: OrbitPoint[];
}) {
  const curvePoints = useMemo(() => {
    return points.map((point) =>
      latLonToVector3(
        point.latitude,
        point.longitude,
        1.7 * ((6371 + point.altitude) / 6371)
      )
    );
  }, [points]);

  const geometry = useMemo(() => {
    if (curvePoints.length < 2) {
      return null;
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);

    return new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(
        Math.max(100, curvePoints.length * 8)
      )
    );
  }, [curvePoints]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: "#00bfff",
      transparent: true,
      opacity: 0.8,
    });
  }, []);

  const line = useMemo(() => {
    if (!geometry) {
      return null;
    }

    return new THREE.Line(geometry, material);
  }, [geometry, material]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  if (!line) {
    return null;
  }

  return <primitive object={line} />;
}

function Scene({
  satellite,
  orbit,
  satellites,
}: {
  satellite?: SatelliteData | null;
  orbit?: OrbitPoint[];
  satellites?: SatelliteData[];
}) {
  return (
    <>
      <ambientLight intensity={1.2} />

      <pointLight
        position={[5, 5, 5]}
        intensity={20}
      />

      <Stars
        radius={80}
        depth={50}
        count={1200}
        factor={2}
        saturation={0}
        fade
        speed={0.3}
      />

      <Earth />

      {orbit && orbit.length > 1 && (
        <RealOrbit points={orbit} />
      )}

      <OrbitRing
        rotation={[0.4, 0.2, 0.3]}
        speed={0.08}
      />

      <OrbitRing
        rotation={[-0.6, 0.4, -0.2]}
        speed={-0.05}
      />

      <OrbitRing
        rotation={[1.1, 0.2, 0.8]}
        speed={0.04}
      />

      {satellites?.length ? (
        satellites.map((item, index) => {
          const overlappingIndex = satellites.findIndex(
            (other) =>
              other.name !== item.name &&
              Math.abs(other.latitude - item.latitude) < 0.1 &&
              Math.abs(other.longitude - item.longitude) < 0.1
          );

          const isOverlapping = overlappingIndex !== -1;

          const visualOffset: [number, number, number] =
            isOverlapping
              ? [
                  (index % 3 - 1) * 0.10,
                  (Math.floor(index / 3) % 3 - 1) * 0.10,
                  0,
                ]
              : [0, 0, 0];

          return (
            <RealSatellite
              key={item.name}
              satellite={item}
              visualOffset={visualOffset}
              orbit={
                satellite?.name === item.name
                  ? orbit
                  : undefined
              }
            />
          );
        })
      ) : satellite ? (
        <RealSatellite
          satellite={satellite}
          orbit={orbit}
        />
      ) : null}

      <OrbitControls
        enableRotate={true}
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        rotateSpeed={0.7}
        dampingFactor={0.08}
        enableDamping={true}
      />
    </>
  );
}


export default function OrbitGlobe({
  satellite,
  orbit,
  satellites,
}: OrbitGlobeProps) {
  return (
    <Canvas
      camera={{
        position: [0, 0, 5.5],
        fov: 45,
      }}
    >
      <Scene
        satellite={satellite}
        orbit={orbit}
        satellites={satellites}
      />
    </Canvas>
  );
}