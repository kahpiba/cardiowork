'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Activity, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Heart, 
  ZoomIn, 
  ZoomOut, 
  Maximize2 
} from 'lucide-react';

interface Interactive3DHeartProps {
  initialBpm?: number;
  interactive?: boolean;
  compact?: boolean;
  className?: string;
  onBpmChange?: (bpm: number) => void;
}

export const Interactive3DHeart: React.FC<Interactive3DHeartProps> = ({
  initialBpm = 75,
  interactive = true,
  compact = false,
  className = '',
  onBpmChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bpm, setBpm] = useState(initialBpm);
  const [isRotating, setIsRotating] = useState(true);
  const [isBeating, setIsBeating] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(100);

  // References to keep Three.js camera & animation state
  const stateRef = useRef({
    bpm: initialBpm,
    isRotating: true,
    isBeating: true,
    cameraZ: 24,
    defaultZ: 24,
    minZ: 11, // Zoom in maksimal (close-up arteri & nodus)
    maxZ: 42, // Zoom out maksimal (wide view)
    setZoomCallback: (pct: number) => {},
    resetViewCallback: () => {},
    zoomStepCallback: (direction: 'in' | 'out') => {},
  });

  // Sinkronisasi state React ke ref loop animasi
  useEffect(() => {
    stateRef.current.bpm = bpm;
    stateRef.current.isRotating = isRotating;
    stateRef.current.isBeating = isBeating;
    onBpmChange?.(bpm);
  }, [bpm, isRotating, isBeating, onBpmChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = stateRef.current.defaultZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. Lighting (Warm Medical Clinical Glow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x0d9488, 2.5); // Teal light
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.8); // Warm Amber rim
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 50);
    pointLight.position.set(0, 0, 15);
    scene.add(pointLight);

    // 3. Mathematical Parametric Heart Mesh Generation
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // Membentuk koordinat jantung 3D halus
    const heartShape = new THREE.Shape();
    const x0 = 0, y0 = 0;
    heartShape.moveTo(x0, y0);
    heartShape.bezierCurveTo(x0, y0 + 3, x0 - 3.5, y0 + 6, x0 - 7, y0 + 6);
    heartShape.bezierCurveTo(x0 - 12, y0 + 6, x0 - 12, y0, x0 - 12, y0);
    heartShape.bezierCurveTo(x0 - 12, y0 - 6, x0 - 5, y0 - 11, x0, y0 - 16);
    heartShape.bezierCurveTo(x0 + 5, y0 - 11, x0 + 12, y0 - 6, x0 + 12, y0);
    heartShape.bezierCurveTo(x0 + 12, y0, x0 + 12, y0 + 6, x0 + 7, y0 + 6);
    heartShape.bezierCurveTo(x0 + 3.5, y0 + 6, x0, y0 + 3, x0, y0);

    const extrudeSettings = {
      depth: 4.5,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 4,
      bevelSize: 2.2,
      bevelThickness: 2.2,
    };

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeometry.center();

    // Material 1: Organic holographic surface
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0f766e), // Teal primer
      roughness: 0.25,
      metalness: 0.15,
      transmission: 0.35, // Efek tembus pandang biologis
      thickness: 1.8,
      reflectivity: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.scale.set(0.65, 0.65, 0.65);
    heartMesh.rotation.z = Math.PI; // Orientasi ujung ventrikel ke bawah
    heartGroup.add(heartMesh);

    // Material 2: Jaringan Arteri Koroner & SA Node (Cyber-Medical Wireframe Glow)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x5eead4),
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframeMesh = new THREE.Mesh(heartGeometry, wireframeMaterial);
    wireframeMesh.scale.set(0.655, 0.655, 0.655);
    wireframeMesh.rotation.z = Math.PI;
    heartGroup.add(wireframeMesh);

    // 4. Partikel Conduction System (Nodus SA & AV)
    const particleCount = 75;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 4.5;
      particlePositions[i] = Math.cos(theta) * r;
      particlePositions[i + 1] = Math.sin(theta) * r * 1.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x99f6e4,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    heartGroup.add(particleSystem);

    // 5. Interaktivitas Drag / Touch untuk Memutar 3D & Zoom In/Out
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let initialPinchDistance = 0;

    const updateZoomDisplay = () => {
      const pct = Math.round((stateRef.current.defaultZ / camera.position.z) * 100);
      setZoomPercent(pct);
    };

    // Zoom Step Helper (dipanggil dari tombol UI)
    stateRef.current.zoomStepCallback = (dir: 'in' | 'out') => {
      const step = 3;
      if (dir === 'in') {
        camera.position.z = Math.max(stateRef.current.minZ, camera.position.z - step);
      } else {
        camera.position.z = Math.min(stateRef.current.maxZ, camera.position.z + step);
      }
      updateZoomDisplay();
    };

    // Reset View Helper
    stateRef.current.resetViewCallback = () => {
      camera.position.z = stateRef.current.defaultZ;
      heartGroup.rotation.set(0, 0, 0);
      updateZoomDisplay();
    };

    // Wheel Event untuk Zoom In / Zoom Out dengan Mouse
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.02;
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z + zoomDelta,
        stateRef.current.minZ,
        stateRef.current.maxZ
      );
      updateZoomDisplay();
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        // Pinch start
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
        return;
      }

      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2) {
        // Pinch-to-zoom di tablet / smartphone
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);

        if (initialPinchDistance > 0) {
          const pinchDelta = (initialPinchDistance - currentDistance) * 0.05;
          camera.position.z = THREE.MathUtils.clamp(
            camera.position.z + pinchDelta,
            stateRef.current.minZ,
            stateRef.current.maxZ
          );
          updateZoomDisplay();
        }
        initialPinchDistance = currentDistance;
        return;
      }

      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - prevMouse.x;
      const deltaY = clientY - prevMouse.y;

      heartGroup.rotation.y += deltaX * 0.012;
      heartGroup.rotation.x += deltaY * 0.012;

      prevMouse = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
      initialPinchDistance = 0;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('mousedown', onPointerDown);
    domElem.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    domElem.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 6. Loop Animasi Denyut (Lub-Dub Cardiac Cycle)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentBpm = stateRef.current.bpm;
      const cycleDuration = 60 / currentBpm; // detik per detak
      const phase = (elapsedTime % cycleDuration) / cycleDuration; // 0 s.d. 1

      // Efek fisiologis denyut ganda (Atrial systole t=0.15, Ventricular systole t=0.32)
      let scaleMultiplier = 1.0;
      if (stateRef.current.isBeating) {
        if (phase < 0.18) {
          // Beat 1: Lub (Atrium)
          scaleMultiplier = 1.0 + Math.sin((phase / 0.18) * Math.PI) * 0.09;
        } else if (phase >= 0.22 && phase < 0.44) {
          // Beat 2: Dub (Ventrikel - lebih kuat)
          const p2 = (phase - 0.22) / 0.22;
          scaleMultiplier = 1.0 + Math.sin(p2 * Math.PI) * 0.16;
        } else {
          // Diastole (Relaksasi)
          scaleMultiplier = 1.0;
        }
      }

      // Terapkan denyut ke skala mesh
      heartMesh.scale.set(0.65 * scaleMultiplier, 0.65 * scaleMultiplier, 0.65 * scaleMultiplier);
      wireframeMesh.scale.set(0.655 * scaleMultiplier, 0.655 * scaleMultiplier, 0.655 * scaleMultiplier);

      // Rotasi kontinu halus jika diaktifkan dan tidak sedang di-drag
      if (stateRef.current.isRotating && !isDragging) {
        heartGroup.rotation.y += 0.008;
      }

      // Animasi partikel conduction
      particleSystem.rotation.y = heartGroup.rotation.y * -0.5;

      // Dinamika rona warna berdasarkan BPM
      if (currentBpm > 100) {
        heartMaterial.color.setHex(0xbe123c); // Rosewood / Takikardia
        wireframeMaterial.color.setHex(0xf43f5e);
      } else if (currentBpm >= 90) {
        heartMaterial.color.setHex(0xd97706); // Warm Amber / Batas Waspada
        wireframeMaterial.color.setHex(0xfbbf24);
      } else {
        heartMaterial.color.setHex(0x0f766e); // Deep Teal / Normal Stabil
        wireframeMaterial.color.setHex(0x5eead4);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('mousedown', onPointerDown);
      domElem.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      domElem.removeEventListener('touchstart', onPointerDown);
      domElem.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      heartGeometry.dispose();
      heartMaterial.dispose();
      wireframeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const getBpmStatus = (val: number) => {
    if (val < 60) return { label: 'Bradikardia (<60 bpm)', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (val <= 90) return { label: 'Irama Sinus Normal (60–90 bpm)', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    if (val <= 100) return { label: 'Batas Atas Waspada (91–100 bpm)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Takikardia Pre-Shift (>100 bpm)', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const status = getBpmStatus(bpm);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-72 sm:h-80 relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden rounded-2xl"
      >
        {/* Top-Right Floating Zoom Controls Toolbar */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-stone-200 shadow-2xs">
          <button
            onClick={() => stateRef.current.zoomStepCallback('in')}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition"
            title="Perbesar / Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => stateRef.current.zoomStepCallback('out')}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition"
            title="Perkecil / Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-mono font-bold text-stone-600 px-1">
            {zoomPercent}%
          </span>

          <button
            onClick={() => stateRef.current.resetViewCallback()}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition border-l border-stone-200 pl-1.5"
            title="Reset Sudut & Jarak Pandang"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom-Left Gesture Hints */}
        <div className="absolute bottom-2.5 left-3 text-[10px] text-stone-600 bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-200 pointer-events-none shadow-2xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
          <span>Putar 360&deg; (Drag) &bull; Zoom (Scroll/Pinch)</span>
        </div>
      </div>

      {/* Interactive Controls & Live BPM Dashboard */}
      {interactive && (
        <div className="w-full px-3 pt-2 space-y-2.5">
          {/* BPM Badge & Rhythm Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shadow-2xs">
                <Heart className="w-4 h-4 animate-heartbeat" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-stone-900 leading-none">{bpm}</span>
                  <span className="text-xs font-semibold text-stone-500">BPM</span>
                </div>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Quick BPM Preset Chips */}
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <span className="text-stone-500 font-medium">Simulasi Beban:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'Istirahat (65)', val: 65 },
                { label: 'Normal (80)', val: 80 },
                { label: 'Aktif (95)', val: 95 },
                { label: 'Stres (115)', val: 115 },
              ].map(preset => (
                <button
                  key={preset.val}
                  onClick={() => setBpm(preset.val)}
                  className={`px-2 py-0.5 rounded-lg border font-semibold transition ${
                    bpm === preset.val
                      ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                  isRotating
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title={isRotating ? 'Jeda Rotasi Otomatis' : 'Mulai Rotasi'}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin-slow' : ''}`} />
                <span>{isRotating ? 'Rotasi Aktif' : 'Rotasi Diam'}</span>
              </button>

              <button
                onClick={() => setIsBeating(!isBeating)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                  isBeating
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
                title={isBeating ? 'Jeda Denyut' : 'Mulai Denyut'}
              >
                {isBeating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isBeating ? 'Denyut Aktif' : 'Denyut Jeda'}</span>
              </button>
            </div>

            <span className="text-[10px] text-stone-400 font-mono">
              Three.js WebGL &bull; Conduction AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
