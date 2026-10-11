/**
 * Smart AgriTech — 3D Living Hydroponic Sprout Engine (Three.js WebGL)
 * 
 * Features:
 * - Perfectly flush seated root collar at the cube's top-face netpot socket (y = 66px)
 * - Elongated 78px gracefully curved 3D botanical stem (smooth Frenet-framed tapered tube)
 * - Lush, symmetrical 3D volumetric cupped leaves with glossy plant cuticle (clearcoat PBR)
 * - 3D liquid dewdrop locked to right leaf cup with glass refraction & specular glint
 * - Central tender apical bud shoot at the crown node
 * - Synchronized 1-to-1 3D mouse tracking, breathing sway, and click spring-bounce
 */

(function () {
  'use strict';

  let scene, camera, renderer;
  let canvas, container;
  let cubeAnchor, sproutRoot, stemMesh, leafLeftPivot, leafRightPivot, apicalBud, dewdrop;
  let isReady = false;
  let bounceVel = 0;
  let bouncePos = 0;
  let animClock = 0;

  // Procedural botanical leaf texture generator
  function createLeafTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext('2d');

    // Base background gradient (deep emerald at base to vibrant lime-leaf green)
    const bgGrad = ctx.createLinearGradient(0, 512, 0, 0);
    bgGrad.addColorStop(0, '#042f1a');
    bgGrad.addColorStop(0.20, '#15803d');
    bgGrad.addColorStop(0.55, '#22c55e');
    bgGrad.addColorStop(0.85, '#4ade80');
    bgGrad.addColorStop(1, '#86efac');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle leaf cuticle sheen glow in center
    const radialGlow = ctx.createRadialGradient(256, 260, 20, 256, 260, 230);
    radialGlow.addColorStop(0, 'rgba(240, 253, 244, 0.50)');
    radialGlow.addColorStop(0.5, 'rgba(134, 239, 172, 0.22)');
    radialGlow.addColorStop(1, 'rgba(21, 128, 61, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, 512, 512);

    // Main Midrib (Tulang Daun Utama)
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f0fdf4';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(256, 512);
    ctx.quadraticCurveTo(256, 256, 256, 16);
    ctx.stroke();

    // Secondary Lateral Veins (Tulang Daun Sekunder Melengkung)
    ctx.shadowBlur = 3;
    const veinLevels = [70, 140, 210, 280, 350, 420];
    veinLevels.forEach((y, idx) => {
      const spreadX = 145 - idx * 18;
      const targetY = y - 55;

      // Left vein
      ctx.lineWidth = 4.8 - idx * 0.45;
      ctx.strokeStyle = 'rgba(240, 253, 244, 0.90)';
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 - spreadX * 0.48, y - 20, 256 - spreadX, targetY);
      ctx.stroke();

      // Right vein
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 + spreadX * 0.48, y - 20, 256 + spreadX, targetY);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // Tapered 3D Tube Geometry Builder for graceful botanical stem
  function createTaperedTubeGeometry(curve, tubularSegments, radialSegments, radiusStart, radiusEnd) {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const frames = curve.computeFrenetFrames(tubularSegments, false);

    for (let i = 0; i <= tubularSegments; i++) {
      const u = i / tubularSegments;
      const point = curve.getPointAt(u);
      const radius = radiusStart * (1 - u) + radiusEnd * u;
      const N = frames.normals[i];
      const B = frames.binormals[i];

      for (let j = 0; j <= radialSegments; j++) {
        const v = j / radialSegments;
        const theta = v * Math.PI * 2;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const normal = new THREE.Vector3()
          .addScaledVector(N, cosTheta)
          .addScaledVector(B, sinTheta)
          .normalize();

        const pos = new THREE.Vector3()
          .copy(point)
          .addScaledVector(normal, radius);

        positions.push(pos.x, pos.y, pos.z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(u, v);
      }
    }

    for (let i = 0; i < tubularSegments; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const a = i * (radialSegments + 1) + j;
        const b = (i + 1) * (radialSegments + 1) + j;
        const c = (i + 1) * (radialSegments + 1) + (j + 1);
        const d = i * (radialSegments + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Volumetric 3D Leaf Geometry Builder (Closed solid with thickness, arch & cupping)
  function createVolumetricLeafGeometry(length, maxWidth, thickness, uSegs, vSegs) {
    const geom = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    function evalLeafPoint(u, v, isUnderside) {
      // u: 0 (stem attachment) to 1 (leaf tip)
      // v: -1 (left edge) to 1 (right edge)
      const contourWidth = Math.max(3.0, maxWidth * Math.sin(Math.pow(u, 0.56) * Math.PI));
      const x = v * (contourWidth * 0.5);
      const y = u * length;

      // 3D Curvature:
      // 1. Longitudinal arch: arches forward gracefully and curls down at the tip
      const archZ = Math.sin(u * Math.PI * 0.95) * 13.0 * (1 - u * 0.22);
      // 2. Transverse cupping: edges curl upward creating a lush botanical cup
      const cupZ = Math.pow(Math.abs(v), 1.6) * 7.2;
      // 3. Central midrib ridge
      const midribZ = (1 - Math.min(1, Math.abs(v) * 2.6)) * 1.6;

      let z = archZ + cupZ + midribZ;
      if (isUnderside) {
        z -= thickness * (1 - u * 0.38);
      }
      return new THREE.Vector3(x, y, z);
    }

    // 1. Top Surface (Adaxial)
    const topOffset = 0;
    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs;
      for (let j = 0; j <= vSegs; j++) {
        const v = (j / vSegs) * 2 - 1;
        const pt = evalLeafPoint(u, v, false);
        positions.push(pt.x, pt.y, pt.z);
        normals.push(0, 1, 0);
        uvs.push((v + 1) * 0.5, u);
      }
    }

    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = topOffset + i * (vSegs + 1) + j;
        const b = topOffset + (i + 1) * (vSegs + 1) + j;
        const c = topOffset + (i + 1) * (vSegs + 1) + (j + 1);
        const d = topOffset + i * (vSegs + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // 2. Bottom Surface (Abaxial)
    const botOffset = (uSegs + 1) * (vSegs + 1);
    for (let i = 0; i <= uSegs; i++) {
      const u = i / uSegs;
      for (let j = 0; j <= vSegs; j++) {
        const v = (j / vSegs) * 2 - 1;
        const pt = evalLeafPoint(u, v, true);
        positions.push(pt.x, pt.y, pt.z);
        normals.push(0, -1, 0);
        uvs.push((v + 1) * 0.5, u);
      }
    }

    for (let i = 0; i < uSegs; i++) {
      for (let j = 0; j < vSegs; j++) {
        const a = botOffset + i * (vSegs + 1) + j;
        const b = botOffset + (i + 1) * (vSegs + 1) + j;
        const c = botOffset + (i + 1) * (vSegs + 1) + (j + 1);
        const d = botOffset + i * (vSegs + 1) + (j + 1);
        indices.push(a, d, b);
        indices.push(b, d, c);
      }
    }

    // 3. Side edge stitching
    for (let i = 0; i < uSegs; i++) {
      const topA = topOffset + i * (vSegs + 1);
      const topB = topOffset + (i + 1) * (vSegs + 1);
      const botA = botOffset + i * (vSegs + 1);
      const botB = botOffset + (i + 1) * (vSegs + 1);
      indices.push(topA, topB, botA);
      indices.push(topB, botB, botA);

      const topRA = topOffset + i * (vSegs + 1) + vSegs;
      const topRB = topOffset + (i + 1) * (vSegs + 1) + vSegs;
      const botRA = botOffset + i * (vSegs + 1) + vSegs;
      const botRB = botOffset + (i + 1) * (vSegs + 1) + vSegs;
      indices.push(topRA, botRA, topRB);
      indices.push(topRB, botRA, botRB);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  // Inisialisasi Engine 3D
  function init() {
    container = document.getElementById('hero-cube-area');
    if (!container || !window.THREE) return false;

    // Sembunyikan elemen tunas CSS flat lama jika WebGL aktif
    const legacySprout = document.getElementById('sprout-sculpture');
    if (legacySprout) legacySprout.style.display = 'none';

    // Buat WebGL Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'hero-sprout-webgl-canvas';
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '20';
    container.appendChild(canvas);

    const width = container.clientWidth || 780;
    const height = container.clientHeight || 400;

    // Scene & Perspective Camera (1200px CSS perspective matching)
    scene = new THREE.Scene();
    const fov = 2 * Math.atan((height / 2) / 1200) * (180 / Math.PI);
    camera = new THREE.PerspectiveCamera(fov, width / height, 1, 3000);
    camera.position.set(0, 0, 1200);
    camera.lookAt(0, 0, 0);

    // Renderer dengan transparansi & antialiasing
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    // ========================================================================
    // LIGHTING SYSTEM
    // ========================================================================
    // 1. Simulated Sunlight (Directional Light from top-front-right)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.55);
    sunLight.position.set(150, 240, 240);
    scene.add(sunLight);

    // 2. Secondary Rim Light (Cool cyan-lime fill for silhouette depth)
    const rimLight = new THREE.DirectionalLight(0xa7f3d0, 0.75);
    rimLight.position.set(-160, 90, -70);
    scene.add(rimLight);

    // 3. Ambient Hydroponic Glow
    const ambLight = new THREE.AmbientLight(0x065f46, 0.65);
    scene.add(ambLight);

    // 4. Point Light at Nutrient Netpot Core
    const coreLight = new THREE.PointLight(0x34d399, 1.9, 140);
    coreLight.position.set(0, 70, 0);
    scene.add(coreLight);

    // ========================================================================
    // CUBE ANCHOR & 3D LIVING SPROUT MESH
    // ========================================================================
    cubeAnchor = new THREE.Group();
    scene.add(cubeAnchor);

    // Root Group duduk PERSIS di permukaan netpot lubang atas kubus (y = +66px)
    sproutRoot = new THREE.Group();
    sproutRoot.position.set(0, 66, 0);
    cubeAnchor.add(sproutRoot);

    // Base 1: Netpot Nutrient Rim Ring (Cincin Bibir Netpot)
    const netpotRimGeo = new THREE.TorusGeometry(14, 2.2, 16, 36);
    const netpotRimMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.25,
      metalness: 0.45,
      emissive: 0x052e16,
      emissiveIntensity: 0.4
    });
    const netpotRimMesh = new THREE.Mesh(netpotRimGeo, netpotRimMat);
    netpotRimMesh.rotation.x = Math.PI / 2;
    netpotRimMesh.position.y = 0.5;
    sproutRoot.add(netpotRimMesh);

    // Base 2: Bioluminescent Reservoir Disc
    const wellGeo = new THREE.CircleGeometry(12, 32);
    const wellMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.82
    });
    const wellMesh = new THREE.Mesh(wellGeo, wellMat);
    wellMesh.rotation.x = -Math.PI / 2;
    wellMesh.position.y = 0.6;
    sproutRoot.add(wellMesh);

    // ========================================================================
    // STEM: TANGKAI PANJANG MELENGKUNG 3D (ELONGATED 78PX CURVED TUBE)
    // ========================================================================
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1.0, 22, 1.2),
      new THREE.Vector3(-0.7, 46, 1.5),
      new THREE.Vector3(0.3, 66, 0.8),
      new THREE.Vector3(0, 78, 0)
    ]);

    const stemGeo = createTaperedTubeGeometry(stemCurve, 44, 28, 4.8, 3.2);
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0x22c55e,
      roughness: 0.26,
      metalness: 0.08,
      clearcoat: 0.45,
      clearcoatRoughness: 0.2,
      emissive: 0x064e3b,
      emissiveIntensity: 0.3
    });
    stemMesh = new THREE.Mesh(stemGeo, stemMat);
    sproutRoot.add(stemMesh);

    // Botanical Node Rings (Ruas Batang Tunas 3D)
    const nodeRingMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.35,
      metalness: 0.15
    });
    const node1Geo = new THREE.TorusGeometry(4.4, 0.8, 14, 28);
    const node1Mesh = new THREE.Mesh(node1Geo, nodeRingMat);
    node1Mesh.position.copy(stemCurve.getPointAt(0.38));
    node1Mesh.rotation.x = Math.PI / 2;
    sproutRoot.add(node1Mesh);

    const node2Geo = new THREE.TorusGeometry(3.7, 0.7, 14, 28);
    const node2Mesh = new THREE.Mesh(node2Geo, nodeRingMat);
    node2Mesh.position.copy(stemCurve.getPointAt(0.72));
    node2Mesh.rotation.x = Math.PI / 2;
    sproutRoot.add(node2Mesh);

    // ========================================================================
    // LEAVES: SEPASANG DAUN 3D VOLUMETRIK (V-CUPPED 3D BLADES FACING VIEWER)
    // ========================================================================
    const leafTexture = createLeafTexture();
    const leafMat = new THREE.MeshPhysicalMaterial({
      map: leafTexture,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
      emissive: 0x064e3b,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide
    });

    // 1. Pivot Daun Kiri (Left Leaf Pivot)
    leafLeftPivot = new THREE.Group();
    leafLeftPivot.position.set(-1.2, 77, 0);
    // Z: spreads 42deg to left, X: arches forward toward camera, Y: slight outward yaw
    leafLeftPivot.rotation.z = -0.73;
    leafLeftPivot.rotation.x = 0.46;
    leafLeftPivot.rotation.y = -0.16;
    sproutRoot.add(leafLeftPivot);

    const leafLeftGeo = createVolumetricLeafGeometry(60, 42, 1.9, 24, 16);
    const leafLeftMesh = new THREE.Mesh(leafLeftGeo, leafMat);
    leafLeftPivot.add(leafLeftMesh);

    // 3D Midrib Ridge on Left Leaf
    const midribLeftGeo = new THREE.CylinderGeometry(0.4, 1.1, 56, 12);
    const midribLeftMat = new THREE.MeshStandardMaterial({
      color: 0xf0fdf4,
      roughness: 0.2,
      metalness: 0.1
    });
    const midribLeft = new THREE.Mesh(midribLeftGeo, midribLeftMat);
    midribLeft.position.set(0, 28, 1.7);
    leafLeftPivot.add(midribLeft);

    // 2. Pivot Daun Kanan (Right Leaf Pivot - Symmetrical Mirror!)
    leafRightPivot = new THREE.Group();
    leafRightPivot.position.set(1.2, 77, 0);
    // Z: spreads 42deg to right, X: arches forward toward camera, Y: slight outward yaw
    leafRightPivot.rotation.z = 0.73;
    leafRightPivot.rotation.x = 0.46;
    leafRightPivot.rotation.y = 0.16;
    sproutRoot.add(leafRightPivot);

    const leafRightGeo = createVolumetricLeafGeometry(60, 42, 1.9, 24, 16);
    const leafRightMesh = new THREE.Mesh(leafRightGeo, leafMat);
    leafRightPivot.add(leafRightMesh);

    // 3D Midrib Ridge on Right Leaf
    const midribRightGeo = new THREE.CylinderGeometry(0.4, 1.1, 56, 12);
    const midribRight = new THREE.Mesh(midribRightGeo, midribLeftMat);
    midribRight.position.set(0, 28, 1.7);
    leafRightPivot.add(midribRight);

    // ========================================================================
    // DEWDROP: TETESAN EMBUN 3D SFERIS DI CEKUNGAN DAUN KANAN
    // ========================================================================
    const dewdropGeo = new THREE.SphereGeometry(4.0, 32, 24);
    const dewdropMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.333,
      metalness: 0.0,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02
    });
    dewdrop = new THREE.Mesh(dewdropGeo, dewdropMat);
    // Terkunci di atas cekungan daun kanan
    dewdrop.position.set(3.5, 26.0, 8.2);
    leafRightPivot.add(dewdrop);

    // Pin Specular Light Spark on Dewdrop
    const dropPinGeo = new THREE.SphereGeometry(1.0, 12, 12);
    const dropPinMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const dropPin = new THREE.Mesh(dropPinGeo, dropPinMat);
    dropPin.position.set(1.1, 1.1, 2.4);
    dewdrop.add(dropPin);

    // ========================================================================
    // APICAL BUD: PUCUK TUNAS MUDA DI TENGAH (CENTRAL SHOOT)
    // ========================================================================
    const budGroup = new THREE.Group();
    budGroup.position.set(0, 78, 0);
    sproutRoot.add(budGroup);
    apicalBud = budGroup;

    const budLeafGeo = createVolumetricLeafGeometry(24, 12, 1.1, 14, 10);
    const budMat = new THREE.MeshPhysicalMaterial({
      color: 0xbbf7d0,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 0.5,
      emissive: 0x10b981,
      emissiveIntensity: 0.4
    });

    const budL = new THREE.Mesh(budLeafGeo, budMat);
    budL.rotation.set(0.45, -0.12, -0.25);
    budGroup.add(budL);

    const budR = new THREE.Mesh(budLeafGeo, budMat);
    budR.rotation.set(0.45, 0.12, 0.25);
    budGroup.add(budR);

    // Bioluminescent Core Spark at Bud Crown
    const budSpark = new THREE.PointLight(0xecfdf5, 1.2, 40);
    budSpark.position.set(0, 14, 0);
    budGroup.add(budSpark);

    // Handle Window Resize
    window.addEventListener('resize', onResize);

    isReady = true;
    return true;
  }

  function onResize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth || 780;
    const height = container.clientHeight || 400;

    const fov = 2 * Math.atan((height / 2) / 1200) * (180 / Math.PI);
    camera.fov = fov;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  // Sinkronisasi Orientasi 3D & Bobbing dengan Kubus
  function updateTransform(rotX, rotY, bobY) {
    if (!isReady) return;

    animClock += 16;

    // Sinkronisasi Rotasi Kubus
    cubeAnchor.rotation.x = rotX * (Math.PI / 180);
    cubeAnchor.rotation.y = rotY * (Math.PI / 180);
    cubeAnchor.position.y = -bobY; // Inversi karena Three.js Y adalah ke atas

    // Idle Harmonic Breathing Botanical Sway
    if (stemMesh) {
      stemMesh.rotation.z = Math.sin(animClock * 0.0016) * 0.018;
      stemMesh.rotation.x = Math.cos(animClock * 0.0014) * 0.014;
    }
    if (leafLeftPivot) {
      leafLeftPivot.rotation.z = -0.73 + Math.sin(animClock * 0.0020) * 0.025;
      leafLeftPivot.rotation.x = 0.46 + Math.cos(animClock * 0.0018) * 0.018;
    }
    if (leafRightPivot) {
      leafRightPivot.rotation.z = 0.73 + Math.cos(animClock * 0.0022) * 0.025;
      leafRightPivot.rotation.x = 0.46 + Math.sin(animClock * 0.0016) * 0.018;
    }
    if (dewdrop) {
      dewdrop.scale.setScalar(1 + Math.sin(animClock * 0.003) * 0.04);
    }

    // Spring Bounce Physics Simulation
    if (bounceVel !== 0 || Math.abs(bouncePos) > 0.001) {
      const springK = 0.12;
      const damping = 0.82;
      const force = -springK * bouncePos;
      bounceVel = (bounceVel + force) * damping;
      bouncePos += bounceVel;

      const scaleY = 1 + bouncePos;
      const scaleXZ = 1 - bouncePos * 0.45;
      sproutRoot.scale.set(scaleXZ, scaleY, scaleXZ);

      if (Math.abs(bounceVel) < 0.0005 && Math.abs(bouncePos) < 0.0005) {
        bounceVel = 0;
        bouncePos = 0;
        sproutRoot.scale.set(1, 1, 1);
      }
    }

    renderer.render(scene, camera);
  }

  // Trigger Spring Bounce saat Kubus Diklik
  function triggerBounce() {
    if (!isReady) return;
    bounceVel = 0.42;
  }

  // Ekspor Global API
  window.Sprout3D = {
    init: init,
    updateTransform: updateTransform,
    triggerBounce: triggerBounce,
    get isReady() { return isReady; }
  };

})();
