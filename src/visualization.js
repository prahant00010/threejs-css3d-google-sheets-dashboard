import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

function worthBand(netWorth) {
  if (netWorth >= 200_000) return "green";
  if (netWorth >= 100_000) return "orange";
  return "red";
}

function worthColorRgba(netWorth) {
  const band = worthBand(netWorth);
  if (band === "green") return "rgba(35, 200, 120, 0.28)";
  if (band === "orange") return "rgba(255, 150, 60, 0.28)";
  return "rgba(230, 45, 70, 0.28)";
}

function worthFill(netWorth) {
  
  const max = 300_000;
  const v = Math.max(0, Math.min(1, netWorth / max));
  return `${Math.round(15 + v * 85)}%`;
}

function tileEl(person) {
  const el = document.createElement("div");
  el.className = "tile";
  el.style.background = worthColorRgba(person.netWorth);

  const header = document.createElement("div");
  header.className = "tileHeader";

  const badgeLeft = document.createElement("div");
  badgeLeft.className = "badge";
  badgeLeft.textContent = (person.country || "").toString().slice(0, 3).toUpperCase() || "N/A";

  const badgeRight = document.createElement("div");
  badgeRight.className = "badge";
  badgeRight.textContent = person.age ? `Age ${person.age}` : "Age N/A";

  header.appendChild(badgeLeft);
  header.appendChild(badgeRight);

  const photoWrap = document.createElement("div");
  photoWrap.className = "tilePhoto";
  const img = document.createElement("img");
  img.alt = person.name || "Photo";
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";
  img.src = person.photo || "";
  photoWrap.appendChild(img);

  const body = document.createElement("div");
  body.className = "tileBody";

  const name = document.createElement("div");
  name.className = "tileName";
  name.textContent = person.name || "Unknown";

  const meta = document.createElement("div");
  meta.className = "tileMeta";

  const kv1 = document.createElement("div");
  kv1.className = "kv";
  kv1.innerHTML = `<div class="k">Interest</div><div class="v">${person.interest || "—"}</div>`;

  const kv2 = document.createElement("div");
  kv2.className = "kv";
  kv2.innerHTML = `<div class="k">Net Worth</div><div class="v">${person.netWorthRaw || "—"}</div>`;

  meta.appendChild(kv1);
  meta.appendChild(kv2);

  const worthBar = document.createElement("div");
  worthBar.className = "tileWorthBar";
  const fill = document.createElement("div");
  fill.className = "tileWorthFill";
  fill.style.width = worthFill(person.netWorth);
  const band = worthBand(person.netWorth);
  fill.style.background =
    band === "green"
      ? "rgba(35, 200, 120, 0.9)"
      : band === "orange"
        ? "rgba(255, 150, 60, 0.92)"
        : "rgba(230, 45, 70, 0.9)";
  worthBar.appendChild(fill);

  body.appendChild(name);
  body.appendChild(meta);

  el.appendChild(header);
  el.appendChild(photoWrap);
  el.appendChild(body);
  el.appendChild(worthBar);

  return el;
}

function makeTargets({ count }) {
  const targets = {
    table: [],
    sphere: [],
    helix: [],
    grid: [],
    tetra: []
  };


  const cols = 20;
  const rows = 10;
  const colSpacing = 200;
  const rowSpacing = 260;
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const obj = new THREE.Object3D();
    obj.position.x = (col - (cols - 1) / 2) * colSpacing;
    obj.position.y = (-(row - (rows - 1) / 2)) * rowSpacing;
    obj.position.z = 0;
    targets.table.push(obj);
  }


  const radius = 900;
  for (let i = 0; i < count; i++) {
    const obj = new THREE.Object3D();
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    obj.position.x = radius * Math.cos(theta) * Math.sin(phi);
    obj.position.y = radius * Math.sin(theta) * Math.sin(phi);
    obj.position.z = radius * Math.cos(phi);
    const v = obj.position.clone().multiplyScalar(2);
    obj.lookAt(v);
    targets.sphere.push(obj);
  }

  const helixRadius = 780;
  const helixSeparation = 40; 
  const step = 0.45; 
  const yStep = 55; 
  for (let i = 0; i < count; i++) {
    const obj = new THREE.Object3D();
    const strand = i % 2; // 0 or 1
    const j = Math.floor(i / 2);
    const theta = j * step + strand * Math.PI;
    const y = -(j * yStep) + (strand ? -helixSeparation / 2 : helixSeparation / 2);
    obj.position.x = helixRadius * Math.sin(theta);
    obj.position.y = y;
    obj.position.z = helixRadius * Math.cos(theta);
    const look = new THREE.Vector3(obj.position.x * 2, obj.position.y, obj.position.z * 2);
    obj.lookAt(look);
    targets.helix.push(obj);
  }

  const gx = 5;
  const gy = 4;
  const gz = 10;
  const sx = 360;
  const sy = 270;
  const sz = 420;
  for (let i = 0; i < count; i++) {
    const obj = new THREE.Object3D();
    const x = i % gx;
    const y = Math.floor(i / gx) % gy;
    const z = Math.floor(i / (gx * gy)) % gz; 
    obj.position.x = (x - (gx - 1) / 2) * sx;
    obj.position.y = (-(y - (gy - 1) / 2)) * sy;
    obj.position.z = (z - (gz - 1) / 2) * sz;
    targets.grid.push(obj);
  }

  // Tetrahedron layout (tall, clearly visible pyramid from default camera)
  // We build an upright pyramid with a wide base and a high apex so the silhouette is obvious.
  const baseSize = 1600;
  const baseY = -700;
  const apexY = 1300;

  // Vertices: triangular base (on XZ plane) + apex above center
  const v0 = new THREE.Vector3(-baseSize, baseY, -baseSize); // back-left
  const v1 = new THREE.Vector3(baseSize, baseY, -baseSize);  // back-right
  const v2 = new THREE.Vector3(0, baseY, baseSize);          // front-center
  const v3 = new THREE.Vector3(0, apexY, 0);                 // apex

  const verts = [v0, v1, v2, v3];

  // Faces: 4 triangular faces (3 sides + base)
  const faces = [
    [0, 1, 3], // back side
    [1, 2, 3], // right/front side
    [2, 0, 3], // left/front side
    [0, 1, 2]  // base
  ];

  for (let i = 0; i < count; i++) {
    const obj = new THREE.Object3D();
    const faceIndex = i % faces.length;
    const [aIdx, bIdx, cIdx] = faces[faceIndex];
    const a = verts[aIdx].clone();
    const b = verts[bIdx].clone();
    const c = verts[cIdx].clone();

    // Barycentric coordinates strictly on the triangular face.
    // We bias slightly toward edges/vertices to keep the pyramid sharp,
    // but never move points inside the volume.
    let u = Math.random();
    let v = Math.random() * (1 - u);
    // Edge/vertex bias (still on the face)
    const bias = 0.5;
    u = u * bias + u * u * (1 - bias);
    v = v * bias + v * v * (1 - bias);
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;

    let pos = new THREE.Vector3()
      .addScaledVector(a, u)
      .addScaledVector(b, v)
      .addScaledVector(c, w);

    // Push slightly outward along the face normal so tiles sit clearly on the surface
    const ab = b.clone().sub(a);
    const ac = c.clone().sub(a);
    const normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
    pos.addScaledVector(normal, 60);

    obj.position.copy(pos);
    // Make tiles face outward from the pyramid center
    const look = pos.clone().normalize().multiplyScalar(4000);
    obj.lookAt(look);
    targets.tetra.push(obj);
  }

  return targets;
}

export function createVisualization({ container, people }) {
  console.log("createVisualization called with", people.length, "people");
  console.log("Container:", container, "dimensions:", {
    width: container.clientWidth,
    height: container.clientHeight
  });
  
  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    1,
    10000
  );
  camera.position.z = 3000;
  console.log("Camera created, position:", camera.position);

  const scene = new THREE.Scene();
  const renderer = new CSS3DRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.pointerEvents = "auto"; 
  renderer.domElement.style.zIndex = "1";
  console.log("Renderer created, domElement:", renderer.domElement);
  
  container.innerHTML = "";
  container.appendChild(renderer.domElement);
  console.log("Renderer domElement appended to container");

  const controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.7;
  controls.minDistance = 800;
  controls.maxDistance = 6000;

  const objects = [];
  console.log("Creating", people.length, "tiles...");
  for (let i = 0; i < people.length; i++) {
    const element = tileEl(people[i]);
    const objectCSS = new CSS3DObject(element);
    objectCSS.position.x = Math.random() * 4000 - 2000;
    objectCSS.position.y = Math.random() * 4000 - 2000;
    objectCSS.position.z = Math.random() * 4000 - 2000;
    scene.add(objectCSS);
    objects.push(objectCSS);
  }
  console.log(`Created ${objects.length} CSS3D objects, scene children:`, scene.children.length);

  const targets = makeTargets({ count: objects.length });
  console.log("Targets created for layouts:", Object.keys(targets));

  function transform(target, duration) {
    console.log(`transform() called with ${target.length} targets, duration: ${duration}`);
    console.log(`Objects count: ${objects.length}, Target count: ${target.length}`);

    if (objects.length !== target.length) {
      console.error(`Mismatch! Objects: ${objects.length}, Targets: ${target.length}`);
      return;
    }

    if (objects.length > 0 && target.length > 0) {
      console.log("First object current position:", {
        x: objects[0].position.x,
        y: objects[0].position.y,
        z: objects[0].position.z
      });
      console.log("First object target position:", {
        x: target[0].position.x,
        y: target[0].position.y,
        z: target[0].position.z
      });
    }

    // Simpler: instantly move objects to target positions/rotations
    // so layout changes are obvious, even if tweening misbehaves.
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const targetObj = target[i];

      object.position.copy(targetObj.position);
      object.rotation.copy(targetObj.rotation);
      object.updateMatrix();
      object.updateMatrixWorld(true);
    }

    render();
  }

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    render();
  }

  function render() {
   
    scene.updateMatrixWorld(true);
    renderer.render(scene, camera);
  }

  let animationId = null;
  function animate(time) {
    animationId = requestAnimationFrame(animate);
    TWEEN.update(time); 
    controls.update();
    render(); 
  }

  window.addEventListener("resize", onResize);


  console.log("Starting animation loop...");
  animate();
  console.log("Calling initial transform to table layout...");
  transform(targets.table, 1200);
  console.log("Initial render called");
  render();

  return {
    transformTo(name, duration = 1600) {
      console.log(`transformTo called with name: "${name}", duration: ${duration}`);
      const t = targets[name];
      console.log("Available targets:", Object.keys(targets));
      console.log("Requested target:", t, "length:", t?.length);
      if (!t) {
        console.error(`Target "${name}" not found! Available:`, Object.keys(targets));
        return;
      }
      console.log(`Transforming ${t.length} objects to ${name} layout...`);
      transform(t, duration);
      console.log("Transform started");
      
      render();
    },
    dispose() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      window.removeEventListener("resize", onResize);
      container.innerHTML = "";
    }
  };
}

