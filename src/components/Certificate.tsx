import type { BannerPreset, CertState } from "../types";
import { addDaysISO, dateHuman, dateInWords, formatDMY, numberToWords } from "../utils/es";

const VALUE = "#b45309";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  const filled = value !== null && value !== undefined && String(value).trim() !== "";
  return (
    <p className="leading-[1.6]">
      <span className="font-bold text-stone-800">{label}: </span>
      {filled ? (
        <span className="font-medium" style={{ color: VALUE }}>
          {value}
        </span>
      ) : (
        <span className="text-stone-400">—</span>
      )}
    </p>
  );
}

function Section({
  title,
  deep,
  children,
}: {
  title: string;
  deep: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3
        className="mb-2.5 pb-1.5 text-[12px] font-bold tracking-[0.14em]"
        style={{ color: deep, borderBottom: `2px solid ${deep}2e` }}
      >
        {title}
      </h3>
      <div className="space-y-[6px] text-[12px]">{children}</div>
    </div>
  );
}

/* Sello circular de agua: texto circular + caduceo central */
function Seal({ text, name, color }: { text: string; name: string; color: string }) {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <circle cx="200" cy="200" r="192" fill="none" stroke={color} strokeWidth="5" />
      <circle cx="200" cy="200" r="174" fill="none" stroke={color} strokeWidth="2" />
      <defs>
        <path id="seal-arc-top" d="M 55 200 A 145 145 0 0 1 345 200" fill="none" />
        <path id="seal-arc-bot" d="M 55 200 A 145 145 0 0 0 345 200" fill="none" />
      </defs>
      <text
        fill={color}
        fontSize="27"
        fontWeight="700"
        letterSpacing="4"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#seal-arc-top" startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
      <text
        fill={color}
        fontSize="25"
        fontWeight="700"
        letterSpacing="3.5"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        <textPath href="#seal-arc-bot" startOffset="50%" textAnchor="middle">
          {name}
        </textPath>
      </text>
      <circle cx="55" cy="200" r="5" fill={color} />
      <circle cx="345" cy="200" r="5" fill={color} />
      {/* Caduceo */}
      <g
        transform="translate(200 202)"
        stroke={color}
        strokeLinecap="round"
        fill="none"
      >
        <line x1="0" y1="-92" x2="0" y2="92" strokeWidth="7" />
        <circle cx="0" cy="-104" r="9" fill={color} stroke="none" />
        <line x1="-27" y1="-68" x2="27" y2="-68" strokeWidth="6" />
        <path d="M 0 -42 C -44 -22 -44 6 0 20 C 44 34 44 62 0 78" strokeWidth="5.5" />
        <path d="M 0 -42 C 44 -22 44 6 0 20 C -44 34 -44 62 0 78" strokeWidth="5.5" />
        <circle cx="0" cy="-42" r="6" fill={color} stroke="none" />
      </g>
    </svg>
  );
}

function CaduceusMini({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 64" className={className} fill="none" stroke="currentColor" strokeLinecap="round">
      <line x1="20" y1="6" x2="20" y2="58" strokeWidth="4" />
      <circle cx="20" cy="4" r="3.5" fill="currentColor" stroke="none" />
      <line x1="10" y1="15" x2="30" y2="15" strokeWidth="3.5" />
      <path d="M 20 22 C 9 28 9 36 20 41 C 31 46 31 54 20 58" strokeWidth="3" />
      <path d="M 20 22 C 31 28 31 36 20 41 C 9 46 9 54 20 58" strokeWidth="3" />
    </svg>
  );
}

export default function Certificate({
  state,
  banner,
  isPrint = false,
}: {
  state: CertState;
  banner: BannerPreset;
  isPrint?: boolean;
}) {
  const { clinic, patient, reason, sign } = state;
  const days = parseInt(reason.days, 10);
  const daysFilled =
    reason.days && !isNaN(days) ? `${days} (${numberToWords(days).toLowerCase()} ${days === 1 ? "día" : "días"})` : "";
  const lugarFecha = [clinic.place, clinic.issueDate ? dateHuman(clinic.issueDate) : ""]
    .filter(Boolean)
    .join(", ");
  
  const toIso =
    reason.to || (reason.from && daysFilled ? (addDaysISO(reason.from, Math.max(days - 1, 0)) ?? "") : "");
  const fromLong = dateInWords(reason.from);
  const toLong = dateInWords(toIso);
  const doctor = clinic.doctorName || "Nombre del médico";
  const sealName = doctor.replace(/^Dr.?\s+/i, "").toUpperCase() || "MÉDICO TITULAR";

  return (
    <div
      className="cert-sheet relative mx-auto flex flex-col bg-white text-stone-900"
      style={{ width: 794, minHeight: 1123, fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* BANNER SUPERIOR */}
      <div
        className="flex items-center gap-5 px-8 py-5"
        style={{ background: `linear-gradient(115deg, ${banner.from} 0%, ${banner.to} 100%)` }}
      >
        {/* LOGO IZQUIERDO */}
        <div className="flex w-[78px] shrink-0 items-center justify-center">
          <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white/15 p-1.5 ring-2 ring-white/40">
            {state.logo ? (
              <img src={state.logo} alt="Logo del consultorio" className="h-full w-full rounded-full bg-white object-contain" />
            ) : (
              <CaduceusMini className="h-12 w-auto text-white/90" />
            )}
          </div>
        </div>

        {/* TEXTO CENTRAL */}
        <div className="min-w-0 flex-1 text-center">
          <p className="font-display text-[13px] font-bold tracking-[0.4em] text-white/85">
            CONSULTORIO MÉDICO
          </p>
          <p className="truncate text-[25px] font-extrabold leading-tight text-white">{doctor}</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold tracking-[0.18em] text-white/75">
            {(clinic.name || "Consultorio médico").toUpperCase()}
          </p>
        </div>

        {/* LOGO DERECHO (cambia con el logo subido) */}
        <div className="flex w-[78px] shrink-0 items-center justify-center">
          {state.logo ? (
            <img src={state.logo} alt="Logo" className="h-14 w-auto rounded-full object-contain opacity-70" />
          ) : (
            <CaduceusMini className="h-14 w-auto text-white/30" />
          )}
        </div>
      </div>

      <div className="h-[6px]" style={{ background: banner.deep }} />

      {/* MARCA DE AGUA CENTRAL (cambia con el logo subido) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {state.logo ? (
          <div className="h-[380px] w-[380px] opacity-[0.08]">
            <img src={state.logo} alt="" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="h-[380px] w-[380px] opacity-[0.06]">
            <Seal text="CONSULTORIO MÉDICO" name={sealName} color={banner.deep} />
          </div>
        )}
      </div>

      {/* CUERPO */}
      <div className="relative flex flex-1 flex-col px-[52px] pb-6 pt-7">
        <header className="mb-6 text-center">
          <h1 className="text-[21px] font-extrabold tracking-[0.32em]" style={{ color: banner.deep }}>
            CERTIFICADO MÉDICO
          </h1>
          <p className="mt-1 text-[13px] font-bold" style={{ color: VALUE }}>
            {doctor}
          </p>
        </header>

        <Section title="A) DATOS DEL ESTABLECIMIENTO DE SALUD" deep={banner.deep}>
          <Row label="Nombre del establecimiento" value={clinic.name} />
          <Row label="Correo electrónico del médico emisor del certificado" value={clinic.email} />
          <Row label="Teléfono del emisor del certificado" value={clinic.phone} />
          <Row label="Dirección del establecimiento de salud" value={clinic.address} />
          <Row label="Lugar y fecha de emisión" value={lugarFecha} />
        </Section>

        <Section title="B) DATOS DEL PACIENTE" deep={banner.deep}>
          <Row label="Apellidos y nombres completo" value={patient.fullName} />
          <Row label="Dirección domiciliaria" value={patient.address} />
          <Row label="Número de teléfono" value={patient.phone} />
          <Row label="Institución o empresa" value={patient.institution} />
          <Row label="Puesto de trabajo del paciente" value={patient.job} />
          <Row label="Número de cédula" value={patient.cedula} />
          <Row label="Número de historia clínica" value={patient.history} />
          <Row label="Correo electrónico" value={patient.email} />
        </Section>

        <Section title="C) MOTIVO DE AISLAMIENTO/ENFERMEDAD" deep={banner.deep}>
          <Row label="Diagnóstico" value={reason.diagnosis} />
          <Row label="Código OIE-10" value={reason.oie} />
          <Row label="Presenta síntomas" value={reason.symptoms} />
          <Row label="Tipo" value={reason.type} />
          <Row label="Total de días concedidos" value={daysFilled} />
          <Row
            label="Desde"
            value={reason.from ? `${formatDMY(reason.from)}${fromLong ? ` (${fromLong})` : ""}` : ""}
          />
          <Row
            label="Hasta"
            value={toIso ? `${formatDMY(toIso)}${toLong ? ` (${toLong})` : ""}` : ""}
          />
        </Section>

        <div className="flex-1" />

        {/* FIRMA */}
        <div className="flex flex-col items-center pt-2">
          {state.signed && state.signature ? (
            <img src={state.signature} alt="Firma digital" className="max-h-[72px] max-w-[230px] object-contain" />
          ) : !isPrint ? (
            <div className="flex h-[72px] w-[230px] items-center justify-center rounded-lg border-2 border-dashed border-zinc-200">
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300">
                PENDIENTE DE FIRMA
              </span>
            </div>
          ) : null}
          <div className="mt-2 h-[2px] w-[230px] bg-stone-700" />
          <p className="mt-1.5 text-[13px] font-bold text-stone-800">{sign.name || " "}</p>
          <p className="text-[11.5px] font-semibold" style={{ color: VALUE }}>
            C.I. {sign.cedula || "—"}
          </p>
          <p className="text-[11.5px] font-semibold" style={{ color: VALUE }}>
            Registro SENCYT N.º {sign.senscyt || "—"}
          </p>
        </div>

        <footer className="mt-7 border-t border-stone-200 pt-2.5 text-center text-[9px] leading-relaxed text-stone-400">
          Documento emitido por {clinic.name || "el consultorio médico"}
          {clinic.issueDate ? ` el ${dateHuman(clinic.issueDate)}` : ""} · Este certificado se
          expide a solicitud de parte para los fines que convengan.
        </footer>
      </div>
    </div>
  );
}
