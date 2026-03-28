export const SPREADSHEET_ID = "1wPXKW_E7VJuVueJLkusT4NvcRww2GIUr0JwKxWByHTU";
export const REFRESH_INTERVAL = 15000;
export const API_TIMEOUT = 60000;

const DEFAULT_API_URL = "https://n8n-latest-1ikm.onrender.com";

export const getApiBaseUrl = (): string => {
  const stored = localStorage.getItem("autoflow_api_base_url");
  if (stored && stored.includes("localhost")) {
    localStorage.removeItem("autoflow_api_base_url");
    return DEFAULT_API_URL;
  }
  return stored || DEFAULT_API_URL;
};

export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem("autoflow_api_base_url", url);
};

export const SHEET_NAMES = {
  INVOICES: "invoices",
  POLICY_DECISIONS: "policy_decisions",
  AUDIT_LEDGER: "audit_ledger",
  ERRORS: "errors",
  PAYMENT_LEDGER: "payment_ledger",
} as const;

export type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES];

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}
