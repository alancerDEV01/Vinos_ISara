"use client";

import { RoundedBox, Text } from "@react-three/drei";

/**
 * Marcador arquitectónico temporal. Será reemplazado por polígonos departamentales
 * proyectados desde data/geography/bolivia-departments.geojson.
 */
export function BoliviaMapPlaceholder() {
  return (
    <group rotation={[-0.25, 0, 0]}>
      <RoundedBox args={[4.2, 0.35, 5.4]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#5c4438" roughness={0.8} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[2.1, 0.48, 1.35]} position={[0.65, 0.35, -1.7]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#8e2638" emissive="#4b0f19" emissiveIntensity={0.65} />
      </RoundedBox>
      <Text position={[0.65, 0.62, -1.7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.28} color="#f4ead5">
        TARIJA
      </Text>
    </group>
  );
}
