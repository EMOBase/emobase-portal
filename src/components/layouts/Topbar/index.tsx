import AvatarMenu from "@/components/layouts/Topbar/AvatarMenu";
import SearchBox from "@/components/layouts/Topbar/SearchBox";

export default function Topbar({ user }: { user: { email: string; name: string } | null }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          className="font-display font-bold text-[1.35rem] tracking-tight text-slate-700"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500/80">
            EMO
          </span>
          Base
        </a>

        {/* Header Search */}
        <SearchBox />

        {user ? <AvatarMenu email={user.email} name={user.name} /> : null}
      </div>
    </header>
  );
}
