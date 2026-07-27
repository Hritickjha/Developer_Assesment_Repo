import { msalInstance, signInWithCredential, type AuthenticationResult } from "./msalClient";
import { graphRequest } from "./msalConfig";

export interface AuthUser {
  email: string;
  displayName: string;
  tenantId: string;
  homeAccountId: string;
}

export function getUser(): AuthUser | null {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;
  return {
    email:         account.username,
    displayName:   account.name,
    tenantId:      account.tenantId,
    homeAccountId: account.homeAccountId,
  };
}

export async function signIn(email: string): Promise<AuthenticationResult> {
  return signInWithCredential(email);
}

export function signOut(): void {
  msalInstance.logoutPopup();
}

export function getAuthHeaders(): Record<string, string> {
  const account = msalInstance.getActiveAccount();
  if (!account) return {};

  const token = localStorage.getItem("msal.token.access");
  const headers: Record<string, string> = {
    "X-User-Email": account.username,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export async function getGraphToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    const result = await msalInstance.acquireTokenSilent({
      scopes:  graphRequest.scopes,
      account,
    });
    return result.accessToken;
  } catch {
    return null;
  }
}
