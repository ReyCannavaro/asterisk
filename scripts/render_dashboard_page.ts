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

// Swiss Monolith Vector Mark
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

  // Master Dashboard Viewport Frame: 1440 x 920
  // Place it alongside the brand board at x: 1750, y: 0
  const appRes = await tool("create_node", {
    type: "frame",
    name: "Asterisk_App_Dashboard_Console",
    x: 1750,
    y: 0,
    width: 1440,
    height: 920,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
    },
  });
  const appId = getNodeId(appRes);
  console.log("Dashboard Frame ID:", appId);

  // =============================================================
  // 1. TOP GLOBAL NAVIGATION BAR (Height: 56px, Width: 1440px)
  // =============================================================
  const topNavRes = await tool("create_node", {
    type: "frame",
    name: "Top_Navbar",
    parent: appId,
    x: 0,
    y: 0,
    width: 1440,
    height: 56,
    props: {
      fills: [{ type: "solid", color: "#0A0D15" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
    },
  });
  const navId = getNodeId(topNavRes);

  // Brand Logo Mark (Swiss Monolith)
  await cmd("vector.create", {
    parent: navId,
    path: buildSwissHeavyAsterisk(32, 28, 11, 2.4),
    props: { fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await tool("create_node", {
    type: "ellipse",
    name: "Nav_Amber_Core",
    parent: navId,
    x: 30.5,
    y: 26.5,
    width: 3,
    height: 3,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  await cmd("text.create", {
    parent: navId,
    x: 52,
    y: 19,
    text: "ASTERISK",
    props: { fontSize: 15, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Vertical Separator
  await tool("create_node", {
    type: "line",
    parent: navId,
    x: 155,
    y: 16,
    width: 24,
    props: { rotation: 90, strokes: [{ type: "solid", color: "#1E293B", weight: 1 }] },
  });

  // Project Switcher Dropdown Chip
  const prjChip = await tool("create_node", {
    type: "frame",
    name: "Project_Selector_Dropdown",
    parent: navId,
    x: 175,
    y: 12,
    width: 240,
    height: 32,
    props: {
      fills: [{ type: "solid", color: "#101623" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 6,
    },
  });
  await cmd("text.create", {
    parent: getNodeId(prjChip),
    x: 12,
    y: 8,
    text: "PT Maju Jaya [MJY] • v3.2.0  ▾",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // Quick Command Bar Search Pill (Cmd+K)
  const searchPill = await tool("create_node", {
    type: "frame",
    name: "Command_Search_Bar",
    parent: navId,
    x: 440,
    y: 12,
    width: 320,
    height: 32,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 6,
    },
  });
  await cmd("text.create", {
    parent: getNodeId(searchPill),
    x: 12,
    y: 8,
    text: "🔍  Search ports, secrets, tickets...",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#475569" }] },
  });
  await cmd("text.create", {
    parent: getNodeId(searchPill),
    x: 275,
    y: 8,
    text: "⌘K",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Showing Mode Switch (Safe Presentation Toggle)
  const showToggle = await tool("create_node", {
    type: "frame",
    name: "Toggle_Showing_Mode",
    parent: navId,
    x: 1030,
    y: 12,
    width: 195,
    height: 32,
    props: {
      fills: [{ type: "solid", color: "#141B2A" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 6,
    },
  });
  await cmd("text.create", {
    parent: getNodeId(showToggle),
    x: 12,
    y: 8,
    text: "🛡️ SHOWING MODE: OFF",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // User Profile Pill
  const userPill = await tool("create_node", {
    type: "frame",
    name: "User_Avatar_Pill",
    parent: navId,
    x: 1245,
    y: 12,
    width: 175,
    height: 32,
    props: {
      fills: [{ type: "solid", color: "#101623" }],
      strokes: [{ type: "solid", color: "#1E293B", weight: 1 }],
      cornerRadius: 6,
    },
  });
  await tool("create_node", {
    type: "ellipse",
    parent: getNodeId(userPill),
    x: 8,
    y: 6,
    width: 20,
    height: 20,
    props: { fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: getNodeId(userPill),
    x: 34,
    y: 8,
    text: "Rey (Lead PM)",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // =============================================================
  // 2. LEFT SIDEBAR (Width: 230px, Height: 864px)
  // =============================================================
  const sideRes = await tool("create_node", {
    type: "frame",
    name: "Sidebar_Menu",
    parent: appId,
    x: 0,
    y: 56,
    width: 230,
    height: 864,
    props: {
      fills: [{ type: "solid", color: "#080B12" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
    },
  });
  const sideId = getNodeId(sideRes);

  const menuItems = [
    { label: "Overview", icon: "❖", active: true },
    { label: "Vault & Secrets", icon: "🔒", active: false, badge: "AES" },
    { label: "Asterisk Sheet", icon: "▦", active: false, badge: "Live" },
    { label: "QA & Tickets", icon: "✓", active: false, badge: "5" },
    { label: "Environments", icon: "⚙", active: false },
    { label: "Audit Trail", icon: "📜", active: false },
  ];

  await cmd("text.create", {
    parent: sideId,
    x: 20,
    y: 20,
    text: "PROJECT CONSOLE",
    props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#475569" }] },
  });

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const itemY = 44 + i * 42;

    const rowItem = await tool("create_node", {
      type: "frame",
      name: `Nav_Item_${item.label}`,
      parent: sideId,
      x: 12,
      y: itemY,
      width: 206,
      height: 36,
      props: {
        fills: item.active ? [{ type: "solid", color: "#131926" }] : [],
        strokes: item.active ? [{ type: "solid", color: "#F59E0B", weight: 1 }] : [],
        cornerRadius: 6,
      },
    });
    const rId = getNodeId(rowItem);

    await cmd("text.create", {
      parent: rId,
      x: 12,
      y: 9,
      text: `${item.icon}   ${item.label}`,
      props: {
        fontSize: 12,
        fontFamily: "Inter",
        fontWeight: item.active ? 600 : 500,
        fills: item.active ? [{ type: "solid", color: "#F8FAFC" }] : [{ type: "solid", color: "#94A3B8" }],
      },
    });

    if (item.badge) {
      await tool("create_node", {
        type: "frame",
        parent: rId,
        x: 165,
        y: 8,
        width: 32,
        height: 20,
        props: { fills: [{ type: "solid", color: item.active ? "#F59E0B" : "#1A2234" }], cornerRadius: 4 },
      });
      await cmd("text.create", {
        parent: rId,
        x: 170,
        y: 11,
        text: item.badge,
        props: {
          fontSize: 9,
          fontFamily: "Liberation Mono",
          fontWeight: 700,
          fills: [{ type: "solid", color: item.active ? "#06080D" : "#94A3B8" }],
        },
      });
    }
  }

  // Bottom Settings Row in Sidebar
  await tool("create_node", {
    type: "line",
    parent: sideId,
    x: 12,
    y: 780,
    width: 206,
    props: { strokes: [{ type: "solid", color: "#161D2C", weight: 1 }] },
  });
  await cmd("text.create", {
    parent: sideId,
    x: 24,
    y: 800,
    text: "⚙  Dynamic RBAC Matrix",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 500, fills: [{ type: "solid", color: "#64748B" }] },
  });

  // =============================================================
  // 3. MAIN CONTENT VIEWPORT (x: 230, y: 56, width: 1210, height: 864)
  // =============================================================
  const mainRes = await tool("create_node", {
    type: "frame",
    name: "Main_Viewport_Content",
    parent: appId,
    x: 230,
    y: 56,
    width: 1210,
    height: 864,
    props: {
      fills: [{ type: "solid", color: "#06080D" }],
    },
  });
  const mainId = getNodeId(mainRes);

  // 3.1 Project Header Bar (Title, Meta, and Action Buttons)
  await cmd("text.create", {
    parent: mainId,
    x: 32,
    y: 24,
    text: "PT Maju Jaya Solusindo — HRIS Deployment Hub",
    props: { fontSize: 20, fontFamily: "Inter", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  await cmd("text.create", {
    parent: mainId,
    x: 32,
    y: 52,
    text: "Client Code: MJY-HRIS   •   Branch: main (commit #a8f2e9)   •   Status: Phase 3 (UAT & Showing)",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#38BDF8" }] },
  });

  // Action Buttons on Top Right of Viewport
  const btnFeedback = await tool("create_node", {
    type: "frame",
    name: "Btn_Add_Feedback",
    parent: mainId,
    x: 930,
    y: 24,
    width: 130,
    height: 36,
    props: { fills: [{ type: "solid", color: "#F59E0B" }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: getNodeId(btnFeedback),
    x: 16,
    y: 9,
    text: "＋ New Feedback",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 700, fills: [{ type: "solid", color: "#06080D" }] },
  });

  const btnRepo = await tool("create_node", {
    type: "frame",
    name: "Btn_GitHub_Repo",
    parent: mainId,
    x: 1070,
    y: 24,
    width: 105,
    height: 36,
    props: { fills: [{ type: "solid", color: "#131926" }], strokes: [{ type: "solid", color: "#1E293B", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: getNodeId(btnRepo),
    x: 16,
    y: 9,
    text: "GitHub ↗",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });

  // 3.2 Metrics Row (4 Compact Cards: Width 268 each, Gap 16)
  const metrics = [
    { title: "GENERATOR SERVICES", value: "3 / 3 Online", status: "● All ports active", color: "#10B981" },
    { title: "SECRETS IN VAULT", value: "14 Encrypted", status: "● AES-256-GCM armed", color: "#F59E0B" },
    { title: "SHOWING FEEDBACK", value: "32 Entries", status: "● 6 Converted to ticket", color: "#38BDF8" },
    { title: "QA VERIFICATION GATE", value: "5 In Review", status: "● 2 Approved today", color: "#A855F7" },
  ];

  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    const mx = 32 + i * 286;

    const mCard = await tool("create_node", {
      type: "frame",
      name: `Metric_${m.title}`,
      parent: mainId,
      x: mx,
      y: 84,
      width: 270,
      height: 96,
      props: {
        fills: [{ type: "solid", color: "#0C1019" }],
        strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
        cornerRadius: 8,
      },
    });
    const mcId = getNodeId(mCard);

    await cmd("text.create", {
      parent: mcId,
      x: 16,
      y: 14,
      text: m.title,
      props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#64748B" }] },
    });
    await cmd("text.create", {
      parent: mcId,
      x: 16,
      y: 36,
      text: m.value,
      props: { fontSize: 20, fontFamily: "Inter", fontWeight: 800, fills: [{ type: "solid", color: "#F8FAFC" }] },
    });
    await cmd("text.create", {
      parent: mcId,
      x: 16,
      y: 68,
      text: m.status,
      props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 600, fills: [{ type: "solid", color: m.color }] },
    });
  }

  // -------------------------------------------------------------
  // 3.3 Middle Row: Environment & Port Directory (Left, 680px)
  // -------------------------------------------------------------
  const envCard = await tool("create_node", {
    type: "frame",
    name: "Environment_Port_Directory",
    parent: mainId,
    x: 32,
    y: 200,
    width: 680,
    height: 380,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 10,
    },
  });
  const ecId = getNodeId(envCard);

  await cmd("text.create", {
    parent: ecId,
    x: 20,
    y: 20,
    text: "ENVIRONMENTS & HOST ACCESS DIRECTORY",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: ecId,
    x: 20,
    y: 38,
    text: "Live server ports, generator bindings, and encrypted database endpoints.",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  // Table Header
  const envTableHead = await tool("create_node", {
    type: "frame",
    parent: ecId,
    x: 20,
    y: 68,
    width: 640,
    height: 30,
    props: { fills: [{ type: "solid", color: "#06080D" }], cornerRadius: 4 },
  });
  await cmd("text.create", { parent: getNodeId(envTableHead), x: 12, y: 8, text: "ENV", props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });
  await cmd("text.create", { parent: getNodeId(envTableHead), x: 90, y: 8, text: "HOST / URL", props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });
  await cmd("text.create", { parent: getNodeId(envTableHead), x: 280, y: 8, text: "PORT", props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });
  await cmd("text.create", { parent: getNodeId(envTableHead), x: 380, y: 8, text: "DB SECRET", props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });
  await cmd("text.create", { parent: getNodeId(envTableHead), x: 550, y: 8, text: "ACTION", props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });

  const envRows = [
    { env: "DEV", host: "192.168.10.45", port: ":3001", secret: "••••••••••••", action: "Reveal", tag: "#38BDF8" },
    { env: "STAGING", host: "uat-hris.majujaya.com", port: ":8080", secret: "••••••••••••", action: "Reveal", tag: "#F59E0B" },
    { env: "PROD", host: "hris.majujaya.com", port: ":443", secret: "[PROTECTED]", action: "Locked", tag: "#10B981" },
  ];

  for (let i = 0; i < envRows.length; i++) {
    const row = envRows[i];
    const ry = 108 + i * 54;

    const rBox = await tool("create_node", {
      type: "frame",
      name: `Env_Row_${row.env}`,
      parent: ecId,
      x: 20,
      y: ry,
      width: 640,
      height: 44,
      props: {
        fills: [{ type: "solid", color: "#0E131F" }],
        strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
        cornerRadius: 6,
      },
    });
    const rbId = getNodeId(rBox);

    // Tag
    await tool("create_node", {
      type: "frame",
      parent: rbId,
      x: 10,
      y: 11,
      width: 58,
      height: 22,
      props: { fills: [{ type: "solid", color: "#161D2C" }], cornerRadius: 4 },
    });
    await cmd("text.create", {
      parent: rbId,
      x: 18,
      y: 15,
      text: row.env,
      props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: row.tag }] },
    });

    // Host
    await cmd("text.create", {
      parent: rbId,
      x: 90,
      y: 15,
      text: row.host,
      props: { fontSize: 12, fontFamily: "Inter", fontWeight: 500, fills: [{ type: "solid", color: "#F8FAFC" }] },
    });

    // Port badge
    await cmd("text.create", {
      parent: rbId,
      x: 280,
      y: 15,
      text: `${row.port} 📋`,
      props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 600, fills: [{ type: "solid", color: "#38BDF8" }] },
    });

    // Secret Masked
    await cmd("text.create", {
      parent: rbId,
      x: 380,
      y: 14,
      text: row.secret,
      props: { fontSize: 12, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] },
    });

    // Action button
    await tool("create_node", {
      type: "frame",
      parent: rbId,
      x: 540,
      y: 8,
      width: 85,
      height: 28,
      props: {
        fills: row.action === "Locked" ? [{ type: "solid", color: "#131926" }] : [{ type: "solid", color: "#1E293B" }],
        cornerRadius: 4,
      },
    });
    await cmd("text.create", {
      parent: rbId,
      x: 555,
      y: 14,
      text: row.action,
      props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: row.action === "Locked" ? "#64748B" : "#F8FAFC" }] },
    });
  }

  // Environment Note Box
  await tool("create_node", {
    type: "frame",
    parent: ecId,
    x: 20,
    y: 285,
    width: 640,
    height: 72,
    props: { fills: [{ type: "solid", color: "#070A10" }], strokes: [{ type: "solid", color: "#161D2C", weight: 1 }], cornerRadius: 6 },
  });
  await cmd("text.create", {
    parent: ecId,
    x: 36,
    y: 298,
    text: "💡 Generator Restart Command:",
    props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F59E0B" }] },
  });
  await cmd("text.create", {
    parent: ecId,
    x: 36,
    y: 322,
    text: "docker exec -it hris_gen_mjy systemctl restart hr-payroll-engine",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#94A3B8" }] },
  });

  // -------------------------------------------------------------
  // 3.4 Middle Row: Recent Asterisk Sheet Feedback (Right, 460px)
  // -------------------------------------------------------------
  const sheetCard = await tool("create_node", {
    type: "frame",
    name: "Recent_Showing_Feedback_Stream",
    parent: mainId,
    x: 728,
    y: 200,
    width: 450,
    height: 380,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 10,
    },
  });
  const scId = getNodeId(sheetCard);

  await cmd("text.create", {
    parent: scId,
    x: 20,
    y: 20,
    text: "SHOWING FEEDBACK (SPRINT 3)",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F8FAFC" }] },
  });
  await cmd("text.create", {
    parent: scId,
    x: 20,
    y: 38,
    text: "Fast-entry notes recorded during client showing.",
    props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#64748B" }] },
  });

  const feedbackItems = [
    { mod: "PAYROLL", note: "Tombol cetak slip gaji minta format PDF standar", status: "CONVERTED", sColor: "#10B981" },
    { mod: "ATTENDANCE", note: "GPS radius absensi di mobile sering loncat 50m", status: "READY QA", sColor: "#38BDF8" },
    { mod: "MASTER", note: "Data sisa cuti tahun lalu minta bisa di-carry over", status: "BACKLOG", sColor: "#F59E0B" },
    { mod: "CLAIM", note: "Plafon reimbursement rawat jalan belum update", status: "OPEN", sColor: "#94A3B8" },
  ];

  for (let i = 0; i < feedbackItems.length; i++) {
    const f = feedbackItems[i];
    const fy = 68 + i * 72;

    const fBox = await tool("create_node", {
      type: "frame",
      name: `Feedback_Item_${i + 1}`,
      parent: scId,
      x: 20,
      y: fy,
      width: 410,
      height: 60,
      props: {
        fills: [{ type: "solid", color: "#0E131F" }],
        strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
        cornerRadius: 6,
      },
    });
    const fbId = getNodeId(fBox);

    await cmd("text.create", {
      parent: fbId,
      x: 12,
      y: 10,
      text: f.mod,
      props: { fontSize: 9, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#38BDF8" }] },
    });

    await cmd("text.create", {
      parent: fbId,
      x: 320,
      y: 10,
      text: f.status,
      props: { fontSize: 9, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: f.sColor }] },
    });

    await cmd("text.create", {
      parent: fbId,
      x: 12,
      y: 30,
      text: f.note,
      props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#F8FAFC" }] },
    });
  }

  // -------------------------------------------------------------
  // 3.5 Bottom Row: Live Audit Trail & Ticket Summary (Width: 1146px)
  // -------------------------------------------------------------
  const auditCard = await tool("create_node", {
    type: "frame",
    name: "Audit_Trail_Strip",
    parent: mainId,
    x: 32,
    y: 596,
    width: 1146,
    height: 240,
    props: {
      fills: [{ type: "solid", color: "#0C1019" }],
      strokes: [{ type: "solid", color: "#161D2C", weight: 1 }],
      cornerRadius: 10,
    },
  });
  const acId = getNodeId(auditCard);

  await cmd("text.create", {
    parent: acId,
    x: 24,
    y: 18,
    text: "IMMUTABLE AUDIT TRAIL — ZERO TRUST ACTIVITY LOG",
    props: { fontSize: 11, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F59E0B" }] },
  });

  const logs = [
    { time: "Today 08:24:12", user: "Rey (Superadmin)", action: "SECRET_REVEALED", resource: "secret:DB_PASSWORD (STAGING)", ip: "103.144.12.8" },
    { time: "Today 07:15:02", user: "Alex (Developer)", action: "STATUS_CHANGED", resource: "ticket:#MJY-042 -> READY_FOR_QA", ip: "182.253.4.11" },
    { time: "Yesterday 18:40", user: "Cindy (QA)", action: "QA_VERIFIED", resource: "ticket:#MJY-039 -> CLOSED (Passed)", ip: "114.125.88.9" },
    { time: "Yesterday 15:10", user: "Rey (Superadmin)", action: "SHOWING_MODE_TOGGLED", resource: "state:SHOWING_MODE -> ACTIVE", ip: "103.144.12.8" },
  ];

  for (let i = 0; i < logs.length; i++) {
    const l = logs[i];
    const ly = 48 + i * 44;

    const lRow = await tool("create_node", {
      type: "frame",
      name: `Audit_Row_${i + 1}`,
      parent: acId,
      x: 20,
      y: ly,
      width: 1106,
      height: 36,
      props: {
        fills: [{ type: "solid", color: "#070A10" }],
        strokes: [{ type: "solid", color: "#131926", weight: 1 }],
        cornerRadius: 4,
      },
    });
    const lrId = getNodeId(lRow);

    await cmd("text.create", { parent: lrId, x: 14, y: 11, text: l.time, props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#64748B" }] } });
    await cmd("text.create", { parent: lrId, x: 160, y: 11, text: l.user, props: { fontSize: 11, fontFamily: "Inter", fontWeight: 600, fills: [{ type: "solid", color: "#F8FAFC" }] } });
    await cmd("text.create", { parent: lrId, x: 340, y: 11, text: l.action, props: { fontSize: 10, fontFamily: "Liberation Mono", fontWeight: 700, fills: [{ type: "solid", color: "#F59E0B" }] } });
    await cmd("text.create", { parent: lrId, x: 540, y: 11, text: l.resource, props: { fontSize: 11, fontFamily: "Inter", fills: [{ type: "solid", color: "#94A3B8" }] } });
    await cmd("text.create", { parent: lrId, x: 960, y: 11, text: l.ip, props: { fontSize: 10, fontFamily: "Liberation Mono", fills: [{ type: "solid", color: "#475569" }] } });
  }

  // Select the new dashboard frame so FigCraft highlights it!
  await cmd("select.set", { ids: [appId] });

  console.log("Full Asterisk Dashboard Console successfully rendered on FigCraft canvas!");
  proc.kill();
}

main().catch((err) => {
  console.error("Error:", err);
  proc.kill();
});

