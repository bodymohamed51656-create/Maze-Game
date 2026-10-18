/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PlayerModel from './PlayerModel';

export default function RunnerPlayer({ mazeData, startX, startZ, socket, roomId }) {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });
  const [isMoving, setIsMoving] = useState(false);
  const [playerPos, setPlayerPos] = useState([startX, -0.5, startZ]);
  const [playerRotation, setPlayerRotation] = useState(0);

  const posRef = useRef({ x: startX, z: startZ });
  // زاوية اتجاه اللاعب (تبدأ بـ 0)
  const rotRef = useRef(0);
  // زاوية الكاميرا لتتبع اللاعب بنعومة
  const camAngleRef = useRef(0);

  const lastSentPos = useRef({ x: startX, z: startZ });
  const lastSentRot = useRef(0);
  const wasMovingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setMovement(m => ({ ...m, forward: true }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setMovement(m => ({ ...m, backward: true }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setMovement(m => ({ ...m, left: true }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setMovement(m => ({ ...m, right: true }));
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setMovement(m => ({ ...m, forward: false }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setMovement(m => ({ ...m, backward: false }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setMovement(m => ({ ...m, left: false }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setMovement(m => ({ ...m, right: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // ضبط الكاميرا في البداية خلف اللاعب
    camera.position.set(startX, 1.1, startZ - 0.85);
    camera.lookAt(startX, 0.4, startZ);

    // إرسال الموقع الابتدائي فوراً للسيرفر ليظهر عند المرشد
    socket.emit('move', { 
      roomId, 
      newPos: { x: startX, z: startZ }, 
      rotationY: 0, 
      isMoving: false 
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, startX, startZ]);

  const checkCollision = (x, z) => {
    const rows = mazeData.length;
    const cols = mazeData[0].length;
    const offsetX = cols / 2;
    const offsetZ = rows / 2;
    
    const radius = 0.2;
    const points = [
      [x + radius, z + radius],
      [x - radius, z + radius],
      [x + radius, z - radius],
      [x - radius, z - radius],
    ];

    for (const [px, pz] of points) {
      const gridX = Math.floor(px + offsetX);
      const gridZ = Math.floor(pz + offsetZ);
      if (gridZ < 0 || gridZ >= rows || gridX < 0 || gridX >= cols) return true;
      if (mazeData[gridZ][gridX] === 1) return true;
    }
    return false;
  };

  useFrame((state, delta) => {
    const moveSpeed = 2.8 * delta; // سرعة الجري
    const turnSpeed = 2.6 * delta; // سرعة الدوران يمين وشمال

    // 1. الدوران بالضغط على A/D أو سهم يمين/شمال
    if (movement.left) {
      rotRef.current += turnSpeed;
    }
    if (movement.right) {
      rotRef.current -= turnSpeed;
    }

    // تحديث زاوية دوران الشخصية
    setPlayerRotation(rotRef.current);

    // 2. حساب اتجاه وجه اللاعب الحالي
    const forwardX = Math.sin(rotRef.current);
    const forwardZ = Math.cos(rotRef.current);

    let nextX = posRef.current.x;
    let nextZ = posRef.current.z;

    // تشغيل أنيمايشن الجري عند التحرك أو الدوران
    const hasMovement = movement.forward || movement.backward || movement.left || movement.right;
    if (hasMovement !== isMoving) {
      setIsMoving(hasMovement);
    }

    // 3. التقدم للأمام أو الرجوع للخلف بـ W/S أو سهم فوق/تحت
    if (movement.forward || movement.backward) {
      const dir = movement.forward ? 1 : -0.7; // الرجوع للخلف أبطأ قليلاً بواقعية
      const stepX = forwardX * moveSpeed * dir;
      const stepZ = forwardZ * moveSpeed * dir;

      if (!checkCollision(nextX + stepX, nextZ)) nextX += stepX;
      if (!checkCollision(nextX, nextZ + stepZ)) nextZ += stepZ;
      posRef.current = { x: nextX, z: nextZ };
    }

    // تحديث موقع الشخصية على الأرض
    setPlayerPos([nextX, -0.5, nextZ]);

    // 4. تحريك ودوران الكاميرا تلقائياً خلف ظهر اللاعب بنعومة
    // الكاميرا تلحق زاوية دوران اللاعب بسلاسة (Smooth Camera Follow)
    camAngleRef.current = THREE.MathUtils.lerp(camAngleRef.current, rotRef.current, Math.min(1, delta * 8));

    const camBackX = Math.sin(camAngleRef.current);
    const camBackZ = Math.cos(camAngleRef.current);

    const camDistance = 0.85; // المسافة خلف ظهر اللاعب
    const camHeight = 1.05;   // ارتفاع الكاميرا

    const targetCamPos = new THREE.Vector3(
      nextX - camBackX * camDistance,
      camHeight,
      nextZ - camBackZ * camDistance
    );

    camera.position.lerp(targetCamPos, Math.min(1, delta * 15));

    // جعل الكاميرا تنظر دائماً إلى الأمام في نفس اتجاه اللاعب
    camera.lookAt(
      nextX + forwardX * 2,
      0.35,
      nextZ + forwardZ * 2
    );

    // 5. إرسال الموقع والدوران للسيرفر (ليظهر عند المرشد)
    const movedEnough = Math.abs(lastSentPos.current.x - nextX) > 0.03 || Math.abs(lastSentPos.current.z - nextZ) > 0.03;
    const rotatedEnough = Math.abs(lastSentRot.current - rotRef.current) > 0.05;
    const stateChanged = wasMovingRef.current !== hasMovement;

    if (movedEnough || rotatedEnough || stateChanged) {
      lastSentPos.current = { x: nextX, z: nextZ };
      lastSentRot.current = rotRef.current;
      wasMovingRef.current = hasMovement;
      socket.emit('move', { 
        roomId, 
        newPos: lastSentPos.current, 
        rotationY: rotRef.current, 
        isMoving: hasMovement 
      });
    }
  });

  return (
    <PlayerModel position={playerPos} rotationY={playerRotation} isMoving={isMoving} />
  );
}