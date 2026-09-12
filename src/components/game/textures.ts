import * as THREE from "three";

/** Soft, hand-painted looking grass texture generated on a canvas (no network assets). */
export function makeGroundTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#6f9e52";
  ctx.fillRect(0, 0, size, size);

  // patchy tonal variation
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 48;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.5;
    g.addColorStop(0, light ? "rgba(150,190,110,0.35)" : "rgba(70,110,60,0.30)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // grass blades
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.strokeStyle = `rgba(${90 + Math.random() * 70 | 0},${130 + Math.random() * 60 | 0},70,0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 3 - Math.random() * 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  tex.anisotropy = 4;
  return tex;
}

/** Dusty path ring texture used for the plaza floor. */
export function makeStoneTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#c9b28c";
  ctx.fillRect(0, 0, size, size);
  const cell = size / 8;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const shade = 165 + Math.random() * 50;
      ctx.fillStyle = `rgb(${shade + 25 | 0},${shade | 0},${shade - 35 | 0})`;
      const off = (y % 2) * cell * 0.5;
      ctx.fillRect(x * cell + off + 2, y * cell + 2, cell - 4, cell - 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}
