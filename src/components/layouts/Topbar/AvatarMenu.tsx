import { Menu } from "@base-ui/react/menu";
import { Database, LogOut } from "lucide-react";
import { signOut } from "@zitadel/astro-auth/client";

import { Button } from "@/components/ui/button";

function getAvatarChars(value: string) {
  const words = value.trim().split(" ");

  if (words.length > 1) {
    return words[0][0] + words[1][0];
  }

  if (words[0].length > 1) {
    return words[0][0] + words[0][1];
  }

  return words[0][0];
}

export default function AvatarMenu({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  function onLogout() {
    void signOut({ callbackUrl: "/" });
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Account menu"
      >
        <span
          className="flex h-9 w-9 select-none items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-medium tracking-wide text-slate-600 shadow-sm"
          aria-hidden="true"
        >
          {getAvatarChars(name || email)}
        </span>
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
            <Menu.LinkItem
              href="/admin/versions"
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 outline-none hover:bg-muted focus-visible:bg-muted data-[highlighted]:bg-muted"
            >
              <Database className="h-4 w-4" />
              Data Management
            </Menu.LinkItem>
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
