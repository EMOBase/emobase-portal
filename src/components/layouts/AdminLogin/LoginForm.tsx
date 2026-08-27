import { actions } from "astro:actions";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setLoading(true);
    // TODO: Replace with the real Keycloak login flow when adopted.
    // See src/actions/index.ts — currently no real credential check.
    await actions.login();
    window.location.href = "/admin";
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={loading}
      onClick={onLogin}
    >
      {loading ? "Signing in..." : "Login"}
    </Button>
  );
}
