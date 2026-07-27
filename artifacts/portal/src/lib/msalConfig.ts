export const msalConfig = {
  auth: {
    clientId: import.meta.env["VITE_MSAL_CLIENT_ID"] as string,
    authority: `https://login.microsoftonline.com/${import.meta.env["VITE_MSAL_TENANT_ID"] ?? "common"}`,
    redirectUri: import.meta.env["VITE_MSAL_REDIRECT_URI"] as string,
    postLogoutRedirectUri: import.meta.env["VITE_MSAL_REDIRECT_URI"] as string,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: "localStorage" as const,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: 0,
      loggerCallback: (level: number, message: string) => {
        if (level === 0) console.error("[MSAL]", message);
      },
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const graphRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const graphConfig = {
  graphMeEndpoint:    "https://graph.microsoft.com/v1.0/me",
  graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users",
};
