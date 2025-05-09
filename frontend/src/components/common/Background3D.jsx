import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const Background3D = () => {
  const mountRef = useRef(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 2000
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: '#2563eb',
      transparent: true,
      opacity: 0.8,
    })

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Position camera
    camera.position.z = 2

    // Mouse movement effect
    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5
      mouseY = event.clientY / window.innerHeight - 0.5
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)

      particlesMesh.rotation.x += 0.0005
      particlesMesh.rotation.y += 0.0005

      // Mouse movement effect
      particlesMesh.rotation.x += mouseY * 0.0005
      particlesMesh.rotation.y += mouseX * 0.0005

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      mountRef.current.removeChild(renderer.domElement)
      scene.remove(particlesMesh)
      particlesGeometry.dispose()
      particlesMaterial.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    />
  )
}

export default Background3D 