import React, { Suspense, useEffect, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import './styles.css'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { useControls } from 'leva'
/*

inspired by https://twitter.com/yeemachine/status/1414993821583118341

*/

const Avatar = () => {
  const { leftShoulder, rightShoulder } = useControls({
    leftShoulder: { value: 0, min: -1, max: 1 },
    rightShoulder: { value: 0, min: -1, max: 1 }
  })
  const { scene, camera } = useThree()
  const gltf = useGLTF('/three-vrm-girl.vrm')
  const avatar = useRef<VRM>()
  const [bonesStore, setBones] = useState<{ [part: string]: Object3D }>({})

  useEffect(() => {
    if (gltf) {
      VRMUtils.removeUnnecessaryJoints(gltf.scene)
      VRM.from(gltf as GLTF).then((vrm) => {
        avatar.current = vrm
        vrm.lookAt.target = camera
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI

        const bones = {
          neck: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck),
          hips: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips),
          LeftShoulder: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftShoulder),
          RightShoulder: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightShoulder)
        }

        // bones.RightShoulder.rotation.z = -Math.PI / 4

        setBones(bones)
      })
    }
  }, [scene, gltf, camera])

  useFrame(({ clock }, delta) => {
    if (avatar.current) {
      avatar.current.update(delta)
    }
    if (bonesStore.neck) {
      const t = clock.getElapsedTime()
      bonesStore.neck.rotation.y = (Math.PI / 4) * Math.sin(t * Math.PI)
    }
    if (bonesStore.LeftShoulder) {
      bonesStore.LeftShoulder.position.y = leftShoulder
      bonesStore.LeftShoulder.rotation.z = leftShoulder * Math.PI
    }
    if (bonesStore.RightShoulder) {
      bonesStore.RightShoulder.rotation.z = rightShoulder * Math.PI
    }
  })
  return <primitive object={gltf.scene}></primitive>
}

ReactDOM.render(
  <Canvas>
    <OrbitControls />
    <spotLight position={[0, 2, -1]} intensity={0.4} />
    <ambientLight intensity={0.65} />
    <Suspense fallback={null}>
      <Avatar />
    </Suspense>
  </Canvas>,
  document.getElementById('root')
)
