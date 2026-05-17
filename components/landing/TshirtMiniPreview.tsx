'use client'

import { useRef, useState, useEffect, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center, Environment } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = [
  '#f0f0f0', '#1e3a5f', '#2d4a3e', '#6b1f2a',
  '#e8dcc8', '#c0522a', '#7c6fa0', '#1a1a1a',
]

function SpinningShirt({ targetColor }: { targetColor: string }) {
  const { scene: rawScene } = useGLTF('/tshirt-sporty.glb')
  const scene = useMemo(() => rawScene.clone(true), [rawScene])
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null)
  const targetRef = useRef(new THREE.Color(targetColor))

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !matRef.current) {
        const mat = new THREE.MeshStandardMaterial({
          roughness: 0.9,
          metalness: 0,
          color: new THREE.Color(targetColor),
          side: THREE.DoubleSide,
        })
        child.material = mat
        matRef.current = mat
      }
    })
    return () => {
      matRef.current?.dispose()
      matRef.current = null
    }
  }, [scene])

  useEffect(() => {
    targetRef.current.set(targetColor)
  }, [targetColor])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5
    if (matRef.current) matRef.current.color.lerp(targetRef.current, delta * 2)
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={0.1} dispose={null} />
      </Center>
    </group>
  )
}

export function TshirtMiniPreview() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % COLORS.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 1.5, 7], fov: 35 }}>
      <color attach="background" args={['#111111']} />
      <hemisphereLight args={['#ffffff', '#888888', 1.0]} />
      <directionalLight position={[2, 4, 3]} intensity={0.3} />
      <directionalLight position={[-2, 4, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <SpinningShirt targetColor={COLORS[idx]} />
        <Environment preset="studio" environmentIntensity={0.4} />
      </Suspense>
    </Canvas>
  )
}
