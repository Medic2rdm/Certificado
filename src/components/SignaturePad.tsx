import { useEffect, useRef, useState } from "react";

const W = 560;
const H = 220;
const INK = "#1e3a8a";

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(!!value);
  const fileRef = useRef<HTMLInputElement>(null);

  const ctx2d = () => canvasRef.current?.getContext("2d") ?? null;

  // Inicializa la superficie con resolución 2x para firma nítida
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (value) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min((W - 24) / img.width, (H - 24) / img.height, 1);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      };
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    const ctx = ctx2d();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      // Puntos suaves al soltar el puntero
      ctx.lineTo(last.current.x + 0.1, last.current.y + 0.1);
      ctx.stroke();
    }
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = ctx2d();
    if (!ctx) return;
    const p = pos(e);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const canvas = canvasRef.current;
    if (canvas) {
      setHasInk(true);
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = ctx2d();
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setHasInk(false);
    onChange(null);
  };

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = ctx2d();
        if (!canvas || !ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        const scale = Math.min((W - 24) / img.width, (H - 24) / img.height, 1);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        setHasInk(true);
        onChange(canvas.toDataURL("image/png"));
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="relative rounded-xl border-2 border-dashed border-zinc-300 bg-white transition-colors focus-within:border-teal-600">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", display: "block", touchAction: "none" }}
          className="cursor-crosshair rounded-xl"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
        />
        {/* línea guía */}
        <div className="pointer-events-none absolute inset-x-10 bottom-7 border-b border-zinc-200" />
        {!hasInk && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-zinc-400">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            <span className="text-xs font-semibold">Dibuje la firma aquí con el mouse o el dedo</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:bg-zinc-50"
        >
          Subir imagen de firma
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
            e.target.value = "";
          }}
        />
        <span className="ml-auto text-[11px] font-medium text-zinc-400">
          {hasInk ? "Firma lista · se aplicará al firmar" : "Sin firma todavía"}
        </span>
      </div>
    </div>
  );
}
