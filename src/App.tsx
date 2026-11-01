import { useEffect, useRef, useState } from "react";
import Certificate from "./components/Certificate";
import SignaturePad from "./components/SignaturePad";
import { Card, Field, SelectInput, TextInput } from "./components/Field";
import { BANNERS, type BannerKey, type CertState, type ClinicData, type PatientData, type ReasonData, type SignData } from "./types";
import { addDaysISO, todayISO } from "./utils/es";
import { cn } from "./utils/cn";

const LS_KEY = "certificamed-v1";

const DEFAULTS: CertState = {
  clinic: {
    name: "Consultorio Dra. Pamela Pino",
    doctorName: "Dra. Pamela Pino",
    email: "dra.pamela.pino@gmail.com",
    phone: "0982785653",
    address: "Manta, Cda.  y calle 10",
    place: "Manta, Ecuador",
    issueDate: todayISO(),
  },
  patient: {
    fullName: "Rhonnie Duarte",
    address: "Cdla Universitaria, Manta",
    phone: "0989467002",
    institution: "Hospital Basico Pichincha",
    job: "Medico General en Funciones Hospitalarias",
    cedula: "0915842488",
    history: "1738",
    email: "rhonnie.duarte@hbpichincha.gob.ec",
  },
  reason: {
    diagnosis: "Cefalea y Vòmito",
    oie: "OIE-10: A97.0",
    symptoms: "Sí",
    type: "Enfermedad",
    days: "1",
    from: todayISO(),
    to: todayISO(),
  },
  sign: {
    name: "Dra. Pamela Pino",
    cedula: "1316321874",
    senscyt: "1016-2019-2099483",
  },
  logo: null,
  signature: null,
  signed: false,
  banner: "teal",
};

function loadState(): CertState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<CertState>;
      return {
        ...DEFAULTS,
        ...p,
        clinic: { ...DEFAULTS.clinic, ...p.clinic },
        patient: { ...DEFAULTS.patient, ...p.patient },
        reason: { ...DEFAULTS.reason, ...p.reason },
        sign: { ...DEFAULTS.sign, ...p.sign },
      };
    }
  } catch {
    /* estado corrupto: se ignora */
  }
  return DEFAULTS;
}

/* ---------- Iconos ---------- */
const I = {
  printer: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  ),
  pen: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  ),
  check: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  reset: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
    </svg>
  ),
  upload: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  cross: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 4v16M4 12h16" />
    </svg>
  ),
};

const REQUIRED: Array<(s: CertState) => string> = [
  (s) => s.clinic.name,
  (s) => s.clinic.doctorName,
  (s) => s.clinic.email,
  (s) => s.clinic.phone,
  (s) => s.clinic.address,
  (s) => s.clinic.place,
  (s) => s.clinic.issueDate,
  (s) => s.patient.fullName,
  (s) => s.patient.address,
  (s) => s.patient.phone,
  (s) => s.patient.institution,
  (s) => s.patient.job,
  (s) => s.patient.cedula,
  (s) => s.patient.history,
  (s) => s.patient.email,
  (s) => s.reason.diagnosis,
  (s) => s.reason.days,
  (s) => s.reason.from,
  (s) => s.reason.to,
];

export default function App() {
  const [state, setState] = useState<CertState>(loadState);
  const [view, setView] = useState<"form" | "preview">("form");
  const [showReset, setShowReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [sheetH, setSheetH] = useState(1123);

  const banner = BANNERS[state.banner] ?? BANNERS.teal;

  /* Persistencia */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* almacenamiento lleno: se ignora */
    }
  }, [state]);

  /* Escala de la vista previa */
  useEffect(() => {
    const vp = viewportRef.current;
    const sh = sheetRef.current;
    if (!vp) return;
    const fit = () => setScale(Math.min(1, Math.max(0.25, (vp.clientWidth - 40) / 794)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(vp);
    let ro2: ResizeObserver | null = null;
    if (sh) {
      ro2 = new ResizeObserver(() => setSheetH(sh.offsetHeight || 1123));
      ro2.observe(sh);
    }
    return () => {
      ro.disconnect();
      ro2?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const setClinic = (f: keyof ClinicData, v: string) =>
    setState((s) => ({ ...s, clinic: { ...s.clinic, [f]: v } }));
  const setPatient = (f: keyof PatientData, v: string) =>
    setState((s) => ({ ...s, patient: { ...s.patient, [f]: v } }));
  const setSign = (f: keyof SignData, v: string) =>
    setState((s) => ({ ...s, sign: { ...s.sign, [f]: v } }));
  const setReason = (f: keyof ReasonData, v: string) =>
    setState((s) => {
      const reason = { ...s.reason, [f]: v };
      if (f === "from" || f === "days") {
        const d = parseInt(reason.days, 10);
        if (reason.from && !isNaN(d) && d >= 1) {
          const t = addDaysISO(reason.from, d - 1);
          if (t) reason.to = t;
        }
      }
      return { ...s, reason };
    });

  const filled = REQUIRED.filter((f) => f(state).trim() !== "").length;

  const canSign =
    !!state.signature &&
    state.sign.name.trim() !== "" &&
    state.sign.cedula.trim() !== "" &&
    state.sign.senscyt.trim() !== "";

  const handleSign = () => {
    if (state.signed) return;
    if (!canSign) {
      notify("Para firmar complete nombre, cédula, registro SENCYT y dibuje o suba la firma.");
      return;
    }
    setState((s) => ({ ...s, signed: true }));
    notify("Certificado firmado digitalmente. La firma quedó aplicada al documento.");
  };

  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setState((s) => ({ ...s, logo: String(reader.result) }));
      notify("Logo cargado en el banner del certificado.");
    };
    reader.readAsDataURL(file);
  };

  const newPatient = () => {
    setState((s) => ({
      ...s,
      patient: {
        fullName: "",
        address: "",
        phone: "",
        institution: "",
        job: "",
        cedula: "",
        history: "",
        email: "",
      },
      reason: {
        diagnosis: "",
        oie: "",
        symptoms: "Sí",
        type: "Enfermedad",
        days: "1",
        from: todayISO(),
        to: todayISO(),
      },
      signed: false,
    }));
    notify("Datos de paciente y motivo reiniciados.");
  };

  const resetAll = () => {
    setState({ ...DEFAULTS, clinic: { ...DEFAULTS.clinic, issueDate: todayISO() }, reason: { ...DEFAULTS.reason, from: todayISO(), to: todayISO() } });
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* sin acceso a almacenamiento */
    }
    setShowReset(false);
    notify("Aplicación restablecida a los valores de ejemplo.");
  };

  const printPDF = () => {
    notify("En el diálogo de impresión, elija «Guardar como PDF» para descargar.");
    setTimeout(() => window.print(), 350);
  };

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40";

  return (
    <>
      {/* ================= APLICACIÓN (se oculta al imprimir) ================= */}
      <div id="app-shell" className="min-h-screen print:hidden">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 to-teal-400 text-white shadow-sm">
                {I.cross}
              </span>
              <div className="leading-tight">
                <h1 className="font-display text-[15px] font-bold tracking-tight text-zinc-900">
                  CertificaMed
                </h1>
                <p className="text-[11px] font-medium text-zinc-500">
                  Generador de certificados médicos
                </p>
              </div>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold sm:inline-flex",
                  filled === REQUIRED.length
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    filled === REQUIRED.length ? "bg-emerald-500" : "bg-zinc-400"
                  )}
                />
                {filled}/{REQUIRED.length} campos
              </span>

              <button type="button" onClick={newPatient} className={cn(btn, "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50")}>
                {I.plus} Nuevo paciente
              </button>
              <button
                type="button"
                onClick={() => setShowReset(true)}
                title="Restablecer todo"
                className={cn(btn, "border border-zinc-300 bg-white px-2.5 text-zinc-500 hover:bg-zinc-50 hover:text-rose-600")}
              >
                {I.reset}
              </button>
              <button
                type="button"
                onClick={handleSign}
                disabled={state.signed}
                className={cn(
                  btn,
                  state.signed
                    ? "cursor-default border border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "bg-teal-700 text-white shadow-sm hover:bg-teal-800"
                )}
              >
                {state.signed ? I.check : I.pen}
                {state.signed ? "Firmado" : "Firmar certificado"}
              </button>
              <button type="button" onClick={printPDF} className={cn(btn, "bg-zinc-900 text-white shadow-sm hover:bg-zinc-700")}>
                {I.printer} Descargar PDF
              </button>
            </div>
          </div>

          {/* Pestañas en móvil */}
          <div className="mx-auto flex max-w-[1500px] gap-1 px-4 pb-2 lg:hidden">
            {(["form", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex-1 rounded-lg px-3 py-1.5 text-[13px] font-bold transition",
                  view === v ? "bg-teal-700 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                )}
              >
                {v === "form" ? "Formulario" : "Vista previa"}
              </button>
            ))}
          </div>
        </header>

        <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[450px_minmax(0,1fr)]">
          {/* ---------- Columna de formulario ---------- */}
          <div
            className={cn(
              "nice-scroll flex flex-col gap-4 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-1",
              view === "form" ? "block" : "hidden lg:block"
            )}
          >
            <Card badge="A" title="Establecimiento de salud" subtitle="Datos del consultorio y emisión" accent="#0f766e">
              <Field label="Nombre del médico" className="sm:col-span-2">
                <TextInput value={state.clinic.doctorName} onChange={(e) => setClinic("doctorName", e.target.value)} placeholder="Dr. Nombre Apellido" />
              </Field>
              <Field label="Nombre del establecimiento">
                <TextInput value={state.clinic.name} onChange={(e) => setClinic("name", e.target.value)} placeholder="RDM Clinic" />
              </Field>
              <Field label="Lugar de emisión">
                <TextInput value={state.clinic.place} onChange={(e) => setClinic("place", e.target.value)} placeholder="Manta, Ecuador" />
              </Field>
              <Field label="Correo del emisor">
                <TextInput type="email" value={state.clinic.email} onChange={(e) => setClinic("email", e.target.value)} placeholder="doctor@correo.com" />
              </Field>
              <Field label="Teléfono del emisor">
                <TextInput value={state.clinic.phone} onChange={(e) => setClinic("phone", e.target.value)} placeholder="0999 999999" />
              </Field>
              <Field label="Dirección del establecimiento" className="sm:col-span-2">
                <TextInput value={state.clinic.address} onChange={(e) => setClinic("address", e.target.value)} placeholder="Calle y Avenida, Ciudad" />
              </Field>
              <Field label="Fecha de emisión" className="sm:col-span-2">
                <TextInput type="date" value={state.clinic.issueDate} onChange={(e) => setClinic("issueDate", e.target.value)} />
              </Field>
            </Card>

            <Card badge="B" title="Datos del paciente" subtitle="Información de quien recibe el certificado" accent="#155e75">
              <Field label="Apellidos y nombres completos" className="sm:col-span-2">
                <TextInput value={state.patient.fullName} onChange={(e) => setPatient("fullName", e.target.value)} placeholder="Karen García" />
              </Field>
              <Field label="Número de cédula">
                <TextInput inputMode="numeric" value={state.patient.cedula} onChange={(e) => setPatient("cedula", e.target.value)} placeholder="1386725622" />
              </Field>
              <Field label="N.º de historia clínica">
                <TextInput value={state.patient.history} onChange={(e) => setPatient("history", e.target.value)} placeholder="0001" />
              </Field>
              <Field label="Dirección domiciliaria" className="sm:col-span-2">
                <TextInput value={state.patient.address} onChange={(e) => setPatient("address", e.target.value)} placeholder="Ciudad / barrio" />
              </Field>
              <Field label="Número de teléfono">
                <TextInput value={state.patient.phone} onChange={(e) => setPatient("phone", e.target.value)} placeholder="0978 286 522" />
              </Field>
              <Field label="Correo electrónico">
                <TextInput type="email" value={state.patient.email} onChange={(e) => setPatient("email", e.target.value)} placeholder="paciente@correo.com" />
              </Field>
              <Field label="Institución o empresa">
                <TextInput value={state.patient.institution} onChange={(e) => setPatient("institution", e.target.value)} placeholder="Manta Center" />
              </Field>
              <Field label="Puesto de trabajo">
                <TextInput value={state.patient.job} onChange={(e) => setPatient("job", e.target.value)} placeholder="Prepago" />
              </Field>
            </Card>

            <Card badge="C" title="Motivo de aislamiento / enfermedad" subtitle="Diagnóstico y período concedido" accent="#7c2d12">
              <Field label="Diagnóstico" className="sm:col-span-2">
                <TextInput value={state.reason.diagnosis} onChange={(e) => setReason("diagnosis", e.target.value)} placeholder="Dengue sin signos de alarma" />
              </Field>
              <Field label="Código OIE-10">
                <TextInput value={state.reason.oie} onChange={(e) => setReason("oie", e.target.value)} placeholder="OIE-10: A97.0" />
              </Field>
              <Field label="Presenta síntomas">
                <SelectInput value={state.reason.symptoms} onChange={(e) => setReason("symptoms", e.target.value)}>
                  <option>Sí</option>
                  <option>No</option>
                </SelectInput>
              </Field>
              <Field label="Tipo">
                <SelectInput value={state.reason.type} onChange={(e) => setReason("type", e.target.value)}>
                  <option>Enfermedad</option>
                  <option>Accidente de trabajo</option>
                  <option>Accidente de tránsito</option>
                  <option>Vacunación</option>
                  <option>Otro</option>
                </SelectInput>
              </Field>
              <Field label="Total de días concedidos">
                <TextInput
                  type="number"
                  min={1}
                  value={state.reason.days}
                  onChange={(e) => setReason("days", e.target.value)}
                />
              </Field>
              <Field label="Desde">
                <TextInput type="date" value={state.reason.from} onChange={(e) => setReason("from", e.target.value)} />
              </Field>
              <Field label="Hasta" className="sm:col-span-1" hint="Se calcula con los días concedidos; editable.">
                <TextInput type="date" value={state.reason.to} onChange={(e) => setReason("to", e.target.value)} />
              </Field>
            </Card>

            <Card
              badge="F"
              title="Firma digital y sello legal"
              subtitle="Se aplica al documento al presionar «Firmar certificado»"
              accent="#b45309"
              action={
                state.signed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, signed: false }));
                      notify("Firma retirada del certificado.");
                    }}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition hover:bg-rose-100"
                  >
                    Quitar firma
                  </button>
                ) : undefined
              }
            >
              <Field label="Nombre del firmante">
                <TextInput value={state.sign.name} onChange={(e) => setSign("name", e.target.value)} placeholder="Dr. Nombre Apellido" />
              </Field>
              <Field label="Cédula del médico">
                <TextInput inputMode="numeric" value={state.sign.cedula} onChange={(e) => setSign("cedula", e.target.value)} placeholder="1709876543" />
              </Field>
              <Field label="Registro SENCYT" className="sm:col-span-2" hint="Número de registro del médico ante la SENCYT.">
                <TextInput value={state.sign.senscyt} onChange={(e) => setSign("senscyt", e.target.value)} placeholder="2026-045871" />
              </Field>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                  Firma
                </span>
                <SignaturePad
                  value={state.signature}
                  onChange={(sig) => setState((s) => ({ ...s, signature: sig }))}
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={state.signed}
                  className={cn(
                    btn,
                    "w-full justify-center py-2.5",
                    state.signed
                      ? "cursor-default border border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "bg-amber-600 text-white shadow-sm hover:bg-amber-700"
                  )}
                >
                  {state.signed ? I.check : I.pen}
                  {state.signed ? "Certificado firmado" : "Firmar y aplicar al certificado"}
                </button>
                {!state.signed && !canSign && (
                  <p className="mt-1.5 text-center text-[11px] text-zinc-400">
                    Requiere nombre, cédula, registro SENCYT y una firma dibujada o subida.
                  </p>
                )}
              </div>
            </Card>

            <Card badge="D" title="Apariencia del documento" subtitle="Logo del consultorio y color del banner" accent="#3f3f46">
              <Field label="Logo del consultorio" className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 p-1">
                    {state.logo ? (
                      <img src={state.logo} alt="Logo" className="h-full w-full rounded-full object-contain" />
                    ) : (
                      <span className="text-zinc-300">{I.cross}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={cn(btn, "cursor-pointer border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50")}>
                      {I.upload} Subir logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleLogo(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {state.logo && (
                      <button
                        type="button"
                        onClick={() => {
                          setState((s) => ({ ...s, logo: null }));
                          notify("Logo retirado del banner.");
                        }}
                        className={cn(btn, "justify-center border border-zinc-200 bg-white px-2 text-[11px] text-zinc-400 hover:text-rose-600")}
                      >
                        {I.trash} Quitar
                      </button>
                    )}
                  </div>
                  <span className="ml-auto hidden text-right text-[11px] leading-tight text-zinc-400 sm:block">
                    Aparece a la izquierda
                    <br />
                    del banner, a color
                  </span>
                </div>
              </Field>
              <Field label="Color del banner" className="sm:col-span-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  {(Object.keys(BANNERS) as BannerKey[]).map((k) => {
                    const b = BANNERS[k];
                    const active = state.banner === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        title={b.label}
                        onClick={() => setState((s) => ({ ...s, banner: k }))}
                        className={cn(
                          "h-9 w-14 rounded-lg transition",
                          active ? "ring-2 ring-zinc-900 ring-offset-2" : "opacity-80 hover:opacity-100"
                        )}
                        style={{ background: `linear-gradient(120deg, ${b.from}, ${b.to})` }}
                      />
                    );
                  })}
                  <span className="text-[11px] font-semibold text-zinc-500">{banner.label}</span>
                </div>
              </Field>
            </Card>

            <p className="pb-2 text-center text-[11px] text-zinc-400">
              Los datos, el logo y la firma se guardan automáticamente en este dispositivo.
            </p>
          </div>

          {/* ---------- Vista previa ---------- */}
          <div
            className={cn(
              "rounded-2xl border border-zinc-200 bg-[#e7e9e8]",
              view === "preview" ? "block" : "hidden lg:block"
            )}
          >
            <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-2">
              <span className="font-display text-[12px] font-bold uppercase tracking-wider text-zinc-500">
                Vista previa · A4
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", state.signed ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-500")}>
                {state.signed ? "FIRMADO DIGITALMENTE" : "SIN FIRMA"}
              </span>
            </div>
            <div ref={viewportRef} className="nice-scroll h-[68vh] overflow-auto p-4 lg:h-[calc(100vh-188px)]">
              <div
                style={{ height: sheetH * scale, width: 794 * scale, margin: "0 auto" }}
                className="relative transition-[width] duration-150"
              >
                <div
                  ref={sheetRef}
                  style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794 }}
                  className="shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)]"
                >
                  <Certificate state={state} banner={banner} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= COPIA PARA IMPRESIÓN / PDF ================= */}
      <div className="hidden print:block">
        <Certificate state={state} banner={banner} isPrint />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 print:hidden">
          <div className="flex items-center gap-2 rounded-xl bg-zinc-900/95 px-4 py-2.5 text-[13px] font-semibold text-white shadow-xl">
            <span className="text-teal-400">{I.check}</span>
            {toast}
          </div>
        </div>
      )}

      {/* Modal de restablecimiento */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-display text-base font-bold text-zinc-900">¿Restablecer todo?</h3>
              <button type="button" onClick={() => setShowReset(false)} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                {I.x}
              </button>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-zinc-500">
              Se borrarán todos los datos, el logo, la firma y la configuración guardados, y la
              aplicación volverá a los valores de ejemplo. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowReset(false)} className={cn(btn, "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50")}>
                Cancelar
              </button>
              <button type="button" onClick={resetAll} className={cn(btn, "bg-rose-600 text-white hover:bg-rose-700")}>
                {I.trash} Sí, restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
