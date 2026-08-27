import { Menu } from "@base-ui/react/menu";
import { LogOut } from "lucide-react";
import { actions } from "astro:actions";

import { Button } from "@/components/ui/button";

const AVATAR_URL =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

export default function AvatarMenu({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  async function onLogout() {
    // TODO: Replace with the real Keycloak logout flow when adopted.
    await actions.logout();
    window.location.href = "/";
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        <img
          className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm"
          src={AVATAR_URL}
          alt="User avatar"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="end"
          sideOffset={8}
          className="z-50 outline-none"
        >
          <Menu.Popup className="min-w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            <div className="px-2.5 py-2">
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">{email}</p>
            </div>
            <div className="my-1 h-px bg-slate-100" />
            <Menu.Item className="rounded-md outline-none data-[highlighted]:bg-muted">
              <Button
                type="button"
                variant="ghost"
                onClick={onLogout}
                className="w-full justify-start rounded-md px-2.5 py-1.5 text-slate-700 hover:bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
