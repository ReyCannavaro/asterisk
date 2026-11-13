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

// Heavy Swiss Asterisk SVG generator
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

async function createFrame(parent: number, name: string, x: number, y: number, width: number, height: number, fills: any[], cornerRadius = 0, strokes?: any[]) {
  const props: any = { fills };
  if (cornerRadius > 0) props.cornerRadius = cornerRadius;
  if (strokes && strokes.length > 0) props.strokes = strokes;
  const res = await tool("create_node", {
    type: "frame",
    name,
    parent,
    x,
    y,
    width,
    height,
    props,
  });
  return getNodeId(res);
}

async function createText(parent: number, text: string, x: number, y: number, fontSize: number, color: string, fontWeight = 400, fontFamily = "Inter") {
  return await cmd("text.create", {
    parent,
    x,
    y,
    text,
    props: {
      fontSize,
      fontFamily,
      fontWeight,
      fills: [{ type: "solid", color }],
    },
  });
}

async function createVector(parent: number, path: string, x: number, y: number, color: string) {
  return await cmd("vector.create", {
    parent,
    x,
    y,
    path,
    props: {
      fills: [{ type: "solid", color }],
    },
  });
}

const ICONS = {
  home: "M8 1.5L1.5 7.5H3.5V14H6.5V9.5H9.5V14H12.5V7.5H14.5L8 1.5Z",
  pulse: "M1.5 8H4L6 3.5L9.5 13L11.5 8H14.5",
  grid: "M2 2H6.5V6.5H2V2ZM9.5 2H14V6.5H9.5V2ZM2 9.5H6.5V14H2V9.5ZM9.5 9.5H14V14H9.5V9.5Z",
  chat: "M2 3.5C2 2.67 2.67 2 3.5 2H12.5C13.33 2 14 2.67 14 3.5V10.5C14 11.33 13.33 12 12.5 12H5L2 14.5V3.5Z",
  settings: "M8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5ZM8 9.5C7.17 9.5 6.5 8.83 6.5 8C6.5 7.17 7.17 6.5 8 6.5C8.83 6.5 9.5 7.17 9.5 8C9.5 8.83 8.83 9.5 8 9.5Z",
  plus: "M7 2H9V7H14V9H9V14H7V9H2V7H7V2Z",
  search: "M6.5 2C4.01 2 2 4.01 2 6.5C2 8.99 4.01 11 6.5 11C7.61 11 8.63 10.6 9.42 9.92L13.25 13.75L14.25 12.75L10.42 8.92C11.1 8.13 11.5 7.11 11.5 6.5C11.5 4.01 9.49 2 6.5 2ZM6.5 3.5C8.16 3.5 9.5 4.84 9.5 6.5C9.5 8.16 8.16 9.5 6.5 9.5C4.84 9.5 3.5 8.16 3.5 6.5C3.5 4.84 4.84 3.5 6.5 3.5Z",
  calendar: "M4 2H5V3.5H11V2H12V3.5H13.5C14.05 3.5 14.5 3.95 14.5 4.5V13.5C14.5 14.05 14.05 14.5 13.5 14.5H2.5C1.95 14.5 1.5 14.05 1.5 13.5V4.5C1.5 3.95 1.95 3.5 2.5 3.5H4V2ZM2.5 6V13.5H13.5V6H2.5Z",
  bubble: "M2.5 3C1.95 3 1.5 3.45 1.5 4V10.5C1.5 11.05 1.95 11.5 2.5 11.5H4V13.5L7 11.5H13.5C14.05 11.5 14.5 11.05 14.5 10.5V4C14.5 3.45 14.05 3 13.5 3H2.5Z",
  clip: "M4.5 8L8.5 4C9.33 3.17 10.67 3.17 11.5 4C12.33 4.83 12.33 6.17 11.5 7L7 11.5C6.45 12.05 5.55 12.05 5 11.5C4.45 10.95 4.45 10.05 5 9.5L9 5.5",
  grab: "M7 3C7 2.45 7.45 2 8 2C8.55 2 9 2.45 9 3V7H10V4C10 3.45 10.45 3 11 3C11.55 3 12 3.45 12 4V8H13V5.5C13 4.95 13.45 4.5 14 4.5C14.55 4.5 15 4.95 15 5.5V11C15 13.5 13 15 10.5 15C8.5 15 6.5 13.5 5.5 11.5L4 8.5C3.7 8 4 7.2 4.6 7C5.1 6.8 5.7 7 6 7.5L7 9V3Z",
  sort: "M3 4H13V5.5H3V4ZM5 7.25H11V8.75H5V7.25ZM7 10.5H9V12H7V10.5Z",
  filter: "M2 3H14V4.5L9.5 9V13.5L6.5 12V9L2 4.5V3Z",
  user: "M8 2C6.62 2 5.5 3.12 5.5 4.5C5.5 5.88 6.62 7 8 7C9.38 7 10.5 5.88 10.5 4.5C10.5 3.12 9.38 2 8 2ZM4 11C2.9 11 2 11.9 2 13V14H14V13C14 11.9 13.1 11 12 11H4Z",
  eye: "M8 4C4.5 4 1.7 6.3 1 9C1.7 11.7 4.5 14 8 14C11.5 14 14.3 11.7 15 9C14.3 6.3 11.5 4 8 4ZM8 12C6.34 12 5 10.66 5 9C5 7.34 6.34 6 8 6C9.66 6 11 7.34 11 9C11 10.66 9.66 12 8 12Z",
  share: "M11.5 3C10.67 3 10 3.67 10 4.5C10 4.7 10.05 4.88 10.13 5.05L5.95 7.14C5.6 6.75 5.08 6.5 4.5 6.5C3.4 6.5 2.5 7.4 2.5 8.5C2.5 9.6 3.4 10.5 4.5 10.5C5.08 10.5 5.6 10.25 5.95 9.86L10.13 11.95C10.05 12.12 10 12.3 10 12.5C10 13.33 10.67 14 11.5 14C12.33 14 13 13.33 13 12.5C13 11.67 12.33 11 11.5 11C10.92 11 10.4 11.25 10.05 11.64L5.87 9.55C5.95 9.38 6 9.2 6 9C6 8.8 5.95 8.62 5.87 8.45L10.05 6.36C10.4 6.75 10.92 7 11.5 7C12.33 7 13 6.33 13 5.5C13 4.67 12.33 4 11.5 3Z",
  automate: "M8.5 1.5L2.5 8.5H7.5L6.5 14.5L12.5 7.5H7.5L8.5 1.5Z"
};

async function main() {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "antigravity", version: "1.0" },
  });

  console.log("Connected to FigCraft Live!");

  // Delete previous test board 437 if present
  try {
    await cmd("select.set", { ids: [437] });
    await cmd("edit.delete", {});
    console.log("Deleted old test board 437.");
  } catch (e) {
    console.log("Note on delete:", e);
  }

  // Master Board: Outer Canvas (Dark Slate Backdrop #24262B)
  const boardX = 3280;
  const boardY = 0;
  const boardW = 1560;
  const boardH = 1040;

  const boardRes = await tool("create_node", {
    type: "frame",
    name: "Asterisk_TeamUnity_Style_Dashboard",
    x: boardX,
    y: boardY,
    width: boardW,
    height: boardH,
    props: {
      fills: [{ type: "solid", color: "#25272D" }],
    },
  });
  const boardId = getNodeId(boardRes);
  console.log("Master Board ID:", boardId);

  // -------------------------------------------------------------
  // FLOATING WHITE CARD CONTAINER (Super-ellipse, radius 32px)
  // -------------------------------------------------------------
  const shellX = 30;
  const shellY = 30;
  const shellW = 1500;
  const shellH = 980;

  const shellId = await createFrame(
    boardId,
    "Floating_White_Shell",
    shellX,
    shellY,
    shellW,
    shellH,
    [{ type: "solid", color: "#FFFFFF" }],
    32,
    [{ type: "solid", color: "#E2E8F0", weight: 1 }]
  );

  // -------------------------------------------------------------
  // LEFT POD SIDEBAR (#18191E, radius 24px)
  // -------------------------------------------------------------
  const podW = 246;
  const podH = 948;
  const podId = await createFrame(
    shellId,
    "Left_Pod_Sidebar",
    16,
    16,
    podW,
    podH,
    [{ type: "solid", color: "#18191E" }],
    24
  );

  // Brand Header: Swiss Monolith Asterisk + Asterisk
  const logoMarkSvg = buildSwissHeavyAsterisk(34, 40, 15, 3.4);
  await createVector(podId, logoMarkSvg, 0, 0, "#FF6C22");
  await tool("create_node", {
    type: "ellipse",
    name: "Logo_Center_Core",
    parent: podId,
    x: 32,
    y: 38,
    width: 4,
    height: 4,
    props: { fills: [{ type: "solid", color: "#FFFFFF" }] },
  });

  await createText(podId, "Asterisk", 58, 30, 18, "#FFFFFF", 700);

  // MENU SECTION
  await createText(podId, "Menu", 24, 82, 11, "#6B7280", 600);

  const menuItems = [
    { name: "Overview", icon: ICONS.home, badge: "12", active: true },
    { name: "Activity", icon: ICONS.pulse },
    { name: "Tasks", icon: ICONS.grid },
    { name: "Chat", icon: ICONS.chat, badge: "1" },
    { name: "Settings", icon: ICONS.settings },
  ];

  let menuY = 108;
  for (const item of menuItems) {
    await createVector(podId, item.icon, 24, menuY + 2, item.active ? "#FFFFFF" : "#8E929E");
    await createText(podId, item.name, 48, menuY, 13, item.active ? "#FFFFFF" : "#9CA3AF", item.active ? 600 : 400);

    if (item.badge) {
      const badgeId = await createFrame(podId, "Badge", 204, menuY - 1, 22, 18, [{ type: "solid", color: "#FF6C22" }], 9);
      await createText(badgeId, item.badge, item.badge.length > 1 ? 4 : 8, 2, 11, "#FFFFFF", 700);
    }
    menuY += 36;
  }

  // PROJECTS SECTION
  const projY = menuY + 20;
  await createText(podId, "Projects", 24, projY, 11, "#6B7280", 600);
  await createVector(podId, ICONS.plus, 210, projY + 1, "#6B7280");

  const projectItems = [
    { name: "Publications", badge: "4", active: true },
    { name: "Planning" },
    { name: "Design Internal" },
    { name: "Marketing" },
  ];

  let pItemY = projY + 26;
  for (const p of projectItems) {
    await createFrame(podId, "Proj_Icon", 24, pItemY + 3, 14, 14, [{ type: "solid", color: p.active ? "#FFFFFF" : "#4B5563" }], 4);
    await createText(podId, p.name, 48, pItemY, 13, p.active ? "#FFFFFF" : "#9CA3AF", p.active ? 600 : 400);

    if (p.badge) {
      const badgeId = await createFrame(podId, "Proj_Badge", 206, pItemY - 1, 20, 18, [{ type: "solid", color: "#FF6C22" }], 9);
      await createText(badgeId, p.badge, 7, 2, 10, "#FFFFFF", 700);
    }
    pItemY += 34;
  }

  // MEMBERS SECTION
  const memY = pItemY + 20;
  await createText(podId, "Members", 24, memY, 11, "#6B7280", 600);
  await createVector(podId, ICONS.plus, 210, memY + 1, "#6B7280");

  const members = [
    { name: "Zaid Myers", time: "08:06:28 for this week", color: "#3B82F6", initials: "ZM" },
    { name: "Rebecca Young", time: "12:41:07 for this week", color: "#EC4899", initials: "RY" },
    { name: "Isaac Bowman", time: "01:56:22 for this week", color: "#10B981", initials: "IB" },
    { name: "Vanessa Douglas", time: "16:35:59 for this week", color: "#8B5CF6", initials: "VD" },
  ];

  let mItemY = memY + 26;
  for (const m of members) {
    const avId = await createFrame(podId, "Member_Avatar", 24, mItemY, 30, 30, [{ type: "solid", color: m.color }], 15);
    await createText(avId, m.initials, 6, 7, 11, "#FFFFFF", 700);

    await createText(podId, m.name, 64, mItemY + 1, 12, "#F3F4F6", 600);
    await createText(podId, m.time, 64, mItemY + 16, 10, "#6B7280", 400);
    mItemY += 46;
  }

  // PINNED BOTTOM USER PROFILE: Katrina Malone (Like in the reference bottom!)
  const botUserY = podH - 64;
  const botCardId = await createFrame(podId, "Pinned_User_Card", 16, botUserY, podW - 32, 48, [{ type: "solid", color: "#22242B" }], 14);
  const kmAv = await createFrame(botCardId, "KM_Avatar", 10, 9, 30, 30, [{ type: "solid", color: "#F97316" }], 15);
  await createText(kmAv, "KM", 6, 7, 11, "#FFFFFF", 700);
  // Online Status Dot
  await tool("create_node", {
    type: "ellipse",
    name: "Online_Dot",
    parent: botCardId,
    x: 32,
    y: 31,
    width: 8,
    height: 8,
    props: {
      fills: [{ type: "solid", color: "#10B981" }],
      strokes: [{ type: "solid", color: "#22242B", weight: 1.5 }],
    },
  });
  await createText(botCardId, "Katrina Malone", 48, 10, 12, "#FFFFFF", 600);
  await createText(botCardId, "Product Designer", 48, 25, 10, "#9CA3AF", 400);

  // -------------------------------------------------------------
  // MAIN WORKSPACE CONTENT (Starts at x: 282 inside White Shell)
  // -------------------------------------------------------------
  const mainX = 282;

  // 1. TOP HEADER ROW: Title + View Switcher + Action Buttons
  await createText(shellId, "Publications", mainX, 26, 22, "#111827", 700);

  // Segmented view switcher pills
  const viewSwitcherX = mainX + 160;
  const viewY = 22;

  // 'List' button
  const listBtnId = await createFrame(shellId, "View_List", viewSwitcherX, viewY, 74, 36, [{ type: "solid", color: "#FFFFFF" }], 18, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  await createVector(listBtnId, ICONS.grid, 12, 11, "#6B7280");
  await createText(listBtnId, "List", 30, 9, 13, "#4B5563", 500);

  // 'Board' button (ACTIVE: Dark solid pill)
  const boardBtnId = await createFrame(shellId, "View_Board_Active", viewSwitcherX + 82, viewY, 86, 36, [{ type: "solid", color: "#18191E" }], 18);
  await createVector(boardBtnId, ICONS.grid, 12, 11, "#FFFFFF");
  await createText(boardBtnId, "Board", 32, 9, 13, "#FFFFFF", 600);

  // 'Workflow' button
  const wfBtnId = await createFrame(shellId, "View_Workflow", viewSwitcherX + 176, viewY, 98, 36, [{ type: "solid", color: "#FFFFFF" }], 18, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  await createVector(wfBtnId, ICONS.pulse, 12, 11, "#6B7280");
  await createText(wfBtnId, "Workflow", 30, 9, 13, "#4B5563", 500);

  // '+ View' button (Vibrant Orange pill)
  const addViewBtnId = await createFrame(shellId, "View_Add", viewSwitcherX + 282, viewY, 78, 36, [{ type: "solid", color: "#FF6C22" }], 18);
  await createText(addViewBtnId, "+ View", 16, 9, 13, "#FFFFFF", 600);

  // Right Side Action Buttons
  const rightActX = 1380;
  // 'Automate ▾' button
  const autoBtnId = await createFrame(shellId, "Btn_Automate", rightActX - 110, viewY, 102, 36, [{ type: "solid", color: "#FFFFFF" }], 18, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  await createVector(autoBtnId, ICONS.automate, 12, 10, "#4B5563");
  await createText(autoBtnId, "Automate ▾", 28, 9, 12, "#374151", 500);

  // 'Share' button
  const shareBtnId = await createFrame(shellId, "Btn_Share", rightActX, viewY, 82, 36, [{ type: "solid", color: "#FFFFFF" }], 18, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  await createVector(shareBtnId, ICONS.share, 12, 10, "#4B5563");
  await createText(shareBtnId, "Share", 30, 9, 12, "#374151", 500);

  // -------------------------------------------------------------
  // 2. SEARCH & FILTER TOOLBAR
  // -------------------------------------------------------------
  const toolY = 76;
  const searchBoxId = await createFrame(shellId, "Search_Box", mainX, toolY, 280, 36, [{ type: "solid", color: "#FAFAFA" }], 12, [{ type: "solid", color: "#F3F4F6", weight: 1 }]);
  await createVector(searchBoxId, ICONS.search, 12, 10, "#9CA3AF");
  await createText(searchBoxId, "Search tasks...", 36, 9, 13, "#9CA3AF", 400);

  // Filter Buttons on the right
  const filterGroupX = 1010;
  const fItems = [
    { name: "Sort by", icon: ICONS.sort, w: 84 },
    { name: "Filters", icon: ICONS.filter, w: 80 },
    { name: "Me", icon: ICONS.user, w: 58 },
    { name: "Show", icon: ICONS.eye, w: 72 },
  ];

  let fX = filterGroupX;
  for (const f of fItems) {
    const fId = await createFrame(shellId, `Filter_${f.name}`, fX, toolY, f.w, 34, [{ type: "solid", color: "#FFFFFF" }], 8);
    await createVector(fId, f.icon, 10, 9, "#6B7280");
    await createText(fId, f.name, 28, 8, 12, "#4B5563", 500);
    fX += f.w + 10;
  }

  // -------------------------------------------------------------
  // 3. KANBAN COLUMNS (4 Columns)
  // -------------------------------------------------------------
  const colY = 126;
  const colW = 286;
  const colGap = 16;

  const columnsData = [
    { title: "To Do", count: "12", x: mainX },
    { title: "In Progress", count: "2", x: mainX + colW + colGap },
    { title: "Review", count: "3", x: mainX + (colW + colGap) * 2 },
    { title: "Complete", count: "26", x: mainX + (colW + colGap) * 3 },
  ];

  // Helper for Pastel Tag
  async function createTag(parent: number, text: string, x: number, y: number, bg: string, textColor: string) {
    const w = text.length * 6.8 + 18;
    const tagId = await createFrame(parent, `Tag_${text}`, x, y, w, 22, [{ type: "solid", color: bg }], 6);
    await createText(tagId, text, 8, 3, 11, textColor, 600);
    return w;
  }

  // Helper for Date Chip
  async function createDateChip(parent: number, dateText: string, x: number, y: number) {
    const chipW = dateText.length * 6.5 + 28;
    const chipId = await createFrame(parent, "Date_Chip", x, y, chipW, 24, [{ type: "solid", color: "#FFFFFF" }], 6, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
    await createVector(chipId, ICONS.calendar, 6, 4, "#6B7280");
    await createText(chipId, dateText, 22, 4, 11, "#374151", 500);
    return chipW;
  }

  // Refined Helper for Avatars Stack (Centered text inside 24x24 frames)
  async function createAvatarStack(parent: number, x: number, y: number, colors: string[], initials: string[], overflow?: string) {
    let curX = x;
    for (let i = 0; i < colors.length; i++) {
      const av = await createFrame(parent, `Av_${i}`, curX, y, 24, 24, [{ type: "solid", color: colors[i] }], 12, [{ type: "solid", color: "#FFFFFF", weight: 2 }]);
      await createText(av, initials[i], 4, 5, 9, "#FFFFFF", 700);
      curX += 16;
    }
    if (overflow) {
      const ov = await createFrame(parent, "Av_Overflow", curX, y, 24, 24, [{ type: "solid", color: "#FF7A29" }], 12, [{ type: "solid", color: "#FFFFFF", weight: 2 }]);
      await createText(ov, overflow, 4, 5, 9, "#FFFFFF", 700);
    }
  }

  // Helper for Bottom Icon Counters (Chat & Clip)
  async function createCounters(parent: number, x: number, y: number, chatCount: number, clipCount?: number) {
    let curX = x;
    await createVector(parent, ICONS.bubble, curX, y + 2, "#9CA3AF");
    await createText(parent, `${chatCount}`, curX + 16, y, 11, "#6B7280", 500);
    curX += 34;

    if (clipCount !== undefined) {
      await createVector(parent, ICONS.clip, curX, y + 2, "#9CA3AF");
      await createText(parent, `${clipCount}`, curX + 16, y, 11, "#6B7280", 500);
    }
  }

  // =============================================================
  // COLUMN 1: TO DO (12)
  // =============================================================
  const col1 = columnsData[0];
  await createText(shellId, `${col1.title} `, col1.x, colY, 15, "#111827", 700);
  await createText(shellId, `(${col1.count})`, col1.x + 48, colY, 15, "#6B7280", 400);

  let c1Y = colY + 28;

  // Card 1.1: Project Management Web App
  const card1_1_H = 150;
  const c1_1 = await createFrame(shellId, "Card_PM_App", col1.x, c1Y, colW, card1_1_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  let tX = 14;
  tX += await createTag(c1_1, "Dribbble", tX, 14, "#FDE8E4", "#E15B46") + 8;
  await createTag(c1_1, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c1_1, "Project Management Wep App", 14, 44, 14, "#111827", 700);
  await createText(c1_1, "Make a design for a web application for\norganizing the workspace of an IT company", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c1_1, "30 Jan", 14, 112);
  await createAvatarStack(c1_1, 98, 112, ["#3B82F6", "#EC4899"], ["ZM", "RY"], "+3");
  await createCounters(c1_1, 204, 116, 2, 1);

  c1Y += card1_1_H + 16;

  // Card 1.2: Neobank App Case
  const card1_2_H = 170;
  const c1_2 = await createFrame(shellId, "Card_Neobank", col1.x, c1Y, colW, card1_2_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c1_2, "Behance", tX, 14, "#E0F2FE", "#0284C7") + 8;
  await createTag(c1_2, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c1_2, "Neobank App Case", 14, 44, 14, "#111827", 700);
  await createText(c1_2, "It should include wireframes, user flows, and\nvisual design elements that demonstrate how\nthe app delivers a seamless banking experience", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c1_2, "5 Feb", 14, 132);
  await createAvatarStack(c1_2, 98, 132, ["#10B981", "#8B5CF6"], ["IB", "VD"]);
  await createCounters(c1_2, 204, 136, 8, 3);

  c1Y += card1_2_H + 16;

  // Card 1.3: Design Agency Website (With Miniature Web Layout Preview!)
  const card1_3_H = 220;
  const c1_3 = await createFrame(shellId, "Card_Agency_Site", col1.x, c1Y, colW, card1_3_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c1_3, "Design", tX, 14, "#FEF0E6", "#D97706") + 8;
  await createTag(c1_3, "Dev", tX, 14, "#E0F7F4", "#0D9488");
  await createText(c1_3, "Design Agency Website", 14, 44, 14, "#111827", 700);
  await createText(c1_3, "The design should be responsive, ensuring\noptimal performance across all devices.", 14, 66, 12, "#6B7280", 400);

  const webPrev = await createFrame(c1_3, "Web_Preview_Box", 14, 102, colW - 28, 68, [{ type: "solid", color: "#111827" }], 10);
  await createFrame(webPrev, "Browser_Dot_1", 10, 8, 6, 6, [{ type: "solid", color: "#EF4444" }], 3);
  await createFrame(webPrev, "Browser_Dot_2", 20, 8, 6, 6, [{ type: "solid", color: "#F59E0B" }], 3);
  await createFrame(webPrev, "Browser_Dot_3", 30, 8, 6, 6, [{ type: "solid", color: "#10B981" }], 3);
  await createFrame(webPrev, "Hero_Banner", 10, 20, 140, 38, [{ type: "solid", color: "#1F2937" }], 6);
  await createFrame(webPrev, "Accent_Pill", 18, 28, 48, 6, [{ type: "solid", color: "#FF7A29" }], 3);
  await createFrame(webPrev, "Text_Bar", 18, 38, 80, 4, [{ type: "solid", color: "#4B5563" }], 2);
  await createFrame(webPrev, "Card_Right_1", 158, 20, 42, 38, [{ type: "solid", color: "#374151" }], 6);
  await createFrame(webPrev, "Card_Right_2", 206, 20, 42, 38, [{ type: "solid", color: "#374151" }], 6);

  await createDateChip(c1_3, "14 Feb", 14, 182);
  await createAvatarStack(c1_3, 104, 182, ["#F97316", "#3B82F6"], ["KM", "ZM"]);
  await createCounters(c1_3, 218, 186, 4);

  // Card 1.4: Bottom Peeking Card ("Client Onboarding Portal")
  c1Y += card1_3_H + 16;
  const card1_4_H = 140;
  const c1_4 = await createFrame(shellId, "Card_Client_Portal", col1.x, c1Y, colW, card1_4_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c1_4, "Payroll", tX, 14, "#FDE8E4", "#E15B46") + 8;
  await createTag(c1_4, "Backend", tX, 14, "#E0F2FE", "#0284C7");
  await createText(c1_4, "Client Onboarding Flow", 14, 44, 14, "#111827", 700);
  await createText(c1_4, "Streamline automated tenant database creation\nand instant credential provisioning", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c1_4, "20 Feb", 14, 106);
  await createAvatarStack(c1_4, 104, 106, ["#8B5CF6", "#10B981"], ["VD", "IB"]);

  // =============================================================
  // COLUMN 2: IN PROGRESS (2)
  // =============================================================
  const col2 = columnsData[1];
  await createText(shellId, `${col2.title} `, col2.x, colY, 15, "#111827", 700);
  await createText(shellId, `(${col2.count})`, col2.x + 94, colY, 15, "#6B7280", 400);

  let c2Y = colY + 28;

  // Card 2.1: Speaking App
  const card2_1_H = 160;
  const c2_1 = await createFrame(shellId, "Card_Speaking_App", col2.x, c2Y, colW, card2_1_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c2_1, "Dribbble", tX, 14, "#FDE8E4", "#E15B46") + 8;
  await createTag(c2_1, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c2_1, "Speaking App", 14, 44, 14, "#111827", 700);
  await createText(c2_1, "Create a mobile application design for\nlanguage exchange. The purpose of the\napplication is to help users learn foreign", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c2_1, "30 Jan", 14, 122);
  await createAvatarStack(c2_1, 98, 122, ["#3B82F6", "#EC4899"], ["ZM", "RY"]);
  await createCounters(c2_1, 204, 126, 6, 2);

  c2Y += card2_1_H + 16;

  // Card 2.2: THE SIGNATURE ACTIVE DRAG STATE!
  const slotH = 180;
  await createFrame(
    shellId,
    "Drop_Target_Slot_Dashed",
    col2.x,
    c2Y,
    colW,
    slotH,
    [{ type: "solid", color: "#FAFAFA" }],
    16,
    [{ type: "solid", color: "#CBD5E1", weight: 2 }]
  );

  // Elevated hovering dragged card
  const dragElevX = col2.x + 12;
  const dragElevY = c2Y + 16;
  const dragCardId = await createFrame(
    shellId,
    "Card_Dragged_Online_Catalog",
    dragElevX,
    dragElevY,
    colW,
    188,
    [{ type: "solid", color: "#FFFFFF" }],
    16,
    [{ type: "solid", color: "#E2E8F0", weight: 1 }]
  );

  // Grab hand icon
  await createVector(dragCardId, ICONS.grab, colW - 28, 14, "#9CA3AF");

  tX = 14;
  tX += await createTag(dragCardId, "Dev", tX, 14, "#E0F7F4", "#0D9488") + 8;
  await createTag(dragCardId, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(dragCardId, "Online Catalog Development", 14, 44, 14, "#111827", 700);
  await createText(dragCardId, "Develop an online employee directory for a\ncompany with more than 50,000 employees.\nWhen performing a task, you need to use\nPython and/or JS/CSS libraries", 14, 66, 12, "#4B5563", 400);

  await createDateChip(dragCardId, "3 Feb", 14, 148);
  await createAvatarStack(dragCardId, 94, 148, ["#3B82F6", "#EC4899"], ["ZM", "RY"], "+3");
  await createCounters(dragCardId, 204, 152, 4, 1);

  // =============================================================
  // COLUMN 3: REVIEW (3)
  // =============================================================
  const col3 = columnsData[2];
  await createText(shellId, `${col3.title} `, col3.x, colY, 15, "#111827", 700);
  await createText(shellId, `(${col3.count})`, col3.x + 58, colY, 15, "#6B7280", 400);

  let c3Y = colY + 28;

  // Card 3.1: Administrator Panel Interface
  const card3_1_H = 165;
  const c3_1 = await createFrame(shellId, "Card_Admin_Panel", col3.x, c3Y, colW, card3_1_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c3_1, "Research", tX, 14, "#F3E8FF", "#7E22CE") + 8;
  await createTag(c3_1, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c3_1, "Administrator Panel Interface", 14, 44, 14, "#111827", 700);
  await createText(c3_1, "Develop an interface for the administrator\nto manage the rights of the company's\nusers to various products of the company", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c3_1, "24 Jan", 14, 126);
  await createAvatarStack(c3_1, 98, 126, ["#10B981", "#8B5CF6"], ["IB", "VD"], "+2");
  await createCounters(c3_1, 204, 130, 3, 1);

  c3Y += card3_1_H + 16;

  // Card 3.2: Fintech App (With 3 Miniature Smartphone Mockup Screens!)
  const card3_2_H = 240;
  const c3_2 = await createFrame(shellId, "Card_Fintech_App", col3.x, c3Y, colW, card3_2_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  await createTag(c3_2, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c3_2, "Fintech App", 14, 44, 14, "#111827", 700);
  await createText(c3_2, "The goal is to create an intuitive, visually\nappealing design that simplifies transactions", 14, 66, 12, "#6B7280", 400);

  const phoneContainer = await createFrame(c3_2, "Phone_Mockup_Row", 14, 102, colW - 28, 88, [{ type: "solid", color: "#141519" }], 10);
  const p1 = await createFrame(phoneContainer, "Phone_1", 12, 8, 70, 72, [{ type: "solid", color: "#1E2026" }], 8, [{ type: "solid", color: "#2E313B", weight: 1 }]);
  await createFrame(p1, "P1_Header_Bar", 8, 8, 36, 4, [{ type: "solid", color: "#FF7A29" }], 2);
  await createFrame(p1, "P1_Card", 8, 16, 54, 24, [{ type: "solid", color: "#282B34" }], 4);
  await createFrame(p1, "P1_Chart_Line", 10, 48, 50, 14, [{ type: "solid", color: "#FF6C22" }], 2);

  const p2 = await createFrame(phoneContainer, "Phone_2", 94, 8, 70, 72, [{ type: "solid", color: "#1E2026" }], 8, [{ type: "solid", color: "#2E313B", weight: 1 }]);
  await createFrame(p2, "P2_Header_Bar", 8, 8, 28, 4, [{ type: "solid", color: "#3B82F6" }], 2);
  await createFrame(p2, "P2_Metric_1", 8, 16, 54, 16, [{ type: "solid", color: "#282B34" }], 4);
  await createFrame(p2, "P2_Metric_2", 8, 36, 54, 26, [{ type: "solid", color: "#282B34" }], 4);

  const p3 = await createFrame(phoneContainer, "Phone_3", 176, 8, 70, 72, [{ type: "solid", color: "#1E2026" }], 8, [{ type: "solid", color: "#2E313B", weight: 1 }]);
  await createFrame(p3, "P3_Header_Bar", 8, 8, 32, 4, [{ type: "solid", color: "#10B981" }], 2);
  await createFrame(p3, "P3_Card_Row_1", 8, 16, 54, 12, [{ type: "solid", color: "#282B34" }], 3);
  await createFrame(p3, "P3_Card_Row_2", 8, 32, 54, 12, [{ type: "solid", color: "#282B34" }], 3);
  await createFrame(p3, "P3_Card_Row_3", 8, 48, 54, 12, [{ type: "solid", color: "#282B34" }], 3);

  await createDateChip(c3_2, "23 Jan", 14, 202);
  await createAvatarStack(c3_2, 98, 202, ["#3B82F6", "#EC4899", "#10B981"], ["ZM", "RY", "IB"]);
  await createCounters(c3_2, 204, 206, 5, 3);

  // =============================================================
  // COLUMN 4: COMPLETE (26)
  // =============================================================
  const col4 = columnsData[3];
  await createText(shellId, `${col4.title} `, col4.x, colY, 15, "#111827", 700);
  await createText(shellId, `(${col4.count})`, col4.x + 78, colY, 15, "#6B7280", 400);

  let c4Y = colY + 28;

  // Card 4.1: Finance Manager
  const card4_1_H = 145;
  const c4_1 = await createFrame(shellId, "Card_Finance_Manager", col4.x, c4Y, colW, card4_1_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c4_1, "Dribbble", tX, 14, "#FDE8E4", "#E15B46") + 8;
  await createTag(c4_1, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c4_1, "Finance Manager", 14, 44, 14, "#111827", 700);
  await createText(c4_1, "Make a design for a web application for\norganizing the workspace of an IT company", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c4_1, "12 Jan", 14, 108);
  await createAvatarStack(c4_1, 98, 108, ["#3B82F6"], ["ZM"]);

  c4Y += card4_1_H + 16;

  // Card 4.2: Fashion Website
  const card4_2_H = 155;
  const c4_2 = await createFrame(shellId, "Card_Fashion_Site", col4.x, c4Y, colW, card4_2_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c4_2, "Research", tX, 14, "#F3E8FF", "#7E22CE") + 8;
  await createTag(c4_2, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c4_2, "Fashion Website", 14, 44, 14, "#111827", 700);
  await createText(c4_2, "The design should be responsive and\nluxurious, emphasizing craftsmanship and\ntimely delivery", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c4_2, "9 Jan", 14, 118);
  await createAvatarStack(c4_2, 98, 118, ["#10B981", "#8B5CF6"], ["IB", "VD"], "+2");

  c4Y += card4_2_H + 16;

  // Card 4.3: Note-Taking App
  const card4_3_H = 160;
  const c4_3 = await createFrame(shellId, "Card_Notes_App", col4.x, c4Y, colW, card4_3_H, [{ type: "solid", color: "#FFFFFF" }], 16, [{ type: "solid", color: "#E5E7EB", weight: 1 }]);
  tX = 14;
  tX += await createTag(c4_3, "Dribbble", tX, 14, "#FDE8E4", "#E15B46") + 8;
  await createTag(c4_3, "Design", tX, 14, "#FEF0E6", "#D97706");
  await createText(c4_3, "Note-Taking App", 14, 44, 14, "#111827", 700);
  await createText(c4_3, "The website should emphasize simplicity\nand ease of use, with a layout that lets\nusers quickly capture their ideas", 14, 66, 12, "#6B7280", 400);
  await createDateChip(c4_3, "4 Jan", 14, 122);
  await createAvatarStack(c4_3, 98, 122, ["#EC4899"], ["RY"]);

  console.log("Successfully generated all refined elements!");

  // Focus view on the new board
  await cmd("select.set", { ids: [boardId] });

  proc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error("Execution error:", err);
  process.exit(1);
});
