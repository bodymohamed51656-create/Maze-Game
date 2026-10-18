import React from 'react';

// 1. مكون لرسم شجرة كبيرة طبيعية (جذع بني وأوراق كثيفة)
function BigTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* جذع الشجرة */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.3, 2.4, 7]} />
        <meshStandardMaterial color="#5c4033" roughness={0.9} />
      </mesh>
      {/* طبقات أوراق الشجر */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.4, 3.1, 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#40916c" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[-0.3, 3.4, -0.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#52b788" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

// 2. مكون لرسم الحائط كأنه شجيرات طبيعية متداخلة
function HedgeWall({ position, hasTree }) {
  return (
    <group position={position}>
      {/* قلب الحائط الأخضر */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.7, 0.9]} />
        <meshStandardMaterial color="#1b4332" roughness={0.9} />
      </mesh>
      
      {/* كتل أوراق شجر طبيعية بارزة من كل الجهات */}
      <mesh position={[0, 0.4, 0]} scale={[1.2, 1, 1.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.15, 1.1, -0.15]} scale={[1.1, 0.9, 1.1]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#40916c" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[-0.15, 1.4, 0.15]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#52b788" roughness={0.9} flatShading />
      </mesh>

      {/* شجرة طويلة تخرج من بعض الحوائط */}
      {hasTree && <BigTree position={[0, -0.5, 0]} scale={0.95} />}
    </group>
  );
}

// 3. مكون تفاصيل الأرضية (أعشاب وصخور صغيرة في الممرات)
function PathDetails({ position, seed }) {
  return (
    <group position={position}>
      {seed > 0.65 && (
        <mesh position={[0.3, -0.45, 0.2]} rotation={[seed, seed, 0]} castShadow>
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#95a5a6" roughness={0.9} flatShading />
        </mesh>
      )}
      {seed < 0.45 && (
        <mesh position={[-0.25, -0.4, -0.2]} rotation={[0, seed * 5, 0]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#74c69d" roughness={0.8} />
        </mesh>
      )}
    </group>
  );
}

export default function Maze({ mazeData }) {
  if (!mazeData || mazeData.length === 0) return null;

  const rows = mazeData.length;
  const cols = mazeData[0].length;
  const offsetX = cols / 2;
  const offsetZ = rows / 2;

  return (
    <group>
      {/* أرضية الغابة العشبية الواسعة */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[cols + 40, rows + 40]} />
        <meshStandardMaterial color="#40916c" roughness={1} />
      </mesh>

      {/* رسم عناصر المتاهة */}
      {mazeData.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const x = colIndex - offsetX + 0.5;
          const z = rowIndex - offsetZ + 0.5;
          const pseudoRandom = ((rowIndex * 7 + colIndex * 13) % 10) / 10;

          // حائط شجري (1)
          if (cell === 1) {
            const hasTallTree = (rowIndex + colIndex) % 3 === 0;
            return (
              <HedgeWall 
                key={`${rowIndex}-${colIndex}`} 
                position={[x, 0, z]} 
                hasTree={hasTallTree} 
              />
            );
          }

          // ممر وممشى ترابي (0)
          if (cell === 0) {
            return (
              <group key={`${rowIndex}-${colIndex}`}>
                <mesh position={[x, -0.49, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[0.96, 0.96]} />
                  <meshStandardMaterial color="#a98467" roughness={1} />
                </mesh>
                <PathDetails position={[x, 0, z]} seed={pseudoRandom} />
              </group>
            );
          }

          // بوابة المخرج المضيئة (2)
          if (cell === 2) {
            return (
              <group key={`${rowIndex}-${colIndex}`} position={[x, 0, z]}>
                <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1, 1]} />
                  <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} />
                </mesh>
                <mesh position={[0, 1.5, 0]}>
                  <cylinderGeometry args={[0.35, 0.35, 4, 16]} />
                  <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
                </mesh>
              </group>
            );
          }

          return null;
        })
      )}
    </group>
  );
}