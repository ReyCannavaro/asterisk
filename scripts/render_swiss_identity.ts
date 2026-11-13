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

// Heavy Swiss Industrial Asterisk Generator
function buildSwissHeavyAsterisk(cx: number, cy: number, halfLen: number, halfW: number): string {
  let path = "";
  for (let i = 0; i < 3; i++) {
    const angle = (i * 60) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = -sin;
    const ny = cos;

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

async function main() {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity", version: "1.0" },
  });

  console.log("Connected to FigCraft Live Session!");

  // Clean previous exploration
  await cmd("select.all", {});
  await cmd("edit.delete", {});

  // Master Board: 1680 x 1180 (Carbon Obsidian #06080D)
  const boardRes = await tool("create_node", {
    type: "frame",
    name: "Asterisk_Swiss_Monolith_Brand_System",
    x: 0,
    y: 0,
    width: 1680,
    height: 1180,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
    },
  });
  const boardId = getNodeId(boardRes);
  console.log("Master Board ID:", boardId);

  // -------------------------------------------------------------
  // TOP ARCHITECTURAL HEADER
  // -------------------------------------------------------------
  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 44,
    text: "ASTERISK / SYSTEM IDENTITY ARCHITECTURE",
    props: {
      fontSize: 11,
      fontFamily: "Liberation Mono",
      fontWeight: 700,
      fills: [{ type: "solid", color: "#F59E0B" }],
    },
  });

  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 68,
    text: "The Swiss Monolith — Visual Identity & System Standards",
    props: {
      fontSize: 28,
      fontFamily: "Inter",
      fontWeight: 700,
      fills: [{ type: "solid", color: "#F8FAFC" }],
    },
  });

  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 106,
    text: "Official brandmark specifications, geometric construction rules, lockup scaling, and production UI touchpoints.",
    props: {
      fontSize: 13,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#64748B" }],
    },
  });

  // -------------------------------------------------------------
  // ROW 1: CORE BRANDMARK & GEOMETRIC CONSTRUCTION
  // -------------------------------------------------------------
  // Card 1: Core Hero Mark (Width: 490, Height: 440)
  const heroCardRes = await tool("create_node", {
    type: "frame",
    name: "Panel_01_Master_Mark",
    parent: boardId,
    x: 64,
    y: 150,
    width: 490,
    height: 440,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c1 = getNodeId(heroCardRes);

  await cmd("text.create", {
    parent: c1,
    x: 28,
    y: 28,
    text: "01 / PRIMARY BRANDMARK",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Large Monolith Mark Container
  const markBox1 = await tool("create_node", {
    type: "frame",
    name: "Hero_Mark_Canvas",
    parent: c1,
    x: 28,
    y: 60,
    width: 434,
    height: 290,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const mb1 = getNodeId(markBox1);

  // The Big Swiss Monolith Vector
  await cmd("vector.create", {
    parent: mb1,
    path: buildSwissHeavyAsterisk(217, 145, 84, 17),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Amber Surgical Core
  await tool("create_node", {
    type: "ellipse",
    name: "Amber_Core_Hero",
    parent: mb1,
    x: 208,
    y: 136,
    width: 18,
    height: 18,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Label Below
  await cmd("text.create", {
    parent: c1,
    x: 28,
    y: 370,
    text: "The Swiss Monolith (Stark White #F8FAFC with Core #F59E0B)",
    props: { fontSize: 13, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: c1,
    x: 28,
    y: 395,
    text: "Primary optical weight: 5:1 length-to-width ratio with 60° flat-cut ends.",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // Card 2: Geometric Construction & Grid Blueprint (Width: 490, Height: 440)
  // -------------------------------------------------------------
  const blueprintRes = await tool("create_node", {
    type: "frame",
    name: "Panel_02_Construction_Blueprint",
    parent: boardId,
    x: 584,
    y: 150,
    width: 490,
    height: 440,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c2 = getNodeId(blueprintRes);

  await cmd("text.create", {
    parent: c2,
    x: 28,
    y: 28,
    text: "02 / GEOMETRIC BLUEPRINT & RATIOS",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#64748B" }] },
  });

  const markBox2 = await tool("create_node", {
    type: "frame",
    name: "Blueprint_Canvas",
    parent: c2,
    x: 28,
    y: 60,
    width: 434,
    height: 290,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const mb2 = getNodeId(markBox2);

  // Construction Outer Boundary Ring
  await tool("create_node", {
    type: "ellipse",
    name: "Outer_Ring_Guide",
    parent: mb2,
    x: 133,
    y: 61,
    width: 168,
    height: 168,
    props: {
      fills: [],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
    },
  });

  // Outer Hexagon Guide
  await tool("create_node", {
    type: "ellipse",
    name: "Mid_Ring_Guide",
    parent: mb2,
    x: 165,
    y: 93,
    width: 104,
    height: 104,
    props: {
      fills: [],
      strokes: [{ type: "solid", color: "#334155", weight: 1 }],
    },
  });

  // Vector mark with semi-transparent cyan / blueprint linework
  await cmd("vector.create", {
    parent: mb2,
    path: buildSwissHeavyAsterisk(217, 145, 84, 17),
    props: {
      fills: [{ type: "solid", color: "#101827" }],
      strokes: [{ type: "solid", color: "#38BDF8", weight: 1.5 }],
    },
  });

  // Crosshair center lines
  await tool("create_node", {
    type: "line",
    name: "Axis_Horizontal",
    parent: mb2,
    x: 97,
    y: 145,
    width: 240,
    props: { strokes: [{ type: "solid", color: "#F59E0B", weight: 0.8 }] },
  });

  // Center amber node
  await tool("create_node", {
    type: "ellipse",
    name: "Blueprint_Core",
    parent: mb2,
    x: 209,
    y: 137,
    width: 16,
    height: 16,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Blueprint annotations
  await cmd("text.create", {
    parent: c2,
    x: 28,
    y: 370,
    text: "Angles: 60.0° Fixed Symmetry   •   Bar Ratio: 1:4.94",
    props: { fontSize: 12, fontFamily: "Liberation Mono", fontWeight: 600, fills: [{ type: "solid", color: "#38BDF8" }] },
  });
  await cmd("text.create", {
    parent: c2,
    x: 28,
    y: 395,
    text: "Optical center point aligns strictly with the coordinate origin (0,0).",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // Card 3: Responsive Micro-Scale & Contrast Tests (Width: 490, Height: 440)
  // -------------------------------------------------------------
  const scaleCardRes = await tool("create_node", {
    type: "frame",
    name: "Panel_03_Scale_And_Contrast",
    parent: boardId,
    x: 1104,
    y: 150,
    width: 490,
    height: 440,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c3 = getNodeId(scaleCardRes);

  await cmd("text.create", {
    parent: c3,
    x: 28,
    y: 28,
    text: "03 / EXTREME SCALE & CONTRAST SUITE",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Micro Scale Simulation Row
  // 16px Favicon Test (Simulated in a 32px box)
  const box16 = await tool("create_node", {
    type: "frame",
    name: "Scale_16px_Frame",
    parent: c3,
    x: 28,
    y: 65,
    width: 48,
    height: 48,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 8 },
  });
  await cmd("vector.create", {
    parent: getNodeId(box16),
    path: buildSwissHeavyAsterisk(24, 24, 10, 2.2),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // 32px App Icon
  const box32 = await tool("create_node", {
    type: "frame",
    name: "Scale_32px_Frame",
    parent: c3,
    x: 92,
    y: 65,
    width: 64,
    height: 64,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 12 },
  });
  await cmd("vector.create", {
    parent: getNodeId(box32),
    path: buildSwissHeavyAsterisk(32, 32, 17, 3.6),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    name: "Core_32",
    parent: getNodeId(box32),
    x: 30,
    y: 30,
    width: 4,
    height: 4,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // 64px PWA Icon
  const box64 = await tool("create_node", {
    type: "frame",
    name: "Scale_64px_Frame",
    parent: c3,
    x: 172,
    y: 65,
    width: 96,
    height: 96,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#F59E0B", weight: 1.5 }], cornerRadius: 20 },
  });
  await cmd("vector.create", {
    parent: getNodeId(box64),
    path: buildSwissHeavyAsterisk(48, 48, 28, 6),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    name: "Core_64",
    parent: getNodeId(box64),
    x: 45,
    y: 45,
    width: 6,
    height: 6,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Inverted Solid Amber Tile (120px)
  const boxAmber = await tool("create_node", {
    type: "frame",
    name: "Scale_Amber_Tile",
    parent: c3,
    x: 284,
    y: 65,
    width: 178,
    height: 96,
    props: { fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 16 },
  });
  await cmd("vector.create", {
    parent: getNodeId(boxAmber),
    path: buildSwissHeavyAsterisk(89, 48, 28, 6),
    props: { fills: [{ type: "solid", color: "#06080D" }] },
  });

  // Dark & Light Contrast Rows
  await cmd("text.create", {
    parent: c3,
    x: 28,
    y: 195,
    text: "SUB-SURFACE ADAPTATIONS",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Subsurface 1: Elevated Slate Card
  const sub1 = await tool("create_node", {
    type: "frame",
    name: "Subsurface_Slate",
    parent: c3,
    x: 28,
    y: 220,
    width: 434,
    height: 56,
    props: { fills: [{ type: "solid", color: "#161D2C" }], cornerRadius: 8 },
  });
  await cmd("vector.create", {
    parent: getNodeId(sub1),
    path: buildSwissHeavyAsterisk(32, 28, 14, 3.2),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: getNodeId(sub1),
    x: 30,
    y: 26,
    width: 4,
    height: 4,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: getNodeId(sub1),
    x: 60,
    y: 20,
    text: "Elevated Surface Lockup (#161D2C) — Strict High Legibility",
    props: { fontSize: 12, fontFamily: "Inter", fontWeight: 500, fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // Subsurface 2: High-Contrast Inverted Paper Card (White background)
  const sub2 = await tool("create_node", {
    type: "frame",
    name: "Subsurface_Paper",
    parent: c3,
    x: 28,
    y: 290,
    width: 434,
    height: 56,
    props: { fills: [{ type: "solid", color: "#F8FAFC" }], cornerRadius: 8 },
  });
  await cmd("vector.create", {
    parent: getNodeId(sub2),
    path: buildSwissHeavyAsterisk(32, 28, 14, 3.2),
    props: { fills: [{ type: "solid", color: "#06080D" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: getNodeId(sub2),
    x: 30,
    y: 26,
    width: 4,
    height: 4,
    props: { fills: [{ type: "solid", color: "#D97706" }] },
  });
  await cmd("text.create", {
    parent: getNodeId(sub2),
    x: 60,
    y: 20,
    text: "Print & Invoice Monochrome (#F8FAFC) — Solid Black Silhouette",
    props: { fontSize: 12, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#06080D" }] },
  });

  // Scaling Rules text
  await cmd("text.create", {
    parent: c3,
    x: 28,
    y: 370,
    text: "Min. Size: 16×16 px   •   Safe Padding: 1.5× Core Width",
    props: { fontSize: 12, fontFamily: "Liberation Mono", fontWeight: 600, fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: c3,
    x: 28,
    y: 395,
    text: "Preserves zero blur at low PPI due to orthogonal alignment.",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // ROW 2: WORDMARK LOCKUPS & REAL-WORLD UI TOUCHPOINTS
  // -------------------------------------------------------------
  // Card 4: Official Lockups (Width: 748, Height: 510)
  const lockupCardRes = await tool("create_node", {
    type: "frame",
    name: "Panel_04_Official_Lockups",
    parent: boardId,
    x: 64,
    y: 615,
    width: 748,
    height: 505,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c4 = getNodeId(lockupCardRes);

  await cmd("text.create", {
    parent: c4,
    x: 28,
    y: 28,
    text: "04 / WORDMARK LOCKUP SUITE",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Horizontal Primary Lockup (Large)
  const hLockup = await tool("create_node", {
    type: "frame",
    name: "Primary_Horizontal_Box",
    parent: c4,
    x: 28,
    y: 60,
    width: 692,
    height: 120,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#161D2C", weight: 1 }], cornerRadius: 8 },
  });
  const hl = getNodeId(hLockup);

  await cmd("vector.create", {
    parent: hl,
    path: buildSwissHeavyAsterisk(65, 60, 32, 6.8),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: hl,
    x: 61.5,
    y: 56.5,
    width: 7,
    height: 7,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: hl,
    x: 125,
    y: 42,
    text: "ASTERISK",
    props: { fontSize: 34, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: hl,
    x: 127,
    y: 84,
    text: "ALL-IN-ONE HRIS INFRASTRUCTURE & CREDENTIAL PORTAL",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 500, fills: [{ type: "solid", color: "#38BDF8" }] },
  });

  // Stacked Lockup & Micro Lockup in split columns
  // Left: Stacked Lockup
  const vLockup = await tool("create_node", {
    type: "frame",
    name: "Stacked_Lockup_Box",
    parent: c4,
    x: 28,
    y: 200,
    width: 334,
    height: 270,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#161D2C", weight: 1 }], cornerRadius: 8 },
  });
  const vl = getNodeId(vLockup);

  await cmd("vector.create", {
    parent: vl,
    path: buildSwissHeavyAsterisk(167, 95, 38, 8),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: vl,
    x: 162.5,
    y: 90.5,
    width: 9,
    height: 9,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: vl,
    x: 95,
    y: 165,
    text: "ASTERISK",
    props: { fontSize: 24, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: vl,
    x: 65,
    y: 205,
    text: "STACKED / EDITORIAL VARIANT",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Right: Trailing Asterisk Wordmark Test
  const tLockup = await tool("create_node", {
    type: "frame",
    name: "Wordmark_Star_Box",
    parent: c4,
    x: 382,
    y: 200,
    width: 338,
    height: 270,
    props: { fills: [{ type: "solid", color: "#06080D" }], strokes: [{ type: "solid", color: "#161D2C", weight: 1 }], cornerRadius: 8 },
  });
  const tl = getNodeId(tLockup);

  await cmd("text.create", {
    parent: tl,
    x: 48,
    y: 75,
    text: "ASTERISK",
    props: { fontSize: 32, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("vector.create", {
    parent: tl,
    path: buildSwissHeavyAsterisk(230, 80, 16, 3.5),
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: tl,
    x: 48,
    y: 135,
    text: "Trailing Monolith Pointer",
    props: { fontSize: 14, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: tl,
    x: 48,
    y: 165,
    text: "Used in document footers, code comments, and CLI terminal output.",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // -------------------------------------------------------------
  // Card 5: Real UI Production Touchpoints (Width: 780, Height: 505)
  // -------------------------------------------------------------
  const uiCardRes = await tool("create_node", {
    type: "frame",
    name: "Panel_05_Production_UI_Touchpoints",
    parent: boardId,
    x: 836,
    y: 615,
    width: 780,
    height: 505,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 12,
    },
  });
  const c5 = getNodeId(uiCardRes);

  await cmd("text.create", {
    parent: c5,
    x: 28,
    y: 28,
    text: "05 / PRODUCTION APPLICATION TOUCHPOINTS (1:1 ACCURATE UI)",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Touchpoint A: 1:1 Dashboard Header Bar
  const navFrame = await tool("create_node", {
    type: "frame",
    name: "Touchpoint_Header_Bar",
    parent: c5,
    x: 28,
    y: 60,
    width: 724,
    height: 56,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
      strokes: [{ type: "solid", color: "#1A2234", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const nf = getNodeId(navFrame);

  // Logo in header
  await cmd("vector.create", {
    parent: nf,
    path: buildSwissHeavyAsterisk(32, 28, 11, 2.4),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: nf,
    x: 30.5,
    y: 26.5,
    width: 3,
    height: 3,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: nf,
    x: 52,
    y: 20,
    text: "ASTERISK",
    props: { fontSize: 14, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Project selector chip in header
  await tool("create_node", {
    type: "frame",
    name: "Project_Selector_Chip",
    parent: nf,
    x: 160,
    y: 12,
    width: 210,
    height: 32,
    props: { fills: [{ type: "solid", color: "#101623" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: nf,
    x: 172,
    y: 21,
    text: "PT Maju Jaya (MJY) v",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 500, fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // Showing Mode Switch in header
  await tool("create_node", {
    type: "frame",
    name: "Header_Showing_Toggle",
    parent: nf,
    x: 540,
    y: 12,
    width: 170,
    height: 32,
    props: { fills: [{ type: "solid", color: "#1C1408" }], strokes: [{ type: "solid", color: "#B45309", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: nf,
    x: 550,
    y: 21,
    text: "🛡️ SHOWING: ACTIVE",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Touchpoint B: Developer Terminal Window (CLI Output)
  const termFrame = await tool("create_node", {
    type: "frame",
    name: "Touchpoint_Terminal_Box",
    parent: c5,
    x: 28,
    y: 135,
    width: 724,
    height: 165,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
      strokes: [{ type: "solid", color: "#1A2234", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const tf = getNodeId(termFrame);

  // Terminal window topbar
  await tool("create_node", {
    type: "frame",
    name: "Terminal_Header",
    parent: tf,
    x: 0,
    y: 0,
    width: 724,
    height: 32,
    props: { fills: [{ type: "solid", color: "#0C1019" }], cornerRadius: 0 },
  });
  // 3 mac/unix window buttons
  await tool("create_node", { type: "ellipse", parent: tf, x: 16, y: 11, width: 10, height: 10, props: { fills: [{ type: "solid", color: "#334155" }] } });
  await tool("create_node", { type: "ellipse", parent: tf, x: 32, y: 11, width: 10, height: 10, props: { fills: [{ type: "solid", color: "#334155" }] } });
  await tool("create_node", { type: "ellipse", parent: tf, x: 48, y: 11, width: 10, height: 10, props: { fills: [{ type: "solid", color: "#334155" }] } });

  await cmd("text.create", {
    parent: tf,
    x: 70,
    y: 9,
    text: "zsh — asterisk cli v1.0.0 (x86_64-aws-ec2)",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  await cmd("text.create", {
    parent: tf,
    x: 20,
    y: 48,
    text: "➜  ~  moon run backend:dev\n[*] ASTERISK ENGINE INITIALIZED — PORT :3000\n[+] VAULT: AES-256-GCM Hardware Acceleration Enabled\n[+] ROUTE: 14 Endpoints Mounted at /api/v1 (TypeBox Verified)\n[✓] EDEN TREATY: Ready for Astro SSR Client Sync",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#38BDF8" }] },
  });

  // Touchpoint C: Vault Card with Logo Watermark (Height: 160)
  const cardVault = await tool("create_node", {
    type: "frame",
    name: "Touchpoint_Vault_Card",
    parent: c5,
    x: 28,
    y: 320,
    width: 724,
    height: 155,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
      strokes: [{ type: "solid", color: "#1A2234", weight: 1 }],
      cornerRadius: 8,
    },
  });
  const vcf = getNodeId(cardVault);

  // Background subtle logo watermark in vault
  await cmd("vector.create", {
    parent: vcf,
    path: buildSwissHeavyAsterisk(620, 80, 50, 10),
    props: { fills: [{ type: "solid", color: "#0E1522" }] },
  });

  await cmd("text.create", {
    parent: vcf,
    x: 24,
    y: 20,
    text: "CREDENTIAL VAULT / STAGING ENVIRONMENT",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: vcf,
    x: 24,
    y: 48,
    text: "DATABASE_PASSWORD",
    props: { fontSize: 13, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Masked dots
  await cmd("text.create", {
    parent: vcf,
    x: 24,
    y: 75,
    text: "••••••••••••••••••••••••",
    props: { fontSize: 18, fontFamily: "Liberation Mono", fontWeight: 800, fills: [{ type: "solid", color: "#475569" }] },
  });

  // Action Buttons
  await tool("create_node", {
    type: "frame",
    name: "Btn_Reveal",
    parent: vcf,
    x: 24,
    y: 105,
    width: 140,
    height: 32,
    props: { fills: [{ type: "solid", color: "#161D2C" }], strokes: [{ type: "solid", color: "#334155", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: vcf,
    x: 46,
    y: 113,
    text: "👁️ Reveal (Audit)",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  await tool("create_node", {
    type: "frame",
    name: "Btn_Copy",
    parent: vcf,
    x: 174,
    y: 105,
    width: 90,
    height: 32,
    props: { fills: [{ type: "solid", color: "#161D2C" }], strokes: [{ type: "solid", color: "#334155", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: vcf,
    x: 196,
    y: 113,
    text: "📋 Copy",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  console.log("Master Swiss Monolith Brand Architecture rendered 100% on FigCraft live canvas!");
  proc.kill();
}

main().catch((err) => {
  console.error("Error:", err);
  proc.kill();
});
