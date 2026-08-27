import LoginForm from "@/components/layouts/AdminLogin/LoginForm";

export default function AdminLogin() {
  return (
    <div className="w-full h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-blue-700 to-blue-500 rounded-t-2xl" />
        <div className="p-10 text-center">
          <span className="inline-flex font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500/80 text-2xl mb-6">
            EMOBase
          </span>
          <h1 className="text-xl font-display font-bold text-slate-800 tracking-tight mb-1">
            Sign in
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
            This area is restricted to authorized personnel. Sign in to
            continue.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
