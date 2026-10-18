/* eslint-disable react/no-unknown-property */
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PlayerModel({
  position,
  rotationY = 0,
  isMoving = false,
  showMarker = false,
}) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const markerRef = useRef();

  const leftShoulder = useRef();
  const leftElbow = useRef();
  const rightShoulder = useRef();
  const rightElbow = useRef();

  const leftHip = useRef();
  const leftKnee = useRef();
  const rightHip = useRef();
  const rightKnee = useRef();

  const animTime = useRef(0);

  useFrame((state, delta) => {
    if (!bodyRef.current) return;

    // تحريك العلامة المضيئة فوق رأس اللاعب (للمرشد)
    if (markerRef.current) {
      const t = state.clock.getElapsedTime();
      markerRef.current.rotation.y = t * 2.5;
      markerRef.current.position.y = 4.2 + Math.sin(t * 4) * 0.25; // يرتفع فوق مستوى الأشجار
    }

    if (groupRef.current) {
      let currentRot = groupRef.current.rotation.y;
      let diff = rotationY - currentRot;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      groupRef.current.rotation.y += diff * Math.min(1, delta * 12);
    }

    if (isMoving) {
      animTime.current += delta * 13;
      const t = animTime.current;

      bodyRef.current.position.y = Math.abs(Math.sin(t)) * 0.09;
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyRef.current.rotation.x,
        0.22,
        delta * 10,
      );
      bodyRef.current.rotation.y = Math.cos(t) * 0.12;
      bodyRef.current.rotation.z = Math.sin(t) * 0.05;

      if (headRef.current) {
        headRef.current.rotation.x = -0.15 + Math.sin(t * 2) * 0.04;
        headRef.current.rotation.y = -Math.cos(t) * 0.08;
      }

      const armSwing = Math.sin(t) * 0.95;
      if (leftShoulder.current && leftElbow.current) {
        leftShoulder.current.rotation.x = armSwing;
        leftShoulder.current.rotation.z = 0.1;
        leftElbow.current.rotation.x = -0.65 - Math.max(0, armSwing) * 0.5;
      }
      if (rightShoulder.current && rightElbow.current) {
        rightShoulder.current.rotation.x = -armSwing;
        rightShoulder.current.rotation.z = -0.1;
        rightElbow.current.rotation.x = -0.65 - Math.max(0, -armSwing) * 0.5;
      }

      const legSwing = Math.sin(t) * 1.05;
      if (leftHip.current && leftKnee.current) {
        leftHip.current.rotation.x = -legSwing;
        leftKnee.current.rotation.x = Math.max(0, Math.sin(t - 0.6)) * 1.25;
      }
      if (rightHip.current && rightKnee.current) {
        rightHip.current.rotation.x = legSwing;
        rightKnee.current.rotation.x =
          Math.max(0, Math.sin(t + Math.PI - 0.6)) * 1.25;
      }
    } else {
      animTime.current += delta * 2.5;
      const idleT = animTime.current;
      const lerpSpeed = delta * 8;

      bodyRef.current.position.y = THREE.MathUtils.lerp(
        bodyRef.current.position.y,
        Math.sin(idleT) * 0.015,
        lerpSpeed,
      );
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyRef.current.rotation.x,
        0,
        lerpSpeed,
      );
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(
        bodyRef.current.rotation.y,
        0,
        lerpSpeed,
      );
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(
        bodyRef.current.rotation.z,
        0,
        lerpSpeed,
      );

      if (headRef.current) {
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          Math.sin(idleT) * 0.03,
          lerpSpeed,
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          0,
          lerpSpeed,
        );
      }

      if (leftShoulder.current && leftElbow.current) {
        leftShoulder.current.rotation.x = THREE.MathUtils.lerp(
          leftShoulder.current.rotation.x,
          0,
          lerpSpeed,
        );
        leftShoulder.current.rotation.z = THREE.MathUtils.lerp(
          leftShoulder.current.rotation.z,
          0.05,
          lerpSpeed,
        );
        leftElbow.current.rotation.x = THREE.MathUtils.lerp(
          leftElbow.current.rotation.x,
          -0.15,
          lerpSpeed,
        );
      }
      if (rightShoulder.current && rightElbow.current) {
        rightShoulder.current.rotation.x = THREE.MathUtils.lerp(
          rightShoulder.current.rotation.x,
          0,
          lerpSpeed,
        );
        rightShoulder.current.rotation.z = THREE.MathUtils.lerp(
          rightShoulder.current.rotation.z,
          -0.05,
          lerpSpeed,
        );
        rightElbow.current.rotation.x = THREE.MathUtils.lerp(
          rightElbow.current.rotation.x,
          -0.15,
          lerpSpeed,
        );
      }
      if (leftHip.current && leftKnee.current) {
        leftHip.current.rotation.x = THREE.MathUtils.lerp(
          leftHip.current.rotation.x,
          0,
          lerpSpeed,
        );
        leftKnee.current.rotation.x = THREE.MathUtils.lerp(
          leftKnee.current.rotation.x,
          0,
          lerpSpeed,
        );
      }
      if (rightHip.current && rightKnee.current) {
        rightHip.current.rotation.x = THREE.MathUtils.lerp(
          rightHip.current.rotation.x,
          0,
          lerpSpeed,
        );
        rightKnee.current.rotation.x = THREE.MathUtils.lerp(
          rightKnee.current.rotation.x,
          0,
          lerpSpeed,
        );
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={showMarker ? 1.35 : 1}>
      {/* --- علامة إرشادية مضيئة تظهر للمرشد فقط فوق الأشجار --- */}
      {/* --- علامة إرشادية وبوصلة اتجاه تطير فوق مستوى الأشجار للمرشد --- */}
      {showMarker && (
        <group>
          {/* ماسة صفراء مضيئة تدور في الأعلى للفت الانتباه */}
          <mesh ref={markerRef} position={[0, 4.4, 0]}>
            <octahedronGeometry args={[0.35, 0]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>

          {/* عمود ليزر خفيف يربط العلامة العلوية برأس اللاعب تحت الشجر */}
          <mesh position={[0, 2.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3.6, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
          </mesh>

          {/* --- بوصلة الاتجاه العلوية (فوق الأشجار بارتفاع 3.6) --- */}
          {/* حلقة صفراء تحيط بالعمود من الأعلى */}
          <mesh position={[0, 3.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.55, 24]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
          </mesh>

          {/* سهم أحمر كبير وبارز فوق الشجر يشير لاتجاه وجه اللاعب بدقة */}
          <group position={[0, 3.6, 0]}>
            {/* جسم السهم */}
            <mesh position={[0, 0, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
              <meshBasicMaterial color="#ff2a2a" />
            </mesh>
            {/* رأس السهم المدبب */}
            <mesh position={[0, 0, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.28, 0.55, 4]} />
              <meshBasicMaterial color="#ff2a2a" />
            </mesh>
          </group>
        </group>
      )}

      <group ref={bodyRef}>
        {/* --- الجذع --- */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.28, 8, 16]} />
          <meshStandardMaterial color="#e63946" roughness={0.6} />
        </mesh>

        {/* حقيبة ظهر */}
        <mesh position={[0, 0.64, -0.15]} castShadow>
          <boxGeometry args={[0.24, 0.3, 0.12]} />
          <meshStandardMaterial color="#6c584c" roughness={0.8} />
        </mesh>

        {/* --- الرأس --- */}
        <group ref={headRef} position={[0, 0.92, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#f4a261" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.18, 0.02]} castShadow>
            <boxGeometry args={[0.25, 0.08, 0.28]} />
            <meshStandardMaterial color="#1d3557" roughness={0.7} />
          </mesh>
        </group>

        {/* --- الذراع الأيسر --- */}
        <group ref={leftShoulder} position={[-0.2, 0.78, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
            <meshStandardMaterial color="#e63946" roughness={0.6} />
          </mesh>
          <group ref={leftElbow} position={[0, -0.22, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.04, 0.15, 6, 12]} />
              <meshStandardMaterial color="#f4a261" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* --- الذراع الأيمن --- */}
        <group ref={rightShoulder} position={[0.2, 0.78, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
            <meshStandardMaterial color="#e63946" roughness={0.6} />
          </mesh>
          <group ref={rightElbow} position={[0, -0.22, 0]}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.04, 0.15, 6, 12]} />
              <meshStandardMaterial color="#f4a261" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* --- الرجل اليسرى --- */}
        <group ref={leftHip} position={[-0.09, 0.42, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </mesh>
          <group ref={leftKnee} position={[0, -0.22, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
              <meshStandardMaterial color="#1d3557" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, 0.04]} castShadow>
              <boxGeometry args={[0.1, 0.07, 0.16]} />
              <meshStandardMaterial color="#2b2d42" />
            </mesh>
          </group>
        </group>

        {/* --- الرجل اليمنى --- */}
        <group ref={rightHip} position={[0.09, 0.42, 0]}>
          <mesh position={[0, -0.11, 0]} castShadow>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial color="#1d3557" roughness={0.8} />
          </mesh>
          <group ref={rightKnee} position={[0, -0.22, 0]}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <capsuleGeometry args={[0.045, 0.15, 6, 12]} />
              <meshStandardMaterial color="#1d3557" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, 0.04]} castShadow>
              <boxGeometry args={[0.1, 0.07, 0.16]} />
              <meshStandardMaterial color="#2b2d42" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
