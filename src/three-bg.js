import * as THREE from 'three';

// Global state
let scene, camera, renderer, particleGeometry, particlePoints;
let originalPositions = [];
let targetMouseX = 0;
let targetMouseY = 0;
let mouseX = 0;
let mouseY = 0;

// Initialize 3D Cosmic Particle Background
function init() {
  const canvas = document.getElementById('three-bg-canvas');
  if (!canvas) return;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050508, 0.008);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 80;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(scene.fog.color);

  // Create Glowing Particle Texture dynamically (no external images needed!)
  const particleTexture = createCircleTexture();

  // Create Particles
  const particleCount = 1500;
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Colors: Gradient from Indigo/Purple to Neon Pink/Cyan
  const color1 = new THREE.Color(0x9333ea); // Purple
  const color2 = new THREE.Color(0xec38bc); // Pink
  const color3 = new THREE.Color(0x00f5ff); // Cyan

  for (let i = 0; i < particleCount; i++) {
    // Spatial distribution in a spherical shell
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 40 + Math.random() * 80; // range between radius 40 and 120

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Save for mathematical animations
    originalPositions.push({ x, y, z, speed: 0.1 + Math.random() * 0.4, amp: 2 + Math.random() * 5 });

    // Assign mixed colors based on position
    let mixedColor;
    const rand = Math.random();
    if (rand < 0.4) {
      mixedColor = color1.clone().lerp(color2, Math.random());
    } else if (rand < 0.7) {
      mixedColor = color2.clone().lerp(color3, Math.random());
    } else {
      mixedColor = color3.clone().lerp(color1, Math.random());
    }

    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Particle Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    map: particleTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  // Points Mesh
  particlePoints = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particlePoints);

  // Event Listeners
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onScroll);

  // Start Animation
  animate();

  // Notify loader that background is ready
  window.dispatchEvent(new CustomEvent('three-bg-ready'));
}

// Generate circular glowing canvas texture
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Draw radial gradient
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Mouse Move Parallax Target
function onMouseMove(event) {
  // Normalize coordinates (-1 to 1)
  targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Adjust camera zoom/rotation based on scroll
function onScroll() {
  const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  // Rotate the star field based on scroll
  if (particlePoints) {
    particlePoints.rotation.y = scrollPct * Math.PI * 0.5;
    particlePoints.rotation.z = scrollPct * Math.PI * 0.2;
  }
}

// Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);

  const t = time * 0.001 || 0; // seconds

  // 1. Slow cosmic rotation
  if (particlePoints) {
    particlePoints.rotation.x = t * 0.02;
    // Add wave ripples to individual particles
    const positions = particleGeometry.attributes.position.array;
    for (let i = 0; i < originalPositions.length; i++) {
      const orig = originalPositions[i];
      // Wave function based on time and original position
      positions[i * 3 + 1] = orig.y + Math.sin(t * orig.speed + orig.x * 0.05) * orig.amp;
      positions[i * 3] = orig.x + Math.cos(t * orig.speed * 0.5 + orig.z * 0.05) * (orig.amp * 0.5);
    }
    particleGeometry.attributes.position.needsUpdate = true;
  }

  // 2. Smoothly interpolate mouse movement (lerp)
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // Move camera slightly based on mouse
  camera.position.x = mouseX * 25;
  camera.position.y = mouseY * 25;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

// Run init
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
