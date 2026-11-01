export type BannerKey = "teal" | "cobalt" | "wine" | "plum" | "carbon";

export interface BannerPreset {
  key: BannerKey;
  label: string;
  from: string;
  to: string;
  deep: string;
  light: string;
}

export const BANNERS: Record<BannerKey, BannerPreset> = {
  teal: {
    key: "teal",
    label: "Verde clínico",
    from: "#0f766e",
    to: "#2dd4bf",
    deep: "#134e4a",
    light: "#5eead4",
  },
  cobalt: {
    key: "cobalt",
    label: "Cobalto",
    from: "#1e40af",
    to: "#38bdf8",
    deep: "#1e3a8a",
    light: "#7dd3fc",
  },
  wine: {
    key: "wine",
    label: "Vino",
    from: "#7f1d1d",
    to: "#fb7185",
    deep: "#7f1d1d",
    light: "#fda4af",
  },
  plum: {
    key: "plum",
    label: "Ciruela",
    from: "#5b21b6",
    to: "#a78bfa",
    deep: "#4c1d95",
    light: "#c4b5fd",
  },
  carbon: {
    key: "carbon",
    label: "Carbón",
    from: "#18181b",
    to: "#52525b",
    deep: "#27272a",
    light: "#a1a1aa",
  },
};

export interface ClinicData {
  name: string;
  doctorName: string;
  email: string;
  phone: string;
  address: string;
  place: string;
  issueDate: string; // yyyy-mm-dd
}

export interface PatientData {
  fullName: string;
  address: string;
  phone: string;
  institution: string;
  job: string;
  cedula: string;
  history: string;
  email: string;
}

export interface ReasonData {
  diagnosis: string;
  oie: string;
  symptoms: string;
  type: string;
  days: string;
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
}

export interface SignData {
  name: string;
  cedula: string;
  senscyt: string;
}

export interface CertState {
  clinic: ClinicData;
  patient: PatientData;
  reason: ReasonData;
  sign: SignData;
  logo: string | null;
  signature: string | null;
  signed: boolean;
  banner: BannerKey;
}
