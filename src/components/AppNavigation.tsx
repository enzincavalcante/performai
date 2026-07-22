import React from "react";
import { Gem, LogOut, MessageSquare, Store, Trophy, User, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppNavigationProps { activeTab: string; onTabChange: (tab: string) => void; }

const items = [
  { id: "profile", label: "Meu desempenho", description: "Perfil, evolução e metas", icon: User },
  { id: "ranking", label: "Ranking", description: "Performance do time", icon: Trophy },
  { id: "teams", label: "Equipes", description: "Pessoas e gestão", icon: Users },
  { id: "chat", label: "Comunicação", description: "Chat e colaboração", icon: MessageSquare },
  { id: "shop", label: "Recompensas", description: "Benefícios por pontos", icon: Store },
  { id: "group_shop", label: "Recompensas do time", description: "Orçamento coletivo", icon: Store },
  { id: "gem_shop", label: "Benefícios exclusivos", description: "Catálogo premium", icon: Gem },
];

export const AppNavigation = ({ activeTab, onTabChange }: AppNavigationProps) => {
  const { signOut } = useAuth();
  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3 px-2 py-4">
        <img src={`${import.meta.env.BASE_URL}brand/performai-logo.png`} alt="" className="h-10 w-10 object-contain" />
        <div><p className="text-xl font-semibold tracking-tight text-[#0b2b68]">PerformAI</p><p className="text-xs text-slate-400">Sales performance</p></div>
      </div>
      <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto">
        {items.map(({ id, label, description, icon: Icon }) => {
          const active = activeTab === id;
          return <button key={id} onClick={() => onTabChange(id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon size={19} /></span>
            <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span><span className="block truncate text-xs text-slate-400">{description}</span></span>
          </button>;
        })}
      </nav>
      <button onClick={signOut} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><LogOut size={18} /> Sair</button>
    </aside>
  );
};
