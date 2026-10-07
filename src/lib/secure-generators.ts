const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*+-_";

function secureIndex(length: number) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return (value[0] ?? 0) % length;
}

function secureChars(alphabet: string, length: number) {
  return Array.from({ length }, () => alphabet[secureIndex(alphabet.length)]).join("");
}

export function generatePassword(length = 14) {
  const size = Math.max(12, Math.min(16, length));
  const required = [
    secureChars(UPPER, 1),
    secureChars(LOWER, 1),
    secureChars(DIGITS, 1),
    secureChars(SYMBOLS, 1),
  ];
  const chars = [
    ...required,
    ...secureChars(UPPER + LOWER + DIGITS + SYMBOLS, size - required.length),
  ];
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const target = secureIndex(index + 1);
    [chars[index], chars[target]] = [chars[target]!, chars[index]!];
  }
  return chars.join("");
}

export function generateActivationToken() {
  return `ACT-${secureChars(UPPER + DIGITS, 4)}-${secureChars(UPPER + DIGITS, 4)}-${secureChars(UPPER + DIGITS, 4)}`;
}

export function generateAssignmentAccessToken() {
  const alphabet = UPPER + DIGITS;
  return `TGS-${secureChars(alphabet, 4)}-${secureChars(alphabet, 4)}-${secureChars(alphabet, 4)}`;
}

export function generateVoucherCode(prefix = "JOKI") {
  const clean =
    prefix
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "JOKI";
  return `${clean}-${secureChars(DIGITS, 2)}-${secureChars(UPPER + DIGITS, 4)}`;
}

export async function hashSecret(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toUpperCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0/, "62").replace(/^8/, "628");
  return digits.startsWith("62") ? `+${digits}` : `+62${digits}`;
}
export function normalizeLoginIdentifier(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  const looksLikePhone = /^[+\d\s()-]+$/.test(trimmed) && digits.length >= 9;
  if (!looksLikePhone) return { kind: "username" as const, value: normalizeUsername(trimmed) };
  let normalized = digits;
  if (normalized.startsWith("08")) normalized = `62${normalized.slice(1)}`;
  else if (normalized.startsWith("8")) normalized = `62${normalized}`;
  return /^628\d{8,11}$/.test(normalized)
    ? { kind: "whatsapp" as const, value: normalized }
    : { kind: "username" as const, value: normalizeUsername(trimmed) };
}
export const isValidIndonesianWhatsapp = (value: string) =>
  /^\+628[1-9]\d{7,11}$/.test(normalizeWhatsapp(value));
export function maskWhatsapp(value: string) {
  const normalized = normalizeWhatsapp(value);
  return `+62 ${normalized.slice(3, 6)}-****-${normalized.slice(-4)}`;
}
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}
export function calculateDiscount(
  subtotal: number,
  type: "Persentase" | "Nominal Tetap",
  value: number,
  maxDiscount?: number,
) {
  const raw =
    type === "Persentase"
      ? subtotal * (Math.min(Math.max(value, 0), 100) / 100)
      : Math.max(value, 0);
  const capped = maxDiscount === undefined ? raw : Math.min(raw, maxDiscount);
  return Math.min(subtotal, Math.max(0, Math.round(capped)));
}

export const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  // Keep the legacy name reserved to preserve existing username policy.
  "temantugas",
  "support",
  "bantuan",
  "root",
  "system",
];
export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}
export function validateUsername(value: string) {
  const normalized = normalizeUsername(value);
  if (!/^[a-z0-9._-]{4,24}$/.test(normalized))
    return "Gunakan 4–24 karakter: huruf kecil, angka, titik, underscore, atau tanda hubung.";
  if (RESERVED_USERNAMES.includes(normalized))
    return "Username ini dicadangkan dan tidak dapat digunakan.";
  return "";
}

export function normalizeSocialUrl(platform: string, value: string) {
  const input = value.trim();
  if (platform === "WhatsApp") {
    const phone = normalizeWhatsapp(input.replace(/^https?:\/\/wa\.me\//i, ""));
    return `https://wa.me/${phone.replace(/\D/g, "")}`;
  }
  if (platform === "Email") {
    const email = input.replace(/^mailto:/i, "").trim();
    return `mailto:${email}`;
  }
  return input;
}

export function isSafeSocialUrl(platform: string, value: string) {
  const normalized = normalizeSocialUrl(platform, value);
  if (/^(javascript|data|vbscript):/i.test(normalized)) return false;
  if (platform === "Email") return /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(normalized);
  if (platform === "WhatsApp") return /^https:\/\/wa\.me\/628\d{8,12}$/i.test(normalized);
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}
