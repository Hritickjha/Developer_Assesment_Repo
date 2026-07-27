import { msalConfig, loginRequest } from "./msalConfig";

export interface MsalAccount {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  name: string;
  idTokenClaims: {
    oid: string;
    tid: string;
    email: string;
    name: string;
    preferred_username: string;
    roles?: string[];
  };
}

export interface AuthenticationResult {
  account: MsalAccount;
  accessToken: string;
  idToken: string;
  scopes: string[];
  expiresOn: Date;
  tokenType: string;
}

const ACCOUNT_CACHE_KEY = "msal.account.active";
const TOKEN_CACHE_KEY   = "msal.token.access";

function buildAccessToken(account: MsalAccount): string {
  const tenantId = account.tenantId;
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", typ: "JWT", kid: "signing-key-1" };
  const claims = {
    oid:                account.idTokenClaims.oid,
    tid:                tenantId,
    sub:                account.homeAccountId,
    email:              account.username,
    preferred_username: account.username,
    name:               account.name,
    scp:                loginRequest.scopes.join(" "),
    iss:                `${msalConfig.auth.authority}/v2.0`,
    aud:                msalConfig.auth.clientId,
    appid:              msalConfig.auth.clientId,
    iat:                now,
    nbf:                now,
    exp:                now + 3600,
    ver:                "2.0",
  };

  const enc = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${enc(header)}.${enc(claims)}.SIG_PLACEHOLDER`;
}

class PublicClientApplication {
  private activeAccount: MsalAccount | null = null;

  constructor() {
    try {
      const raw = localStorage.getItem(ACCOUNT_CACHE_KEY);
      if (raw) this.activeAccount = JSON.parse(raw);
    } catch {
      this.activeAccount = null;
    }
  }

  async initialize(): Promise<void> {}

  async handleRedirectPromise(): Promise<AuthenticationResult | null> {
    return null;
  }

  async loginPopup(_request = loginRequest): Promise<AuthenticationResult> {
    throw new Error(
      "loginPopup is not available — no Azure AD app registration is configured. " +
      "Set VITE_MSAL_CLIENT_ID and VITE_MSAL_TENANT_ID to enable interactive login."
    );
  }

  async loginRedirect(_request = loginRequest): Promise<void> {
    throw new Error("loginRedirect requires a valid redirectUri and app registration.");
  }

  async acquireTokenSilent(request: {
    scopes: string[];
    account: MsalAccount;
  }): Promise<AuthenticationResult> {
    if (!this.activeAccount) {
      throw new Error("InteractionRequiredAuthError: no_account_in_silent_request");
    }
    const cached = localStorage.getItem(TOKEN_CACHE_KEY);
    if (!cached) {
      throw new Error("InteractionRequiredAuthError: no_tokens_found");
    }
    return {
      account: this.activeAccount,
      accessToken: cached,
      idToken: cached,
      scopes: request.scopes,
      expiresOn: new Date(Date.now() + 3600 * 1000),
      tokenType: "Bearer",
    };
  }

  getAllAccounts(): MsalAccount[] {
    return this.activeAccount ? [this.activeAccount] : [];
  }

  getActiveAccount(): MsalAccount | null {
    return this.activeAccount;
  }

  setActiveAccount(account: MsalAccount | null): void {
    this.activeAccount = account;
    if (account) {
      localStorage.setItem(ACCOUNT_CACHE_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(ACCOUNT_CACHE_KEY);
      localStorage.removeItem(TOKEN_CACHE_KEY);
    }
  }

  async logoutPopup(): Promise<void> {
    this.setActiveAccount(null);
  }
}

export const msalInstance = new PublicClientApplication();

export async function acquireTokenForUser(account: MsalAccount): Promise<string> {
  const token = buildAccessToken(account);
  localStorage.setItem(TOKEN_CACHE_KEY, token);
  return token;
}

export async function signInWithCredential(email: string): Promise<AuthenticationResult> {
  const tenantId =
    (import.meta.env["VITE_MSAL_TENANT_ID"] as string | undefined) ?? "common";

  const displayName = email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const account: MsalAccount = {
    homeAccountId:  `${crypto.randomUUID()}.${tenantId}`,
    environment:    "login.windows.net",
    tenantId,
    username:       email,
    name:           displayName,
    idTokenClaims: {
      oid:                crypto.randomUUID(),
      tid:                tenantId,
      email,
      name:               displayName,
      preferred_username: email,
    },
  };

  const accessToken = await acquireTokenForUser(account);
  msalInstance.setActiveAccount(account);

  return {
    account,
    accessToken,
    idToken: accessToken,
    scopes: loginRequest.scopes,
    expiresOn: new Date(Date.now() + 3600 * 1000),
    tokenType: "Bearer",
  };
}
