import { fallbackCatalog } from "../catalog";
import type { EstimateRequest, PublicCatalog, PublicEstimate } from "../types";

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: { message?: string } };
    return body.error?.message || `请求失败 (${response.status})`;
  } catch {
    return `请求失败 (${response.status})`;
  }
}

export async function loadCatalog(): Promise<PublicCatalog> {
  if (!apiBase) return fallbackCatalog;
  try {
    const response = await fetch(`${apiBase}/api/v1/public/catalog`);
    if (!response.ok) return fallbackCatalog;
    return await response.json() as PublicCatalog;
  } catch {
    return fallbackCatalog;
  }
}

export async function createEstimate(request: EstimateRequest): Promise<PublicEstimate> {
  if (!apiBase) throw new Error("报价 API 尚未配置。请设置 VITE_API_BASE_URL。");

  const response = await fetch(`${apiBase}/api/v1/estimates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error(await parseError(response));
  return await response.json() as PublicEstimate;
}
