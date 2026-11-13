import { spawn } from "child_process";

const proc = spawn("C:\\Program Files\\ArtCraft\\FigCraft\\figcraft-cli.exe", ["mcp", "--attach", "8765"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let msgId = 1;
const pending = new Map<number, (res: any) => void>();

let buffer = "";
proc.stdout.on("data", (data) => {
  buffer += data.toString();
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const json = JSON.parse(line);
      if (json.id && pending.has(json.id)) {
        const cb = pending.get(json.id)!;
        pending.delete(json.id);
        cb(json);
      }
    } catch (e) {
      console.error("Parse error:", e);
    }
  }
});

function call(method: string, params: any): Promise<any> {
  const id = msgId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    const payload = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    proc.stdin.write(payload);
  });
}

function tool(name: string, args: any) {
  return call("tools/call", { name, arguments: args });
}

function cmd(command: string, params: any) {
  return tool("run_command", { command, params });
}

function getNodeId(res: any): number {
  if (res?.result?.node?.id) return res.result.node.id;
  if (res?.result?.id) return res.result.id;
  if (res?.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(res.result.content[0].text);
      if (parsed.id) return parsed.id;
      if (parsed.node?.id) return parsed.node.id;
    } catch {}
  }
  return 1;
}

// Geometry Generators:
// 1. Chiseled 6-Blade Aperture Asterisk (Concept A)
function buildApertureAsterisk(cx: number, cy: number, rIn: number, rOut: number, w: number, tipExt: number): string {
  let path = "";
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;

    const p1x = cx + rIn * cos - (w * 0.6) * nx;
    const p1y = cy + rIn * sin - (w * 0.6) * ny;

    const p2x = cx + rIn * cos + (w * 0.6) * nx;
    const p2y = cy + rIn * sin + (w * 0.6) * ny;

    const p3x = cx + rOut * cos + w * nx;
    const p3y = cy + rOut * sin + w * ny;

    const tipX = cx + (rOut + tipExt) * cos;
    const tipY = cy + (rOut + tipExt) * sin;

    const p4x = cx + rOut * cos - w * nx;
    const p4y = cy + rOut * sin - w * ny;

    path += `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} L ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${tipX.toFixed(2)} ${tipY.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} Z `;
  }
  return path.trim();
}

// 2. Heavy Swiss Industrial Asterisk (Concept B)
function buildSwissHeavyAsterisk(cx: number, cy: number, halfLen: number, halfW: number): string {
  let path = "";
  for (let i = 0; i < 3; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;

    // 4 corners of rectangle centered at (cx, cy)
    const c1x = cx - halfLen * cos - halfW * nx;
    const c1y = cy - halfLen * sin - halfW * ny;

    const c2x = cx + halfLen * cos - halfW * nx;
    const c2y = cy + halfLen * sin - halfW * ny;

    const c3x = cx + halfLen * cos + halfW * nx;
    const c3y = cy + halfLen * sin + halfW * ny;

    const c4x = cx - halfLen * cos + halfW * nx;
    const c4y = cy - halfLen * sin + halfW * ny;

    path += `M ${c1x.toFixed(2)} ${c1y.toFixed(2)} L ${c2x.toFixed(2)} ${c2y.toFixed(2)} L ${c3x.toFixed(2)} ${c3y.toFixed(2)} L ${c4x.toFixed(2)} ${c4y.toFixed(2)} Z `;
  }
  return path.trim();
}

// 3. System Reticle / Terminal Pointer (Concept C)
function buildReticlePointerAsterisk(cx: number, cy: number, rCore: number, rArm: number, w: number): string {
  let path = "";
  // 4 Cardinal Arms
  for (let i = 0; i < 4; i++) {
    const angle = (i * 90) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;

    const p1x = cx + rCore * cos - w * nx;
    const p1y = cy + rCore * sin - w * ny;
    const p2x = cx + rCore * cos + w * nx;
    const p2y = cy + rCore * sin + w * ny;
    const p3x = cx + rArm * cos + w * nx;
    const p3y = cy + rArm * sin + w * ny;
    const p4x = cx + (rArm + 8) * cos;
    const p4y = cy + (rArm + 8) * sin;
    const p5x = cx + rArm * cos - w * nx;
    const p5y = cy + rArm * sin - w * ny;

    path += `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} L ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} L ${p5x.toFixed(2)} ${p5y.toFixed(2)} Z `;
  }
  // 4 Diagonal Chevrons
  for (let i = 0; i < 4; i++) {
    const angle = (45 + i * 90) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;

    const dIn = rCore + 6;
    const dOut = rArm - 8;
    const dw = w * 0.75;

    const p1x = cx + dIn * cos - dw * nx;
    const p1y = cy + dIn * sin - dw * ny;
    const p2x = cx + dIn * cos + dw * nx;
    const p2y = cy + dIn * sin + dw * ny;
    const p3x = cx + dOut * cos + dw * nx;
    const p3y = cy + dOut * sin + dw * ny;
    const p4x = cx + (dOut + 6) * cos;
    const p4y = cy + (dOut + 6) * sin;
    const p5x = cx + dOut * cos - dw * nx;
    const p5y = cy + dOut * sin - dw * ny;

    path += `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} L ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} L ${p5x.toFixed(2)} ${p5y.toFixed(2)} Z `;
  }
  return path.trim();
}

async function main() {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity", version: "1.0" },
  });

  console.log("Connected to FigCraft Live Session!");

  // Clean canvas
  await cmd("select.all", {});
  await cmd("edit.delete", {});

  // Master Presentation Frame: 1600 x 980
  const boardRes = await tool("create_node", {
    type: "frame",
    name: "Asterisk_Identity_Explorations",
    x: 0,
    y: 0,
    width: 1600,
    height: 980,
    props: {
      fills: [{ type: "solid", color: "#07090E" }], // Pure obsidian void
    },
  });
  const boardId = getNodeId(boardRes);
  console.log("Board ID:", boardId);

  // Top Global Header (Minimalist & Architectural)
  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 48,
    text: "ASTERISK / IDENTITY ARCHITECTURE",
    props: {
      fontSize: 12,
      fontFamily: "Liberation Mono",
      fontWeight: 700,
      fills: [{ type: "solid", color: "#F59E0B" }],
    },
  });

  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 72,
    text: "Logo Design Exploration — 3 Architectural Directions",
    props: {
      fontSize: 26,
      fontFamily: "Inter",
      fontWeight: 700,
      fills: [{ type: "solid", color: "#F8FAFC" }],
    },
  });

  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 110,
    text: "Precision geometry built for high-density developer systems, encrypted credential vaults, and HRIS infrastructure.",
    props: {
      fontSize: 13,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#64748B" }],
    },
  });

  // -------------------------------------------------------------
  // CONCEPT 01: THE KINETIC APERTURE (Hexagonal Convergence)
  // -------------------------------------------------------------
  const card1Res = await tool("create_node", {
    type: "frame",
    name: "Concept_01_Aperture",
    parent: boardId,
    x: 64,
    y: 160,
    width: 460,
    height: 760,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#1A2234", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c1 = getNodeId(card1Res);

  // Concept Tag
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 32,
    text: "DIRECTION 01",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 52,
    text: "The Kinetic Aperture",
    props: { fontSize: 20, fontFamily: "Inter", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 80,
    text: "Six chiseled geometric facets converging into a tight hexagonal core. Symbolizes multi-client convergence into a single secure hub.",
    props: { fontSize: 12, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Hero Display Square
  const hero1 = await tool("create_node", {
    type: "frame",
    name: "Display_Box_01",
    parent: c1,
    x: 32,
    y: 135,
    width: 396,
    height: 260,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const h1 = getNodeId(hero1);

  // Draw Concept 1 Vector:
  const path1 = buildApertureAsterisk(198, 130, 10, 58, 10, 8);
  await cmd("vector.create", {
    parent: h1,
    path: path1,
    props: {
      fills: [{ type: "solid", color: "#F59E0B" }],
    },
  });

  // Horizontal Wordmark Lockup
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 425,
    text: "PRIMARY WORDMARK LOCKUP",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  const lockup1 = await tool("create_node", {
    type: "frame",
    name: "Lockup_01",
    parent: c1,
    x: 32,
    y: 450,
    width: 396,
    height: 80,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const l1 = getNodeId(lockup1);

  const miniPath1 = buildApertureAsterisk(40, 40, 4, 18, 3.5, 3);
  await cmd("vector.create", {
    parent: l1,
    path: miniPath1,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: l1,
    x: 75,
    y: 28,
    text: "ASTERISK",
    props: { fontSize: 22, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Small Scale Favicon / App Tile Test
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 555,
    text: "FAVICON & MONOCHROME TEST",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  // Amber Favicon (48x48)
  const fav1_amber = await tool("create_node", {
    type: "frame",
    name: "Favicon_Amber",
    parent: c1,
    x: 32,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav1_amber),
    path: buildApertureAsterisk(28, 28, 3, 14, 2.8, 2),
    props: { fills: [{ type: "solid", color: "#07090E" }] },
  });

  // Black Favicon with Amber Mark (48x48)
  const fav1_dark = await tool("create_node", {
    type: "frame",
    name: "Favicon_Dark",
    parent: c1,
    x: 100,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav1_dark),
    path: buildApertureAsterisk(28, 28, 3, 14, 2.8, 2),
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // White Clean Tile
  const fav1_white = await tool("create_node", {
    type: "frame",
    name: "Favicon_White",
    parent: c1,
    x: 168,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav1_white),
    path: buildApertureAsterisk(28, 28, 3, 14, 2.8, 2),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Rationale Footer
  await cmd("text.create", {
    parent: c1,
    x: 32,
    y: 670,
    text: "• Vector Geometry: 6 Facets, 60° Symmetry\n• Negative Space: Hexagonal Core\n• Tone: Advanced, Cryptographic, Architectural",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // CONCEPT 02: THE SWISS MONOLITH (Heavy Precision Overlap)
  // -------------------------------------------------------------
  const card2Res = await tool("create_node", {
    type: "frame",
    name: "Concept_02_SwissMonolith",
    parent: boardId,
    x: 570,
    y: 160,
    width: 460,
    height: 760,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#F59E0B", weight: 1.5 }], // Highlighted as top contender
      cornerRadius: 12,
    },
  });
  const c2 = getNodeId(card2Res);

  // Concept Tag
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 32,
    text: "DIRECTION 02 ★ RECOMMENDED",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 52,
    text: "The Swiss Monolith",
    props: { fontSize: 20, fontFamily: "Inter", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 80,
    text: "Heavyweight modernist asterisk with flat orthogonal cuts. Clean, unapologetic, brutalist clarity inspired by Swiss international style.",
    props: { fontSize: 12, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Hero Display Square
  const hero2 = await tool("create_node", {
    type: "frame",
    name: "Display_Box_02",
    parent: c2,
    x: 32,
    y: 135,
    width: 396,
    height: 260,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const h2 = getNodeId(hero2);

  // Draw Concept 2 Vector:
  const path2 = buildSwissHeavyAsterisk(198, 130, 68, 13);
  await cmd("vector.create", {
    parent: h2,
    path: path2,
    props: {
      fills: [{ type: "solid", color: "#F8FAFC" }], // Stark white
    },
  });

  // Center Amber Core Intersection Dot (Surgical detail)
  await tool("create_node", {
    type: "ellipse",
    name: "Amber_Surgical_Core",
    parent: h2,
    x: 191,
    y: 123,
    width: 14,
    height: 14,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Horizontal Wordmark Lockup
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 425,
    text: "PRIMARY WORDMARK LOCKUP",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  const lockup2 = await tool("create_node", {
    type: "frame",
    name: "Lockup_02",
    parent: c2,
    x: 32,
    y: 450,
    width: 396,
    height: 80,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const l2 = getNodeId(lockup2);

  const miniPath2 = buildSwissHeavyAsterisk(40, 40, 20, 4.2);
  await cmd("vector.create", {
    parent: l2,
    path: miniPath2,
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    name: "Mini_Core",
    parent: l2,
    x: 38,
    y: 38,
    width: 4,
    height: 4,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: l2,
    x: 75,
    y: 28,
    text: "ASTERISK",
    props: { fontSize: 22, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Small Scale Favicon / App Tile Test
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 555,
    text: "FAVICON & MONOCHROME TEST",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  // Amber Favicon
  const fav2_amber = await tool("create_node", {
    type: "frame",
    name: "Fav2_Amber",
    parent: c2,
    x: 32,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav2_amber),
    path: buildSwissHeavyAsterisk(28, 28, 16, 3.5),
    props: { fills: [{ type: "solid", color: "#07090E" }] },
  });

  // Dark Favicon
  const fav2_dark = await tool("create_node", {
    type: "frame",
    name: "Fav2_Dark",
    parent: c2,
    x: 100,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav2_dark),
    path: buildSwissHeavyAsterisk(28, 28, 16, 3.5),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Amber on Dark
  const fav2_alt = await tool("create_node", {
    type: "frame",
    name: "Fav2_Alt",
    parent: c2,
    x: 168,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav2_alt),
    path: buildSwissHeavyAsterisk(28, 28, 16, 3.5),
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Rationale Footer
  await cmd("text.create", {
    parent: c2,
    x: 32,
    y: 670,
    text: "• Vector Geometry: 3 Flat-Cut Bars, 60° Overlap\n• Negative Space: Seamless Center Intersection\n• Tone: Brutalist, Timeless, High-Authority",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // CONCEPT 03: THE SYSTEM RETICLE (8-Axis Developer Wildcard)
  // -------------------------------------------------------------
  const card3Res = await tool("create_node", {
    type: "frame",
    name: "Concept_03_SystemReticle",
    parent: boardId,
    x: 1076,
    y: 160,
    width: 460,
    height: 760,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#1A2234", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c3 = getNodeId(card3Res);

  // Concept Tag
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 32,
    text: "DIRECTION 03",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#38BDF8" }] },
  });
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 52,
    text: "The System Reticle",
    props: { fontSize: 20, fontFamily: "Inter", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 80,
    text: "Eight-axis target reticle and pointer system. Echoes terminal syntax, radar coordination, and deep infrastructure mapping.",
    props: { fontSize: 12, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Hero Display Square
  const hero3 = await tool("create_node", {
    type: "frame",
    name: "Display_Box_03",
    parent: c3,
    x: 32,
    y: 135,
    width: 396,
    height: 260,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const h3 = getNodeId(hero3);

  // Draw Concept 3 Vector:
  const path3 = buildReticlePointerAsterisk(198, 130, 12, 60, 6);
  await cmd("vector.create", {
    parent: h3,
    path: path3,
    props: {
      fills: [{ type: "solid", color: "#38BDF8" }],
    },
  });

  // Central Target Ring in Reticle
  await tool("create_node", {
    type: "ellipse",
    name: "Reticle_Center_Ring",
    parent: h3,
    x: 189,
    y: 121,
    width: 18,
    height: 18,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#F8FAFC", weight: 1.5 }],
    },
  });

  // Horizontal Wordmark Lockup
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 425,
    text: "PRIMARY WORDMARK LOCKUP",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  const lockup3 = await tool("create_node", {
    type: "frame",
    name: "Lockup_03",
    parent: c3,
    x: 32,
    y: 450,
    width: 396,
    height: 80,
    props: {
      fills: [{ type: "solid", color: "#07090E" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const l3 = getNodeId(lockup3);

  const miniPath3 = buildReticlePointerAsterisk(40, 40, 4, 18, 2.5);
  await cmd("vector.create", {
    parent: l3,
    path: miniPath3,
    props: { fills: [{ type: "solid", color: "#38BDF8" }] },
  });

  await cmd("text.create", {
    parent: l3,
    x: 75,
    y: 28,
    text: "ASTERISK",
    props: { fontSize: 22, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Small Scale Favicon / App Tile Test
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 555,
    text: "FAVICON & MONOCHROME TEST",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] },
  });

  // Cyan Favicon
  const fav3_cyan = await tool("create_node", {
    type: "frame",
    name: "Fav3_Cyan",
    parent: c3,
    x: 32,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#38BDF8" }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav3_cyan),
    path: buildReticlePointerAsterisk(28, 28, 3, 14, 2),
    props: { fills: [{ type: "solid", color: "#07090E" }] },
  });

  // Dark Favicon
  const fav3_dark = await tool("create_node", {
    type: "frame",
    name: "Fav3_Dark",
    parent: c3,
    x: 100,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav3_dark),
    path: buildReticlePointerAsterisk(28, 28, 3, 14, 2),
    props: { fills: [{ type: "solid", color: "#38BDF8" }] },
  });

  // White Tile
  const fav3_white = await tool("create_node", {
    type: "frame",
    name: "Fav3_White",
    parent: c3,
    x: 168,
    y: 580,
    width: 56,
    height: 56,
    props: { fills: [{ type: "solid", color: "#07090E" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(fav3_white),
    path: buildReticlePointerAsterisk(28, 28, 3, 14, 2),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Rationale Footer
  await cmd("text.create", {
    parent: c3,
    x: 32,
    y: 670,
    text: "• Vector Geometry: 8-Axis Cardinal + Diagonal\n• Negative Space: Center Reticle Target\n• Tone: Cybernetic, Technical, Precision Operator",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  console.log("3 Architectural Brand Concepts successfully rendered on FigCraft live canvas!");
  proc.kill();
}

main().catch((err) => {
  console.error("Error:", err);
  proc.kill();
});

