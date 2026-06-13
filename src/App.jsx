import { useState, useRef, useCallback, useEffect } from "react";

const COLORS = {
  bg: "#0F1117",
  surface: "#1A1D27",
  surfaceHover: "#222536",
  border: "#2A2D3E",
  accent: "#6C63FF",
  accentDim: "#3D3880",
  text: "#E8E9F0",
  textMuted: "#7B7E95",
  textDim: "#4A4D62",
  success: "#4ADE80",
  warning: "#FBBF24",
  danger: "#F87171",
};

const MAX_HISTORY = 20;
const STORAGE_KEY = "htmlviewer_history_v2";
const FILES_KEY = "htmlviewer_files_v2";

// Simpan file sebagai base64 di localStorage
async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); // data:text/html;base64,...
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function FileIcon({ type }) {
  if (type === "folder") return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7Z" fill={COLORS.warning} opacity="0.9"/>
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill={COLORS.accent} opacity="0.8"/>
      <path d="M14 2V8H20" fill="none" stroke={COLORS.accent} strokeWidth="1.5"/>
      <text x="8" y="17" fontSize="5" fill="white" fontFamily="monospace" fontWeight="bold">HTML</text>
    </svg>
  );
}
function BackIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M5 12L12 19M5 12L12 5"/></svg>;
}
function CloseIcon({ color }) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color || COLORS.textMuted} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6L18 18"/></svg>;
}
function FolderOpenIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7Z" fill={COLORS.warning}/></svg>;
}
function HistoryIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M3 12a9 9 0 019-9"/><path d="M3 7v5h5" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round"/></svg>;
}

function buildTree(files) {
  const root = { name: "root", children: {}, files: [] };
  for (const file of files) {
    const parts = file.webkitRelativePath ? file.webkitRelativePath.split("/") : [file.name];
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.children[parts[i]]) node.children[parts[i]] = { name: parts[i], children: {}, files: [] };
      node = node.children[parts[i]];
    }
    const fname = parts[parts.length - 1];
    if (fname.endsWith(".html") || fname.endsWith(".htm")) node.files.push({ name: fname, file });
  }
  return root;
}

function FileTree({ node, onOpen }) {
  const [expanded, setExpanded] = useState({});
  const folders = Object.values(node.children);
  const files = node.files;
  if (folders.length === 0 && files.length === 0) {
    return <div style={{ padding: "32px 16px", textAlign: "center", color: COLORS.textDim, fontSize: 13 }}>Tidak ada file HTML ditemukan</div>;
  }
  return (
    <div>
      {folders.map(folder => (
        <div key={folder.name}>
          <div onClick={() => setExpanded(e => ({ ...e, [folder.name]: !e[folder.name] }))}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", color: COLORS.text, fontSize: 14, borderBottom: `1px solid ${COLORS.border}` }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ color: COLORS.textDim, fontSize: 12, width: 14 }}>{expanded[folder.name] ? "▾" : "▸"}</span>
            <FileIcon type="folder" />
            <span>{folder.name}</span>
            <span style={{ marginLeft: "auto", color: COLORS.textDim, fontSize: 11 }}>{Object.keys(folder.children).length + folder.files.length} item</span>
          </div>
          {expanded[folder.name] && (
            <div style={{ paddingLeft: 16, borderLeft: `2px solid ${COLORS.border}`, marginLeft: 24 }}>
              <FileTree node={folder} onOpen={onOpen} />
            </div>
          )}
        </div>
      ))}
      {files.map(({ name, file }) => (
        <div key={name} onClick={() => onOpen(file, name)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", color: COLORS.text, fontSize: 14, borderBottom: `1px solid ${COLORS.border}` }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ width: 14 }} />
          <FileIcon type="html" />
          <span style={{ flex: 1 }}>{name}</span>
          <span style={{ color: COLORS.accentDim, fontSize: 11, background: COLORS.border, padding: "2px 6px", borderRadius: 4 }}>{(file.size / 1024).toFixed(1)} KB</span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function formatSize(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

const TAB_FILES = "files";
const TAB_HISTORY = "history";

export default function HTMLViewer() {
  const [tree, setTree] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [viewing, setViewing] = useState(null); // { dataUrl, name, size }
  const [totalFiles, setTotalFiles] = useState(0);
  const [tab, setTab] = useState(TAB_FILES);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [saving, setSaving] = useState(false);
  const folderInputRef = useRef();
  const fileInputRef = useRef();

  // Simpan history ke localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  const saveFileToStorage = useCallback(async (file, name) => {
    setSaving(true);
    try {
      const dataUrl = await fileToBase64(file);
      const id = `file_${Date.now()}_${name.replace(/[^a-z0-9]/gi, "_")}`;
      // Simpan konten file
      try { localStorage.setItem(`${FILES_KEY}_${id}`, dataUrl); } catch {
        // localStorage penuh, hapus file lama
        const keys = Object.keys(localStorage).filter(k => k.startsWith(FILES_KEY));
        if (keys.length > 0) localStorage.removeItem(keys[0]);
        localStorage.setItem(`${FILES_KEY}_${id}`, dataUrl);
      }
      // Update history
      setHistory(prev => {
        // Hapus file lama dari storage kalau ada entry sama
        const old = prev.find(h => h.name === name && Math.abs(h.size - file.size) < 100);
        if (old) {
          try { localStorage.removeItem(`${FILES_KEY}_${old.id}`); } catch {}
        }
        const filtered = prev.filter(h => !(h.name === name && Math.abs(h.size - file.size) < 100));
        return [{ id, name, size: file.size, ts: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
      });
      return dataUrl;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleFolder = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const htmlFiles = files.filter(f => f.name.endsWith(".html") || f.name.endsWith(".htm"));
    const root = buildTree(files);
    const topFolder = files[0].webkitRelativePath?.split("/")[0] || "Folder";
    setFolderName(topFolder);
    setTotalFiles(htmlFiles.length);
    const topNode = root.children[topFolder] || root;
    setTree(topNode);
    setViewing(null);
    setTab(TAB_FILES);
  }, []);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    openFile(file, file.name);
  }, []);

  const openFile = useCallback(async (file, name) => {
    const dataUrl = await saveFileToStorage(file, name);
    setViewing({ dataUrl, name, size: file.size });
  }, [saveFileToStorage]);

  const openFromHistory = useCallback((item) => {
    try {
      const dataUrl = localStorage.getItem(`${FILES_KEY}_${item.id}`);
      if (!dataUrl) {
        alert("File tidak ditemukan di penyimpanan. Silakan buka ulang filenya.");
        return;
      }
      setViewing({ dataUrl, name: item.name, size: item.size });
    } catch {
      alert("Gagal membuka file.");
    }
  }, []);

  const removeHistory = useCallback((id) => {
    try { localStorage.removeItem(`${FILES_KEY}_${id}`); } catch {}
    setHistory(prev => prev.filter(h => h.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    history.forEach(h => {
      try { localStorage.removeItem(`${FILES_KEY}_${h.id}`); } catch {}
    });
    setHistory([]);
  }, [history]);

  const closeViewer = useCallback(() => {
    setViewing(null);
  }, []);

  // === VIEWER ===
  if (viewing) {
    return (
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: COLORS.bg, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", paddingTop: "env(safe-area-inset-top)", height: "calc(48px + env(safe-area-inset-top))", minHeight: 48, background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, zIndex: 10 }}>
          <button onClick={closeViewer} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: COLORS.text, padding: "4px 8px", borderRadius: 6, fontSize: 13 }}>
            <BackIcon /> Kembali
          </button>
          <div style={{ width: 1, height: 20, background: COLORS.border }} />
          <span style={{ fontSize: 13, color: COLORS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{viewing.name}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          <iframe src={viewing.dataUrl} style={{ width: "100%", height: "100%", border: "none", background: "#fff" }} title={viewing.name} sandbox="allow-scripts allow-same-origin" />
          <button onClick={closeViewer} style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
            background: COLORS.accent, border: "none", borderRadius: 24,
            padding: "12px 28px", cursor: "pointer",
            color: "white", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(108,99,255,0.5)", zIndex: 99,
          }}>
            <BackIcon /> Kembali
          </button>
        </div>
      </div>
    );
  }

  // === MAIN ===
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "18px 16px 14px", paddingTop: "calc(18px + env(safe-area-inset-top))", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6l4-2 4 2 4-2 4 2v14l-4-2-4 2-4-2-4 2V6z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M8 4v14M12 6v12M16 4v14" stroke="white" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.3 }}>HTML Viewer</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Buka & lihat file HTML lokal</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "14px 16px 0", display: "flex", gap: 10 }}>
        <button onClick={() => folderInputRef.current.click()}
          style={{ flex: 1, padding: "11px 8px", background: COLORS.accent, border: "none", borderRadius: 10, cursor: "pointer", color: "white", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          <FolderOpenIcon /> Buka Folder
        </button>
        <button onClick={() => fileInputRef.current.click()}
          style={{ flex: 1, padding: "11px 8px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, cursor: "pointer", color: COLORS.text, fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover} onMouseLeave={e => e.currentTarget.style.background = COLORS.surface}>
          <FileIcon type="html" /> Buka File
        </button>
      </div>

      <input ref={folderInputRef} type="file" webkitdirectory="" multiple style={{ display: "none" }} onChange={handleFolder} />
      <input ref={fileInputRef} type="file" accept=".html,.htm" style={{ display: "none" }} onChange={handleFile} />

      {/* Saving indicator */}
      {saving && (
        <div style={{ margin: "8px 16px 0", padding: "8px 12px", background: COLORS.accentDim, borderRadius: 8, fontSize: 12, color: COLORS.text, textAlign: "center" }}>
          Menyimpan file...
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", margin: "14px 16px 0", background: COLORS.surface, borderRadius: 10, padding: 4, gap: 4 }}>
        {[{ id: TAB_FILES, label: "File" }, { id: TAB_HISTORY, label: `Riwayat${history.length ? ` (${history.length})` : ""}` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
              background: tab === t.id ? COLORS.accent : "transparent",
              color: tab === t.id ? "white" : COLORS.textMuted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, marginTop: 14 }}>

        {/* TAB: FILES */}
        {tab === TAB_FILES && (
          tree ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, borderTop: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FolderOpenIcon />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{folderName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{totalFiles} file HTML</span>
                  <button onClick={() => { setTree(null); setFolderName(""); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4, borderRadius: 4 }}>
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <FileTree node={tree} onOpen={openFile} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${COLORS.border}` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V7Z" stroke={COLORS.textDim} strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Belum ada folder dibuka</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                  Tap <strong style={{ color: COLORS.text }}>Buka Folder</strong> untuk lihat semua file HTML,<br/>
                  atau <strong style={{ color: COLORS.text }}>Buka File</strong> untuk langsung preview.
                </div>
              </div>
            </div>
          )
        )}

        {/* TAB: HISTORY */}
        {tab === TAB_HISTORY && (
          <div>
            {history.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: COLORS.surface, display: "flex", alignItems: "center", justifyContent: "center", border: `2px dashed ${COLORS.border}` }}>
                  <HistoryIcon />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Belum ada riwayat</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>File yang pernah lo buka akan tersimpan di sini.</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{history.length} file tersimpan</span>
                  <button onClick={clearHistory} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: COLORS.danger, padding: "2px 6px", borderRadius: 4 }}>Hapus semua</button>
                </div>
                {history.map(item => (
                  <div key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div onClick={() => openFromHistory(item)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <FileIcon type="html" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                          {timeAgo(item.ts)} · {formatSize(item.size)}
                          <span style={{ marginLeft: 6, color: COLORS.success, fontSize: 10 }}>✓ tersimpan</span>
                        </div>
                      </div>
                    </div>
                    <button 