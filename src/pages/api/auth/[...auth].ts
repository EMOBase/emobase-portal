import { Auth } from "@auth/core";
import { decode } from "@auth/core/jwt";
import authConfig from "../../../../auth.config.mjs";
import { getEnv } from "@/utils/env";

const SESSION_COOKIES = ["__Secure-authjs.session-token", "authjs.session-token"];
const SIGNOUT_PATH = "/api/auth/signout";

const isLocalhost = (hostname: string) =>
  ["localhost", "127.0.0.1", "::1"].includes(hostname);

const handler = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);

  // Astro's node adapter builds http:// request URLs even when the public
  // endpoint is behind a TLS proxy. Rewrite to https on deployed hosts only;
  // local dev servers are plain http and must keep their original scheme.
  const behindTlsProxy = !isLocalhost(url.hostname);
  if (behindTlsProxy) {
    url.protocol = "https:";
  }

  if (behindTlsProxy && url.pathname === SIGNOUT_PATH && request.method === "POST") {
    const idToken = await getIdToken(request);
    const response = await Auth(new Request(url, request), authConfig);

    if (idToken) {
      const logoutUrl = new URL(
        `${getEnv("KEYCLOAK_ISSUER")}/protocol/openid-connect/logout`,
      );
      logoutUrl.searchParams.set("post_logout_redirect_uri", url.origin);
      logoutUrl.searchParams.set("id_token_hint", idToken);

      const res = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      res.headers.set("Location", logoutUrl.toString());
      return res;
    }

    return response;
  }

  return await Auth(new Request(url, request), authConfig);
};

async function getIdToken(request: Request): Promise<string | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const parts = cookie.split(";").map((c) => c.trim());

  for (const name of SESSION_COOKIES) {
    const value = parts
      .find((c) => c.startsWith(`${name}=`))
      ?.slice(name.length + 1);

    if (!value) continue;

    try {
      const token = await decode({
        token: value,
        secret: authConfig.secret as string,
        salt: name,
      });
      return typeof token?.idToken === "string" ? token.idToken : null;
    } catch {
      return null;
    }
  }

  return null;
}

export const GET = handler;
export const POST = handler;
