import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './Avatar3D.css';

// ── Bone configuration for humanoid skeleton ──
const BONE_NAMES = {
  // Spine
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Chest',
  neck: 'Neck',
  head: 'Head',
  // Right arm
  rightShoulder: 'RightShoulder',
  rightUpperArm: 'RightUpperArm',
  rightLowerArm: 'RightLowerArm',
  rightHand: 'RightHand',
  // Left arm
  leftShoulder: 'LeftShoulder',
  leftUpperArm: 'LeftUpperArm',
  leftLowerArm: 'LeftLowerArm',
  leftHand: 'LeftHand',
};

// ── Sign animation keyframes ──
// Each sign is a list of keyframe poses with bone rotations (Euler angles in radians)
const SIGN_ANIMATIONS = {
  HELLO: {
    duration: 1.5,
    frames: [
      {
        time: 0,
        bones: {
          rightUpperArm: [0, 0, -1.2],
          rightLowerArm: [0, 0, -0.5],
          rightHand: [0, 0, 0.3],
        },
      },
      {
        time: 0.3,
        bones: {
          rightUpperArm: [0, 0, -1.4],
          rightLowerArm: [0, 0.3, -0.3],
          rightHand: [0, 0.4, 0.3],
        },
      },
      {
        time: 0.6,
        bones: {
          rightUpperArm: [0, 0, -1.2],
          rightLowerArm: [0, -0.3, -0.5],
          rightHand: [0, -0.4, 0.3],
        },
      },
      {
        time: 0.9,
        bones: {
          rightUpperArm: [0, 0, -1.4],
          rightLowerArm: [0, 0.3, -0.3],
          rightHand: [0, 0.4, 0.3],
        },
      },
      {
        time: 1.2,
        bones: {
          rightUpperArm: [0, 0, -1.2],
          rightLowerArm: [0, 0, -0.5],
          rightHand: [0, 0, 0.3],
        },
      },
    ],
  },
  'THANK-YOU': {
    duration: 1.2,
    frames: [
      { time: 0, bones: { rightUpperArm: [0.3, 0, -0.8], rightLowerArm: [-0.5, 0, 0], rightHand: [-0.3, 0, 0] } },
      { time: 0.4, bones: { rightUpperArm: [0.5, 0, -0.6], rightLowerArm: [-0.2, 0, 0.3], rightHand: [-0.1, 0, 0.2] } },
      { time: 0.8, bones: { rightUpperArm: [0.3, 0, -0.4], rightLowerArm: [0, 0, 0.5], rightHand: [0.1, 0, 0.3] } },
    ],
  },
  YES: {
    duration: 1.0,
    frames: [
      { time: 0, bones: { rightUpperArm: [0, 0, -0.8], rightLowerArm: [-1.2, 0, 0], rightHand: [0, 0, 0] } },
      { time: 0.25, bones: { rightUpperArm: [0, 0, -0.8], rightLowerArm: [-1.2, 0, 0], rightHand: [-0.4, 0, 0] } },
      { time: 0.5, bones: { rightUpperArm: [0, 0, -0.8], rightLowerArm: [-1.2, 0, 0], rightHand: [0.1, 0, 0] } },
      { time: 0.75, bones: { rightUpperArm: [0, 0, -0.8], rightLowerArm: [-1.2, 0, 0], rightHand: [-0.4, 0, 0] } },
    ],
  },
  NO: {
    duration: 1.0,
    frames: [
      { time: 0, bones: { rightUpperArm: [0, 0, -1.0], rightLowerArm: [-0.8, 0, 0], rightHand: [0, 0, 0] } },
      { time: 0.25, bones: { rightUpperArm: [0, 0, -1.0], rightLowerArm: [-0.8, 0.5, 0], rightHand: [0, 0, 0] } },
      { time: 0.5, bones: { rightUpperArm: [0, 0, -1.0], rightLowerArm: [-0.8, -0.5, 0], rightHand: [0, 0, 0] } },
      { time: 0.75, bones: { rightUpperArm: [0, 0, -1.0], rightLowerArm: [-0.8, 0.5, 0], rightHand: [0, 0, 0] } },
    ],
  },
  ME: {
    duration: 0.8,
    frames: [
      { time: 0, bones: { rightUpperArm: [0.4, 0, -0.3], rightLowerArm: [-1.0, 0, 0.3], rightHand: [0, 0, 0] } },
      { time: 0.3, bones: { rightUpperArm: [0.4, 0, -0.2], rightLowerArm: [-1.2, 0, 0.4], rightHand: [-0.2, 0, 0] } },
      { time: 0.6, bones: { rightUpperArm: [0.4, 0, -0.3], rightLowerArm: [-1.0, 0, 0.3], rightHand: [0, 0, 0] } },
    ],
  },
  YOU: {
    duration: 0.8,
    frames: [
      { time: 0, bones: { rightUpperArm: [0, 0, -0.5], rightLowerArm: [-0.8, 0, 0], rightHand: [0, 0, 0] } },
      { time: 0.3, bones: { rightUpperArm: [0.3, 0, -0.5], rightLowerArm: [-0.3, 0, 0.2], rightHand: [0, 0, 0] } },
      { time: 0.6, bones: { rightUpperArm: [0, 0, -0.5], rightLowerArm: [-0.8, 0, 0], rightHand: [0, 0, 0] } },
    ],
  },
  LOVE: {
    duration: 1.2,
    frames: [
      { time: 0, bones: { rightUpperArm: [0.5, 0, -0.3], leftUpperArm: [-0.5, 0, 0.3], rightLowerArm: [-1.0, 0, 0.3], leftLowerArm: [1.0, 0, -0.3] } },
      { time: 0.4, bones: { rightUpperArm: [0.3, 0, -0.2], leftUpperArm: [-0.3, 0, 0.2], rightLowerArm: [-1.2, 0, 0.5], leftLowerArm: [1.2, 0, -0.5] } },
      { time: 0.8, bones: { rightUpperArm: [0.5, 0, -0.3], leftUpperArm: [-0.5, 0, 0.3], rightLowerArm: [-1.0, 0, 0.3], leftLowerArm: [1.0, 0, -0.3] } },
    ],
  },
};

// Generate alphabet animations (single hand raised, pointing)
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((letter) => {
  if (!SIGN_ANIMATIONS[letter]) {
    const angleOffset = (letter.charCodeAt(0) - 65) * 0.05;
    SIGN_ANIMATIONS[letter] = {
      duration: 0.8,
      frames: [
        {
          time: 0,
          bones: {
            rightUpperArm: [0, 0, -1.3 - angleOffset * 0.1],
            rightLowerArm: [-0.6 - angleOffset * 0.05, 0, 0],
            rightHand: [angleOffset * 0.3, angleOffset * 0.2, 0],
          },
        },
        {
          time: 0.4,
          bones: {
            rightUpperArm: [0, 0, -1.4 - angleOffset * 0.1],
            rightLowerArm: [-0.5 - angleOffset * 0.05, 0, 0],
            rightHand: [angleOffset * 0.3, angleOffset * 0.2, 0.1],
          },
        },
      ],
    };
  }
});


// ── Procedural humanoid skeleton ──
function createHumanoidSkeleton() {
  const bones = [];
  const boneLookup = {};

  function addBone(name, parent, position) {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(...position);
    if (parent) parent.add(bone);
    bones.push(bone);
    boneLookup[name] = bone;
    return bone;
  }

  // Build skeleton hierarchy
  const hips = addBone('Hips', null, [0, 0.95, 0]);
  const spine = addBone('Spine', hips, [0, 0.15, 0]);
  const chest = addBone('Chest', spine, [0, 0.2, 0]);
  const neck = addBone('Neck', chest, [0, 0.15, 0]);
  const head = addBone('Head', neck, [0, 0.12, 0]);

  // Right arm
  const rShoulder = addBone('RightShoulder', chest, [0.1, 0.12, 0]);
  const rUpperArm = addBone('RightUpperArm', rShoulder, [0.12, 0, 0]);
  const rLowerArm = addBone('RightLowerArm', rUpperArm, [0.25, 0, 0]);
  const rHand = addBone('RightHand', rLowerArm, [0.22, 0, 0]);

  // Left arm
  const lShoulder = addBone('LeftShoulder', chest, [-0.1, 0.12, 0]);
  const lUpperArm = addBone('LeftUpperArm', lShoulder, [-0.12, 0, 0]);
  const lLowerArm = addBone('LeftLowerArm', lUpperArm, [-0.25, 0, 0]);
  const lHand = addBone('LeftHand', lLowerArm, [-0.22, 0, 0]);

  // Right leg
  const rUpperLeg = addBone('RightUpperLeg', hips, [0.09, -0.05, 0]);
  const rLowerLeg = addBone('RightLowerLeg', rUpperLeg, [0, -0.4, 0]);
  const rFoot = addBone('RightFoot', rLowerLeg, [0, -0.4, 0.05]);

  // Left leg
  const lUpperLeg = addBone('LeftUpperLeg', hips, [-0.09, -0.05, 0]);
  const lLowerLeg = addBone('LeftLowerLeg', lUpperLeg, [0, -0.4, 0]);
  const lFoot = addBone('LeftFoot', lLowerLeg, [0, -0.4, 0.05]);

  const skeleton = new THREE.Skeleton(bones);
  return { skeleton, rootBone: hips, boneLookup };
}

// ── Skinned mesh (stylized human body) ──
function createHumanoidMesh(skeleton, rootBone) {
  // Body parts as separate geometries merged
  const bodyGroup = new THREE.Group();

  // Material
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x8B6914,
    roughness: 0.7,
    metalness: 0.1,
  });

  const clothMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.05,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0x22c55e,
    emissiveIntensity: 0.2,
  });

  // Head (sphere)
  const headGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.set(0, 1.6, 0);
  bodyGroup.add(headMesh);

  // Torso (capsule-like)
  const torsoGeo = new THREE.CapsuleGeometry(0.12, 0.3, 8, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, clothMat);
  torsoMesh.position.set(0, 1.25, 0);
  bodyGroup.add(torsoMesh);

  // Arms (cylinders)
  const armGeo = new THREE.CapsuleGeometry(0.03, 0.2, 4, 8);

  [-1, 1].forEach((side) => {
    const upperArm = new THREE.Mesh(armGeo, skinMat);
    upperArm.position.set(side * 0.22, 1.38, 0);
    upperArm.rotation.z = side * 0.15;
    bodyGroup.add(upperArm);

    const lowerArm = new THREE.Mesh(armGeo, skinMat);
    lowerArm.position.set(side * 0.38, 1.2, 0);
    lowerArm.rotation.z = side * 0.1;
    bodyGroup.add(lowerArm);

    // Hand (small sphere)
    const handGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const handMesh = new THREE.Mesh(handGeo, accentMat);
    handMesh.position.set(side * 0.5, 1.05, 0);
    bodyGroup.add(handMesh);
  });

  // Legs
  const legGeo = new THREE.CapsuleGeometry(0.05, 0.35, 4, 8);
  [-1, 1].forEach((side) => {
    const upperLeg = new THREE.Mesh(legGeo, clothMat);
    upperLeg.position.set(side * 0.08, 0.75, 0);
    bodyGroup.add(upperLeg);

    const lowerLeg = new THREE.Mesh(legGeo, clothMat);
    lowerLeg.position.set(side * 0.08, 0.35, 0);
    bodyGroup.add(lowerLeg);
  });

  return bodyGroup;
}


// ── Animated Avatar Component ──
function AvatarModel({ currentSign, isPlaying }) {
  const groupRef = useRef();
  const skeletonRef = useRef(null);
  const boneLookupRef = useRef({});
  const animTimeRef = useRef(0);
  const currentAnimRef = useRef(null);
  const idleTimeRef = useRef(0);

  // Build skeleton once
  useEffect(() => {
    if (!groupRef.current) return;

    const { skeleton, rootBone, boneLookup } = createHumanoidSkeleton();
    skeletonRef.current = skeleton;
    boneLookupRef.current = boneLookup;

    // Add root bone to group
    groupRef.current.add(rootBone);

    // Add visual mesh
    const mesh = createHumanoidMesh(skeleton, rootBone);
    groupRef.current.add(mesh);

    return () => {
      groupRef.current?.clear();
    };
  }, []);

  // Update animation when sign changes
  useEffect(() => {
    if (currentSign && SIGN_ANIMATIONS[currentSign.toUpperCase()]) {
      currentAnimRef.current = SIGN_ANIMATIONS[currentSign.toUpperCase()];
      animTimeRef.current = 0;
    } else {
      currentAnimRef.current = null;
    }
  }, [currentSign]);

  // Animation loop
  useFrame((_, delta) => {
    const boneLookup = boneLookupRef.current;
    if (!boneLookup || Object.keys(boneLookup).length === 0) return;

    if (currentAnimRef.current && isPlaying) {
      // Sign animation
      const anim = currentAnimRef.current;
      animTimeRef.current += delta;

      if (animTimeRef.current > anim.duration) {
        animTimeRef.current = 0; // loop
      }

      const t = animTimeRef.current;

      // Find surrounding keyframes
      const frames = anim.frames;
      let frameA = frames[0];
      let frameB = frames[frames.length - 1];
      let alpha = 0;

      for (let i = 0; i < frames.length - 1; i++) {
        if (t >= frames[i].time && t <= frames[i + 1].time) {
          frameA = frames[i];
          frameB = frames[i + 1];
          alpha = (t - frameA.time) / (frameB.time - frameA.time);
          break;
        }
      }

      // Interpolate bone rotations
      for (const [boneName, rotA] of Object.entries(frameA.bones)) {
        const bone = boneLookup[boneName];
        if (!bone) continue;

        const rotB = frameB.bones[boneName] || rotA;
        bone.rotation.x = THREE.MathUtils.lerp(rotA[0], rotB[0], alpha);
        bone.rotation.y = THREE.MathUtils.lerp(rotA[1], rotB[1], alpha);
        bone.rotation.z = THREE.MathUtils.lerp(rotA[2], rotB[2], alpha);
      }
    } else {
      // Idle breathing animation
      idleTimeRef.current += delta;
      const breathe = Math.sin(idleTimeRef.current * 1.5) * 0.02;

      const chest = boneLookup['Chest'];
      if (chest) {
        chest.rotation.x = breathe;
      }

      const head = boneLookup['Head'];
      if (head) {
        head.rotation.y = Math.sin(idleTimeRef.current * 0.5) * 0.03;
      }

      // Reset arm positions smoothly
      ['RightUpperArm', 'RightLowerArm', 'RightHand', 'LeftUpperArm', 'LeftLowerArm', 'LeftHand'].forEach((name) => {
        const bone = boneLookup[name];
        if (bone) {
          bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, 0, delta * 3);
          bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, 0, delta * 3);
          bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, 0, delta * 3);
        }
      });
    }
  });

  return <group ref={groupRef} position={[0, -1, 0]} />;
}


// ── Platform / Ground ──
function Platform() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <circleGeometry args={[0.8, 32]} />
      <meshStandardMaterial
        color="#1a1a2e"
        roughness={0.9}
        metalness={0.1}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

// ── Glow ring ──
function GlowRing({ isPlaying }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.3;
      ref.current.material.opacity = isPlaying ? 0.4 : 0.15;
    }
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
      <ringGeometry args={[0.6, 0.75, 64]} />
      <meshBasicMaterial
        color="#22c55e"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}


// ── Main Export ──
export default function Avatar3D({ currentSign, isPlaying = false, height = '500px' }) {
  return (
    <div className="avatar3d-container" style={{ height }} id="avatar-3d">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#22c55e" />

        <AvatarModel currentSign={currentSign} isPlaying={isPlaying} />
        <Platform />
        <GlowRing isPlaying={isPlaying} />

        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.3, 0]}
        />

        <fog attach="fog" args={['#0a0a0f', 3, 8]} />
      </Canvas>

      {currentSign && isPlaying && (
        <div className="avatar3d-label">
          Signing: <strong>{currentSign}</strong>
        </div>
      )}
    </div>
  );
}

// Export available animations for checking
export function hasSignAnimation(word) {
  return !!SIGN_ANIMATIONS[word?.toUpperCase()];
}

export { SIGN_ANIMATIONS };
