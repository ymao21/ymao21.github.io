/* ==========================================================
   Yining Mao — Portfolio Scripts
   1. Navbar behavior (scroll style + mobile menu)
   2. Scroll-reveal animations
   3. Three.js particle background (with mouse parallax)
   The Three.js part is wrapped in a safety check so the site
   still works perfectly even if the CDN fails to load.
   ========================================================== */

// Tell CSS that JavaScript is running (enables the fade-in animations).
// Without this class, all content is simply visible — a safe fallback.
document.body.classList.add('js');

/* ---------- 1. Navbar behavior ---------- */

const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// add background to navbar once you scroll past the top
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// mobile hamburger menu open/close
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// close the mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ---------- 2. Scroll-reveal animations ---------- */
// Elements with class "reveal" fade in when they enter the viewport.

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ---------- 3. Three.js particle background ---------- */
// Only runs if the Three.js library loaded successfully from the CDN.

if (typeof THREE !== 'undefined') {
  try {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,                                    // field of view
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,       // transparent background so CSS shows through
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // keep it light

    // --- Create the particles ---
    // Fewer particles on mobile so it stays fast
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 700 : 1600;

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 14; // spread in a 14-unit cube
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Purple particles
    const material = new THREE.PointsMaterial({
      color: 0x7c6cff,        // change particle color here
      size: 0.025,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // A second, sparser teal layer for depth
    const positions2 = new Float32Array(Math.floor(PARTICLE_COUNT / 3) * 3);
    for (let i = 0; i < positions2.length; i++) {
      positions2[i] = (Math.random() - 0.5) * 16;
    }
    const geometry2 = new THREE.BufferGeometry();
    geometry2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
    const material2 = new THREE.PointsMaterial({
      color: 0x4ecdc4,        // teal accent particles
      size: 0.02,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles2 = new THREE.Points(geometry2, material2);
    scene.add(particles2);

    // --- Mouse parallax ---
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      // convert mouse position to a -0.5 to 0.5 range
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    });

    // --- Animation loop ---
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // slow constant rotation
      particles.rotation.y = t * 0.04;
      particles2.rotation.y = -t * 0.03;
      particles.rotation.x = Math.sin(t * 0.1) * 0.05;

      // camera gently follows the mouse (the 0.05 = smoothing speed)
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();

    // keep canvas sized to the window
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  } catch (err) {
    // If anything goes wrong with the 3D background, the site still works.
    console.warn('Three.js background disabled:', err);
  }
}
