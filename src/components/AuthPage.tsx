import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEMO_USER = "Cavalcante";
const DEMO_PASSWORD = "1234";

export const AuthPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (username.trim().toLowerCase() === DEMO_USER.toLowerCase() && password === DEMO_PASSWORD) {
      localStorage.setItem("performai_demo_session", "active");
      window.location.reload();
      return;
    }

    if (username.includes("@")) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });
      if (!authError) return;
    }

    setError("Usuário ou senha inválidos. Confira os dados e tente novamente.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f8ff] px-5 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(37,99,235,0.14)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#0b2b68] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}brand/performai-logo.png`} alt="" className="h-11 w-11 object-contain" />
            <span className="text-2xl font-semibold tracking-tight">PerformAI</span>
          </div>
          <div className="relative max-w-lg">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Performance comercial em um só lugar</p>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">Transforme atividade em performance previsível.</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-blue-100/80">Metas, ranking, equipes, coaching e inteligência operacional para acelerar resultados sem perder o contexto.</p>
          </div>
          <div className="relative grid grid-cols-3 gap-3 text-sm text-blue-100/75">
            <span>Visão do funil</span><span>Ritmo do time</span><span>Decisões melhores</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-7 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <img src={`${import.meta.env.BASE_URL}brand/performai-logo.png`} alt="" className="h-10 w-10 object-contain" />
              <span className="text-2xl font-semibold text-[#0b2b68]">PerformAI</span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Bem-vindo de volta</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Acesse seu workspace</h2>
            <p className="mt-3 text-slate-500">Entre com seu usuário ou e-mail corporativo.</p>

            {error && <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleAuth} className="mt-8 space-y-5">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Usuário</span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                  <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="Seu usuário ou e-mail" className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required />
                </div>
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Senha</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Sua senha" className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" required />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                </div>
              </label>
              <button type="submit" disabled={loading} className="h-14 w-full rounded-2xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60">{loading ? "Entrando..." : "Entrar na PerformAI"}</button>
            </form>
            <p className="mt-6 text-center text-xs leading-5 text-slate-400">Acesso protegido. Seus dados comerciais permanecem no seu workspace.</p>
          </div>
        </section>
      </div>
    </main>
  );
};
