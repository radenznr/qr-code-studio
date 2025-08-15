import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Download, ClipboardCopy, RefreshCw, Settings2, Check } from "lucide-react";

const FAVICON_URL = "https://i.imgur.com/4oJzJOg.png";

function useFavicon(href) {
  useEffect(() => {
    if (!href) return;
    const ensureLink = (rel) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    ensureLink("icon");
    ensureLink("shortcut icon");
    let apple = document.querySelector('link[rel="apple-touch-icon"]');
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = href;
  }, [href]);
}

const STORAGE_KEY = "qr-code-studio:v1";

export default function App() {
  useFavicon(FAVICON_URL);

  const canvasRef = useRef(null);
  const [text, setText] = useState("https://qr.rzep.web.id");
  const [size, setSize] = useState(320);
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState("M"); // L/M/Q/H
  const [darkColor, setDarkColor] = useState("#111827");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [transparentBg, setTransparentBg] = useState(false);
  const [svgString, setSvgString] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.text === "string") setText(s.text);
        if (typeof s.size === "number") setSize(s.size);
        if (typeof s.margin === "number") setMargin(s.margin);
        if (["L", "M", "Q", "H"].includes(s.level)) setLevel(s.level);
        if (typeof s.darkColor === "string") setDarkColor(s.darkColor);
        if (typeof s.lightColor === "string") setLightColor(s.lightColor);
        if (typeof s.transparentBg === "boolean") setTransparentBg(s.transparentBg);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const data = { text, size, margin, level, darkColor, lightColor, transparentBg };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [text, size, margin, level, darkColor, lightColor, transparentBg]);

  const safeText = text?.trim() ?? "";

  const opts = useMemo(
    () => ({
      errorCorrectionLevel: level,
      width: Number(size),
      margin: Number(margin),
      color: {
        dark: darkColor,
        light: transparentBg ? "#ffffff00" : lightColor,
      },
    }),
    [level, size, margin, darkColor, lightColor, transparentBg]
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const value = safeText || "QR Code";
    setError("");

    QRCode.toCanvas(c, value, opts, (err) => {
      if (err) {
        console.error(err);
        setError("Gagal membuat QR. Coba kurangi teks/tingkatkan ukuran.");
      }
    });

    QRCode.toString(value, { ...opts, type: "svg" })
      .then((svg) => setSvgString(svg))
      .catch((e) => {
        console.error(e);
        setSvgString("");
      });
  }, [safeText, opts]);

  const filenameBase = () => {
    const trimmed = (safeText || "qr-code").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").slice(0, 60).replace(/^-|-$|^$/g, (m) => (m ? "qr" : ""));
    const lvl = level.toLowerCase();
    return `qr_${trimmed}_${size}px_${lvl}`;
  };

  const blobFromCanvas = async () =>
    await new Promise((resolve) => canvasRef.current?.toBlob((b) => resolve(b), "image/png"));

  const downloadPNG = async () => {
    const blob = await blobFromCanvas();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameBase() + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameBase() + ".svg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyPNG = async () => {
    try {
      const blob = await blobFromCanvas();
      if (!blob) throw new Error("No blob");
      if ("ClipboardItem" in window) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } else {
        const dataUrl = await new Promise((r) => {
          const c = canvasRef.current;
          r(c?.toDataURL("image/png"));
        });
        await navigator.clipboard.writeText(dataUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      alert("Clipboard tidak didukung. Silakan unduh PNG.");
    }
  };

  const resetAll = () => {
    setText("https://qr.rzep.web.id");
    setSize(320);
    setMargin(2);
    setLevel("M");
    setDarkColor("#111827");
    setLightColor("#ffffff");
    setTransparentBg(false);
  };

  const contrastRatio = useMemo(() => {
    const hexToRgb = (hex) => {
      const h = hex.replace('#','');
      const v = h.length === 3 ? h.split('').map((c)=>c+c).join('') : h;
      const num = parseInt(v,16);
      return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
    };
    const luminance = ({r,g,b}) => {
      const srgb = [r,g,b].map((v)=>{
        const s = v/255;
        return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4);
      });
      return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
    };
    try {
      const fg = hexToRgb(darkColor);
      const bg = transparentBg ? { r:255, g:255, b:255 } : hexToRgb(lightColor);
      const L1 = Math.max(luminance(fg), luminance(bg));
      const L2 = Math.min(luminance(fg), luminance(bg));
      return (L1 + 0.05) / (L2 + 0.05);
    } catch {
      return 21;
    }
  }, [darkColor, lightColor, transparentBg]);

  const levelBtn = (val) => (
    <button
      key={val}
      onClick={() => setLevel(val)}
      className={
        `px-3 py-1.5 rounded-xl border text-sm transition-all ` +
        (level === val
          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
          : "bg-white/60 backdrop-blur border-gray-200 hover:border-gray-300")
      }
      aria-pressed={level === val}
    >
      {val}
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gray-900 text-white"><QrCode className="w-5 h-5" /></div>
            <h1 className="text-xl font-semibold">QR Code Generator</h1>
            <span className="hidden sm:inline text-sm text-gray-500"></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm text-sm"
              title="Reset ke default"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <section className="order-2 lg:order-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold">Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data / URL</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste text or URL (e.g., https://yourdomain.com)"
                  className="w-full rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 bg-white px-3 py-2 shadow-inner"
                />
                <p className="mt-1 text-xs text-gray-500">Menerima teks bebas. Untuk hasil scan terbaik, jaga kontras tinggi & ukuran cukup.</p>
              </div>

              {/* Error correction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Error correction</label>
                <div className="flex gap-2">{"L M Q H".split(" ").map(levelBtn)}</div>
                <p className="mt-1 text-xs text-gray-500">Lebih tinggi = lebih tahan kerusakan/blur, tetapi modul makin rapat.</p>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size: <span className="font-mono">{size}px</span></label>
                <input
                  type="range"
                  min={128}
                  max={1024}
                  step={4}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiet zone (margin): <span className="font-mono">{margin}</span></label>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foreground</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="h-10 w-12 p-0 border border-gray-200 rounded-lg"
                      aria-label="Foreground color"
                    />
                    <input
                      type="text"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="flex-1 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 bg-white px-3 py-2 shadow-inner font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="h-10 w-12 p-0 border border-gray-200 rounded-lg disabled:opacity-40"
                      aria-label="Background color"
                      disabled={transparentBg}
                    />
                    <input
                      type="text"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="flex-1 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-0 bg-white px-3 py-2 shadow-inner font-mono text-sm disabled:opacity-40"
                      disabled={transparentBg}
                    />
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => setTransparentBg(!transparentBg)}
                      className={
                        "inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all " +
                        (transparentBg
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300")
                      }
                      aria-pressed={transparentBg}
                    >
                      {transparentBg ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />} Transparent background
                    </button>
                  </div>
                </div>
              </div>

              {/* Contrast hint */}
              <div className="text-xs">
                <div className={"inline-flex items-center gap-2 px-2 py-1 rounded-lg border " + (contrastRatio < 3.0 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-700") }>
                  <span className="font-medium">Kontras:</span>
                  <span className="font-mono">{contrastRatio.toFixed(2)}:1</span>
                  <span>{contrastRatio < 3.0 ? "(rendah — pertimbangkan warna lebih kontras)" : "baik"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button onClick={downloadPNG} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 shadow-sm">
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button onClick={downloadSVG} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm">
                  <Download className="w-4 h-4" /> Download SVG
                </button>
                <button onClick={copyPNG} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-sm">
                  <ClipboardCopy className="w-4 h-4" /> {copied ? "Copied!" : "Copy PNG"}
                </button>
              </div>

              {error && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="order-1 lg:order-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-4">
              <h2 className="font-semibold">Preview</h2>
              <div className="text-xs text-gray-500 font-mono">{filenameBase()}</div>
            </div>

            <div className="w-full aspect-square max-w-[min(90vw,560px)] grid place-items-center rounded-2xl bg-gray-50 border border-dashed border-gray-200 overflow-hidden">
  <canvas
    ref={canvasRef}
    className="rounded-xl shadow-sm w-full h-auto max-w-full max-h-full"
    style={{ imageRendering: 'pixelated' }}
  />
</div>


            <div className="mt-4 text-xs text-gray-500 text-center">
              Tip: Untuk cetak atau QR sangat kecil, gunakan size & margin lebih besar.
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8">
        <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-600">© {new Date().getFullYear()} R Zanuar Eko Prastio. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
