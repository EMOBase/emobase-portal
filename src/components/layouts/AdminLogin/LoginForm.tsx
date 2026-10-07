import { signIn } from "@zitadel/astro-auth/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  function onLogin() {
    setLoading(true);
    // Auth.js navigates away to Keycloak; this state is only visible in the
    // gap before the redirect lands.
    void signIn("keycloak", { callbackUrl: "/admin/versions" });
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={loading}
      onClick={onLogin}
    >
      {loading ? "Redirecting to Keycloak..." : "Login with Keycloak"}
    </Button>
  );
}
