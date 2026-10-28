import AvatarMenu from "@/components/layouts/Topbar/AvatarMenu";
import SearchBox from "@/components/common/SearchBox";
import VersionSelector from "@/components/layouts/Topbar/VersionSelector";

const homeHref = () => {
  if (typeof window === "undefined") return "/";
  const versionOverride = new URL(window.location.href).searchParams.get(
    "version",
  );
  return versionOverride
    ? `/?version=${encodeURIComponent(versionOverride)}`
    : "/";
};

export default function Topbar({
  user,
  showVersionSelector = true,
}: {
  user: { email: string; name: string } | null;
  showVersionSelector?: boolean;
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={homeHref()}
            className="font-display font-bold text-[1.35rem] tracking-tight text-slate-700"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500/80">
              EMO
            </span>
            Base
          </a>

          {showVersionSelector ? <VersionSelector /> : null}
        </div>

        <div className="flex flex-1 justify-end items-center gap-4">
          <SearchBox variant="topbar" />

          {user ? <AvatarMenu email={user.email} name={user.name} /> : null}
        </div>
      </div>
    </header>
  );
}
