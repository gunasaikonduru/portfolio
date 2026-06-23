import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, crystalGroup;
let innerMesh, outerMesh;
let container;

function init() {
  container = document.getElementById('three-hero-container');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 8;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true, // transparent background to blend with CSS gradient
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false; // Prevent page scroll interference
  controls.enablePan = false;
  controls.autoRotate = false;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Glowing Purple Light
  const purpleLight = new THREE.PointLight(0x9333ea, 4, 30);
  purpleLight.position.set(4, 4, 4);
  scene.add(purpleLight);

  // Glowing Cyan Light
  const cyanLight = new THREE.PointLight(0x00f5ff, 4, 30);
  cyanLight.position.set(-4, -4, 4);
  scene.add(cyanLight);

  // Directional highlight
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(0, 5, 2);
  scene.add(dirLight);

  // Crystal Group (for combined rotations and floating)
  crystalGroup = new THREE.Group();
  scene.add(crystalGroup);

  // Geometries
  // Inner: Icosahedron (12 faces)
  const innerGeometry = new THREE.IcosahedronGeometry(1.5, 0);
  // Outer: Slightly larger, subdivided Icosahedron for wireframe
  const outerGeometry = new THREE.IcosahedronGeometry(1.9, 1);

  // Materials
  // Physical material that simulates glass transmission and reflection
  const innerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9333ea,
    emissive: 0x1a022b,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.7, // glass transparency
    thickness: 1.5,
    ior: 1.6, // Index of refraction
    flatShading: true // Faceted crystal look
  });

  // Glowing neon wireframe
  const outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xec38bc,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
  });

  // Meshes
  innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);

  crystalGroup.add(innerMesh);
  crystalGroup.add(outerMesh);

  // Add small orbiting particles around the crystal
  const orbGeometry = new THREE.SphereGeometry(0.04, 8, 8);
  const orbMaterial = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  
  for (let i = 0; i < 3; i++) {
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    // Random offset
    orb.userData = {
      angle: (i * Math.PI * 2) / 3,
      speed: 0.5 + Math.random() * 0.5,
      radius: 2.2 + Math.random() * 0.4,
      yOffset: (Math.random() - 0.5) * 1.5
    };
    crystalGroup.add(orb);
  }

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onScroll);

  // Start Loop
  animate();

  // Dispatch event indicating hero 3D is initialized
  window.dispatchEvent(new CustomEvent('three-hero-ready'));
}

function onScroll() {
  const scrollY = window.scrollY;
  // Slowly rotate mesh group on scroll
  if (crystalGroup) {
    crystalGroup.rotation.y = scrollY * 0.003;
    // Push slightly on Z as user scrolls down
    crystalGroup.position.z = -Math.min(scrollY * 0.005, 3);
  }
}

function onWindowResize() {
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate(time) {
  requestAnimationFrame(animate);

  const t = time * 0.001 || 0; // seconds

  // Controls update
  controls.update();

  if (crystalGroup) {
    // 1. Hover/Float animation (sine wave)
    crystalGroup.position.y = Math.sin(t * 1.2) * 0.18;

    // 2. Faceted crystal rotation
    innerMesh.rotation.x = t * 0.12;
    innerMesh.rotation.y = t * 0.18;

    // 3. Outer wireframe counter-rotation
    outerMesh.rotation.x = -t * 0.08;
    outerMesh.rotation.y = -t * 0.10;

    // 4. Update orbiting particles
    crystalGroup.children.forEach(child => {
      if (child.userData && child.userData.angle !== undefined) {
        const u = child.userData;
        u.angle += 0.02 * u.speed;
        child.position.x = Math.cos(u.angle) * u.radius;
        child.position.z = Math.sin(u.angle) * u.radius;
        child.position.y = Math.sin(u.angle * 2) * 0.4 + u.yOffset;
      }
    });
  }

  renderer.render(scene, camera);
}

// Run init
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
