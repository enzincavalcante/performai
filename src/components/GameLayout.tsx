import React, { useState } from "react";
import { AppNavigation } from "./AppNavigation";
import { ProfileSection } from "./ProfileSection";
import { RankingSection } from "./RankingSection";
import { ShopSection } from "./ShopSection";
import { TeamsSection } from "./TeamsSection";
import { ChatSection } from "./ChatSection";

const pageCopy: Record<string, [string, string]> = {
  profile: ["Meu desempenho", "Acompanhe sua evolução, metas e conquistas."],
  ranking: ["Ranking do time", "Compare resultados e reconheça quem está avançando."],
  teams: ["Equipes", "Organize pessoas, responsabilidades e objetivos."],
  chat: ["Comunicação", "Mantenha o contexto comercial perto de quem executa."],
  shop: ["Recompensas", "Converta performance em reconhecimento."],
  group_shop: ["Recompensas do time", "Use o orçamento coletivo para celebrar resultados."],
  gem_shop: ["Benefícios exclusivos", "Explore o catálogo premium da PerformAI."],
};

export const GameLayout = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const content = activeTab === "ranking" ? <RankingSection /> : activeTab === "teams" ? <TeamsSection /> : activeTab === "chat" ? <ChatSection /> : activeTab === "shop" ? <ShopSection /> : activeTab === "group_shop" ? <ShopSection group /> : activeTab === "gem_shop" ? <ShopSection gem /> : <ProfileSection />;
  const [title, description] = pageCopy[activeTab] ?? pageCopy.profile;

  return (
    <div className="flex min-h-screen bg-[#f6f8fc] text-slate-950">
      <AppNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="min-w-0 flex-1 overflow-auto">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-8 py-6 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Workspace Cavalcante</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </header>
        <div className="mx-auto max-w-7xl p-8">{content}</div>
      </main>
    </div>
  );
};
