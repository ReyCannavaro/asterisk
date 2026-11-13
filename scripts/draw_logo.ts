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

async function main() {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity", version: "1.0" },
  });

  console.log("Connected to FigCraft Live Session!");

  // Clean previous nodes on the page
  await cmd("select.all", {});
  await cmd("edit.delete", {});

  // 1. Root Board Frame: 1440 x 960 (Obsidian Void #080B11)
  const boardRes = await tool("create_node", {
    type: "frame",
    name: "Asterisk_Logo_Design_System",
    x: 0,
    y: 0,
    width: 1440,
    height: 960,
    props: {
      fills: [{ type: "solid", color: "#080B11" }],
      cornerRadius: 16,
    },
  });
  const boardId = getNodeId(boardRes);
  console.log("Board ID:", boardId);

  // 2. Header
  // 2.1 Badge Pill
  await tool("create_node", {
    type: "frame",
    name: "Badge_System",
    parent: boardId,
    x: 64,
    y: 48,
    width: 220,
    height: 28,
    props: {
      fills: [{ type: "solid", color: "#1C1917" }],
      strokes: [{ type: "solid", color: "#F59E0B", weight: 1 }],
      cornerRadius: 14,
    },
  });

  await cmd("text.create", {
    parent: boardId,
    x: 78,
    y: 54,
    text: "✦ ASTERISK DESIGN SYSTEM v1.0",
    props: {
      fontSize: 10,
      fontFamily: "Liberation Mono",
      fills: [{ type: "solid", color: "#F59E0B" }],
    },
  });

  // 2.2 Header Title
  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 90,
    text: "Brandmark & Visual Identity System",
    props: {
      fontSize: 28,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#F8FAFC" }],
    },
  });

  // 2.3 Header Subtitle
  await cmd("text.create", {
    parent: boardId,
    x: 64,
    y: 130,
    text: "All-in-one System for Tracking Environments, Repositories, Issues, & Software Knowledge",
    props: {
      fontSize: 14,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#94A3B8" }],
    },
  });

  // 3. Hero Card (Left Column) - Width 580, Height 530
  const heroCardRes = await tool("create_node", {
    type: "frame",
    name: "Hero_Logo_Display",
    parent: boardId,
    x: 64,
    y: 175,
    width: 580,
    height: 530,
    props: {
      fills: [{ type: "solid", color: "#0F172A" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 16,
    },
  });
  const heroId = getNodeId(heroCardRes);
  console.log("Hero Card ID:", heroId);

  // Background subtle glow circle
  await tool("create_node", {
    type: "ellipse",
    name: "Aura_Glow",
    parent: heroId,
    x: 210,
    y: 60,
    width: 160,
    height: 160,
    props: {
      fills: [{ type: "solid", color: "#1C1917" }],
      strokes: [{ type: "solid", color: "#78350F", weight: 1 }],
    },
  });

  // 3 Intersecting Asterisk Capsules
  // Vertical
  await tool("create_node", {
    type: "rectangle",
    name: "Asterisk_Bar_1",
    parent: heroId,
    x: 278,
    y: 70,
    width: 24,
    height: 140,
    props: {
      fills: [{ type: "solid", color: "#F59E0B" }],
      cornerRadius: 12,
    },
  });

  // Rotated 60 deg
  await tool("create_node", {
    type: "rectangle",
    name: "Asterisk_Bar_2",
    parent: heroId,
    x: 278,
    y: 70,
    width: 24,
    height: 140,
    props: {
      rotation: 60,
      fills: [{ type: "solid", color: "#F59E0B" }],
      cornerRadius: 12,
    },
  });

  // Rotated 120 deg
  await tool("create_node", {
    type: "rectangle",
    name: "Asterisk_Bar_3",
    parent: heroId,
    x: 278,
    y: 70,
    width: 24,
    height: 140,
    props: {
      rotation: 120,
      fills: [{ type: "solid", color: "#F59E0B" }],
      cornerRadius: 12,
    },
  });

  // Glowing Core Dot
  await tool("create_node", {
    type: "ellipse",
    name: "Asterisk_Core",
    parent: heroId,
    x: 275,
    y: 125,
    width: 30,
    height: 30,
    props: {
      fills: [{ type: "solid", color: "#FDE68A" }],
    },
  });

  // Wordmark: "ASTERISK *"
  await cmd("text.create", {
    parent: heroId,
    x: 175,
    y: 265,
    text: "ASTERISK",
    props: {
      fontSize: 42,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#F8FAFC" }],
    },
  });

  await cmd("text.create", {
    parent: heroId,
    x: 400,
    y: 262,
    text: "*",
    props: {
      fontSize: 46,
      fontFamily: "Inter",
      fills: [{ type: "solid", color: "#F59E0B" }],
    },
  });

  // Subtitle Tagline
  await cmd("text.create", {
    parent: heroId,
    x: 135,
    y: 335,
    text: "INTERNAL DEVELOPER & DELIVERY PORTAL",
    props: {
      fontSize: 11,
      fontFamily: "Liberation Mono",
      fills: [{ type: "solid", color: "#38BDF8" }],
    },
  });

  // Hero Metadata Footer Bar
  await tool("create_node", {
    type: "frame",
    name: "Hero_Meta_Bar",
    parent: heroId,
    x: 40,
    y: 435,
    width: 500,
    height: 48,
    props: {
      fills: [{ type: "solid", color: "#080B11" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 8,
    },
  });

  await cmd("text.create", {
    parent: heroId,
    x: 60,
    y: 452,
    text: "PORT :3000/:4321  •  AES-256-GCM VAULT  •  DUAL RBAC",
    props: {
      fontSize: 11,
      fontFamily: "Liberation Mono",
      fills: [{ type: "solid", color: "#64748B" }],
    },
  });

  // 4. Right Column Variations
  // 4.1 Card 1: Horizontal Lockup Bar (x: 676, y: 175, width: 700, height: 160)
  const var1Res = await tool("create_node", {
    type: "frame",
    name: "Lockup_Horizontal_Bar",
    parent: boardId,
    x: 676,
    y: 175,
    width: 700,
    height: 160,
    props: {
      fills: [{ type: "solid", color: "#0F172A" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 14,
    },
  });
  const var1Id = getNodeId(var1Res);
  console.log("Var1 ID:", var1Id);

  // Mini Icon for Lockup (3 bars)
  await tool("create_node", {
    type: "rectangle",
    name: "Mini_Bar_1",
    parent: var1Id,
    x: 50,
    y: 50,
    width: 10,
    height: 60,
    props: { fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 5 },
  });
  await tool("create_node", {
    type: "rectangle",
    name: "Mini_Bar_2",
    parent: var1Id,
    x: 50,
    y: 50,
    width: 10,
    height: 60,
    props: { rotation: 60, fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 5 },
  });
  await tool("create_node", {
    type: "rectangle",
    name: "Mini_Bar_3",
    parent: var1Id,
    x: 50,
    y: 50,
    width: 10,
    height: 60,
    props: { rotation: 120, fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 5 },
  });

  await cmd("text.create", {
    parent: var1Id,
    x: 135,
    y: 52,
    text: "ASTERISK",
    props: { fontSize: 26, fontFamily: "Inter", fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: var1Id,
    x: 275,
    y: 50,
    text: "*",
    props: { fontSize: 28, fontFamily: "Inter", fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: var1Id,
    x: 135,
    y: 90,
    text: "Header & Navigation Bar Primary Lockup Variant",
    props: { fontSize: 13, fontFamily: "Inter", fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // 4.2 Card 2: App Icon & Favicon Suite (x: 676, y: 355, width: 700, height: 165)
  const var2Res = await tool("create_node", {
    type: "frame",
    name: "App_Icon_System",
    parent: boardId,
    x: 676,
    y: 355,
    width: 700,
    height: 165,
    props: {
      fills: [{ type: "solid", color: "#0F172A" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 14,
    },
  });
  const var2Id = getNodeId(var2Res);
  console.log("Var2 ID:", var2Id);

  // Dark Obsidian Tile
  await tool("create_node", {
    type: "frame",
    name: "App_Tile_Dark",
    parent: var2Id,
    x: 40,
    y: 35,
    width: 96,
    height: 96,
    props: {
      fills: [{ type: "solid", color: "#080B11" }],
      strokes: [{ type: "solid", color: "#F59E0B", weight: 1.5 }],
      cornerRadius: 22,
    },
  });
  await cmd("text.create", {
    parent: var2Id,
    x: 74,
    y: 42,
    text: "*",
    props: { fontSize: 64, fontFamily: "Inter", fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  // Full Amber Tile
  await tool("create_node", {
    type: "frame",
    name: "App_Tile_Amber",
    parent: var2Id,
    x: 156,
    y: 35,
    width: 96,
    height: 96,
    props: {
      fills: [{ type: "solid", color: "#F59E0B" }],
      cornerRadius: 22,
    },
  });
  await cmd("text.create", {
    parent: var2Id,
    x: 190,
    y: 42,
    text: "*",
    props: { fontSize: 64, fontFamily: "Inter", fills: [{ type: "solid", color: "#080B11" }] },
  });

  await cmd("text.create", {
    parent: var2Id,
    x: 280,
    y: 50,
    text: "App Icon & Favicon Suite",
    props: { fontSize: 18, fontFamily: "Inter", fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: var2Id,
    x: 280,
    y: 82,
    text: "High-contrast square icons for browser tabs, dock, PWA & mobile shortcuts.",
    props: { fontSize: 12, fontFamily: "Inter", fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // 4.3 Card 3: Showing Mode Presentation Badge (x: 676, y: 540, width: 700, height: 165)
  const var3Res = await tool("create_node", {
    type: "frame",
    name: "Showing_Mode_Badge_Card",
    parent: boardId,
    x: 676,
    y: 540,
    width: 700,
    height: 165,
    props: {
      fills: [{ type: "solid", color: "#0F172A" }],
      strokes: [{ type: "solid", color: "#78350F", weight: 1.5 }],
      cornerRadius: 14,
    },
  });
  const var3Id = getNodeId(var3Res);
  console.log("Var3 ID:", var3Id);

  await tool("create_node", {
    type: "frame",
    name: "Showing_Badge_Pill",
    parent: var3Id,
    x: 40,
    y: 30,
    width: 250,
    height: 36,
    props: {
      fills: [{ type: "solid", color: "#1C1917" }],
      strokes: [{ type: "solid", color: "#F59E0B", weight: 1 }],
      cornerRadius: 8,
    },
  });
  await cmd("text.create", {
    parent: var3Id,
    x: 54,
    y: 40,
    text: "🛡️ ASTERISK * SHOWING MODE",
    props: { fontSize: 12, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: var3Id,
    x: 40,
    y: 84,
    text: "Live Client Presentation State",
    props: { fontSize: 16, fontFamily: "Inter", fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: var3Id,
    x: 40,
    y: 112,
    text: "Specialized header badge with amber shield indicator when screen-sharing with clients.",
    props: { fontSize: 12, fontFamily: "Inter", fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // 5. Bottom Palette Swatches (x: 64, y: 725, width: 1312, height: 185)
  const paletteCardRes = await tool("create_node", {
    type: "frame",
    name: "Brand_Color_Palette",
    parent: boardId,
    x: 64,
    y: 725,
    width: 1312,
    height: 185,
    props: {
      fills: [{ type: "solid", color: "#0F172A" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 16,
    },
  });
  const palId = getNodeId(paletteCardRes);
  console.log("Palette Card ID:", palId);

  await cmd("text.create", {
    parent: palId,
    x: 32,
    y: 18,
    text: "OFFICIAL SYSTEM COLOR SPECIFICATION",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  const swatches = [
    { name: "Obsidian Void", hex: "#080B11", role: "Canvas Base", border: "#334155" },
    { name: "Deep Slate", hex: "#0F172A", role: "Surface Card", border: "#334155" },
    { name: "Elevated Slate", hex: "#1E293B", role: "Border / Hover", border: "#475569" },
    { name: "Electric Amber", hex: "#F59E0B", role: "Brand Primary", border: "#F59E0B" },
    { name: "Terminal Emerald", hex: "#10B981", role: "QA Verified", border: "#10B981" },
    { name: "Tactical Cyan", hex: "#38BDF8", role: "Ports / Repos", border: "#38BDF8" },
  ];

  for (let i = 0; i < swatches.length; i++) {
    const s = swatches[i];
    const sx = 32 + i * 210;
    // Color block
    await tool("create_node", {
      type: "rectangle",
      name: `Swatch_${i + 1}`,
      parent: palId,
      x: sx,
      y: 48,
      width: 195,
      height: 54,
      props: {
        fills: [{ type: "solid", color: s.hex }],
        strokes: [{ type: "solid", color: s.border, weight: 1 }],
        cornerRadius: 8,
      },
    });

    // Swatch name
    await cmd("text.create", {
      parent: palId,
      x: sx,
      y: 112,
      text: s.name,
      props: { fontSize: 13, fontFamily: "Inter", fills: [{ type: "solid", color: "#F8FAFC" }] },
    });

    // Swatch Hex & Role
    await cmd("text.create", {
      parent: palId,
      x: sx,
      y: 134,
      text: `${s.hex} • ${s.role}`,
      props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
    });
  }

  console.log("Master Asterisk Brandboard rendered 100% on FigCraft live canvas!");
  proc.kill();
}

main().catch((err) => {
  console.error("Error running script:", err);
  proc.kill();
});
