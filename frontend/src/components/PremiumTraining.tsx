"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Headphones,
  Library,
  Lightbulb,
  MessageSquareText,
  Mic,
  Play,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { EnterpriseView } from "./EnterprisePlatform";
import "./premium-training.css";

type ModuleIcon = typeof BookOpen;
type TrainingModule = {
  id: string;
  number: number;
  title: string;
  description: string;
  outcome: string;
  level: string;
  hours: string;
  color: string;
  icon: ModuleIcon;
  videoId: string;
  lessons: string[];
};

type LessonQuestion = {
  difficulty: "Facil" | "Medio" | "Dificil" | "Especialista" | "Extremo";
  type: string;
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
  application: string;
};

type AssessmentState = {
  index: number;
  answers: number[];
  revealed: boolean;
  finished: boolean;
};

const EMPTY_ASSESSMENT: AssessmentState = { index: 0, answers: [], revealed: false, finished: false };

const MODULES: TrainingModule[] = [
  { id: "fundamentos", number: 1, title: "Fundamentos de Vendas", description: "Mentalidade, disciplina e processo comercial moderno.", outcome: "Construa a base comportamental de um vendedor de alta performance.", level: "Essencial", hours: "4h 20min", color: "blue", icon: Star, videoId: "4XpoIWWaja4", lessons: ["Mentalidade comercial", "Vendedores de alta performance", "Processo comercial moderno", "Perfil dos melhores vendedores", "Disciplina e consistencia"] },
  { id: "produto", number: 2, title: "Conhecimento de Produto", description: "Domine valor, beneficios e diferenciais da sua oferta.", outcome: "Apresente valor com seguranca sem cair em uma lista de funcionalidades.", level: "Essencial", hours: "3h 45min", color: "violet", icon: BriefcaseBusiness, videoId: "MPRP2eGXdFM", lessons: ["Dominio da oferta", "Caracteristica versus beneficio", "Construcao de diferenciais", "Prova e confianca", "Estudo de caso: pitch de valor"] },
  { id: "prospeccao", number: 3, title: "Prospeccao Multicanal", description: "Inbound, outbound, cold call, email, WhatsApp e LinkedIn.", outcome: "Crie abordagens relevantes e aumente respostas positivas.", level: "Intermediario", hours: "6h 10min", color: "cyan", icon: Target, videoId: "ZPSv41d-bMM", lessons: ["Inbound e velocidade no lead", "Estrategia outbound", "Cold call em 30 segundos", "Cold email que gera resposta", "WhatsApp comercial", "LinkedIn e prospeccao ativa"] },
  { id: "processo", number: 4, title: "Processo Comercial Completo", description: "Da qualificacao ao pos-venda, sem etapas perdidas.", outcome: "Conduza oportunidades com previsibilidade e controle.", level: "Intermediario", hours: "8h 30min", color: "green", icon: BarChart3, videoId: "03K40pFJ3Iw", lessons: ["Diagnostico", "Qualificacao", "Reuniao comercial", "Apresentacao da solucao", "Negociacao", "Fechamento", "Pos-venda e indicacoes"] },
  { id: "objecoes", number: 5, title: "Contorno de Objecoes", description: "Preco, tempo, concorrencia, confianca e indecisao.", outcome: "Investigue a resistencia real e responda sem perder valor.", level: "Avancado", hours: "5h 40min", color: "red", icon: MessageSquareText, videoId: "MPRP2eGXdFM", lessons: ["Diagnostico da objecao real", "Objecao de preco", "Agora nao e falta de tempo", "Comparacao com concorrentes", "Vou pensar e falta de confianca", "Laboratorio de respostas"] },
  { id: "pitch", number: 6, title: "Pitch de Vendas", description: "Pitches curtos, consultivos, SPIN e Challenger.", outcome: "Adapte sua mensagem ao canal, ao cliente e ao momento da compra.", level: "Intermediario", hours: "5h 15min", color: "orange", icon: Mic, videoId: "gwuAOJcWauc", lessons: ["Pitch de 30 segundos", "Pitch de 1 minuto", "Pitch consultivo", "Pitch SPIN", "Pitch Challenger", "Pitch para WhatsApp", "Pitch para ligacao e reuniao"] },
  { id: "fechamento", number: 7, title: "Tecnicas de Fechamento", description: "Valor, compromisso, urgencia e fechamento consultivo.", outcome: "Transforme interesse em um proximo passo objetivo e verificavel.", level: "Avancado", hours: "4h 50min", color: "blue", icon: CircleDollarSign, videoId: "gwuAOJcWauc", lessons: ["Sinais de compra", "Fechamento por valor", "Urgencia genuina", "Compromisso progressivo", "Fechamento consultivo", "Simulacao de venda complexa"] },
  { id: "crm", number: 8, title: "CRM e Pipeline", description: "Organizacao, follow-up, agenda e oportunidades.", outcome: "Use o CRM como sistema de decisao, nao como arquivo de contatos.", level: "Essencial", hours: "4h 05min", color: "violet", icon: Library, videoId: "OfzUsYZoDGE", lessons: ["Fundamentos de CRM", "Pipeline bem definido", "Cadastro e qualidade dos dados", "Follow-up e agendamento", "Controle de oportunidades", "Exercicio no CRM ficticio"] },
  { id: "comunicacao", number: 9, title: "Comunicacao Comercial", description: "Tom, persuasao, escuta, rapport e perguntas.", outcome: "Comunique com clareza, confianca e adaptacao ao cliente.", level: "Intermediario", hours: "6h", color: "cyan", icon: Headphones, videoId: "HCtZ55hL0Bc", lessons: ["Tom de voz", "Persuasao responsavel", "Escuta ativa", "Rapport profissional", "Linguagem corporal", "Perguntas inteligentes", "Comunicacao consultiva"] },
  { id: "produtividade", number: 10, title: "Produtividade Comercial", description: "Metas, planejamento, foco, tempo, habitos e disciplina.", outcome: "Crie uma rotina comercial sustentavel que protege as prioridades.", level: "Essencial", hours: "7h 25min", color: "green", icon: Zap, videoId: "40tgo5_1_LI", lessons: ["Objetivos e metas", "Planejamento semanal", "Planejamento diario", "Priorizacao comercial", "Gestao do tempo", "Procrastinacao e habitos", "Organizacao pessoal e profissional", "Rotina de alta performance"] },
  { id: "inteligencia", number: 11, title: "Inteligencia Comercial", description: "Conversao, CAC, LTV, ROI, forecast e KPIs.", outcome: "Leia os numeros e transforme dados em decisoes comerciais.", level: "Avancado", hours: "6h 35min", color: "orange", icon: Brain, videoId: "tYNk3pyyfVM", lessons: ["Metricas que importam", "Taxa de conversao", "CAC e eficiencia", "LTV e retencao", "ROI comercial", "KPIs e forecast", "Dashboard de pipeline"] },
  { id: "atendimento", number: 12, title: "Atendimento e Pos-venda", description: "Experiencia, empatia, fidelizacao e indicacoes.", outcome: "Transforme clientes em promotores e novas oportunidades.", level: "Intermediario", hours: "4h 40min", color: "red", icon: Users, videoId: "HCtZ55hL0Bc", lessons: ["Experiencia do cliente", "Atendimento consultivo", "Empatia aplicada", "Primeiro valor no pos-venda", "Fidelizacao", "Indicacoes e expansao"] },
];

const STORAGE_KEY = "performai_premium_training_progress";
const CONTINUE_MODULES = ["prospeccao", "processo", "objecoes", "fechamento"];
const DEMO_PROGRESS: Record<string, number> = { prospeccao: 75, processo: 50, objecoes: 30, fechamento: 100 };
const COURSE_META: Record<string, { duration: string; category: string }> = {
  fundamentos: { duration: "18:45", category: "Mindset" },
  produto: { duration: "21:20", category: "Comunicacao" },
  prospeccao: { duration: "18:45", category: "Prospeccao" },
  processo: { duration: "22:10", category: "Lideranca" },
  objecoes: { duration: "16:30", category: "Negociacao" },
  pitch: { duration: "19:20", category: "Comunicacao" },
  fechamento: { duration: "14:05", category: "Fechamento" },
  crm: { duration: "20:15", category: "Lideranca" },
  comunicacao: { duration: "17:40", category: "Comunicacao" },
  produtividade: { duration: "15:55", category: "Mindset" },
  inteligencia: { duration: "23:10", category: "Lideranca" },
  atendimento: { duration: "16:10", category: "Comunicacao" },
};
const TRAINING_FILTERS = ["Todos", "Prospeccao", "Negociacao", "Comunicacao", "Lideranca", "Fechamento", "Mindset"];

function lessonResource(module: TrainingModule, lessonTitle: string) {
  const focus = lessonTitle.toLowerCase();
  const lessonTechnique = focus.includes("escuta") || focus.includes("rapport") || focus.includes("empatia")
    ? "Escute sem preparar a resposta, parafraseie o que entendeu e aprofunde a frase mais importante do cliente."
    : focus.includes("qualificacao") || focus.includes("diagnostico") || focus.includes("perguntas")
      ? "Investigue contexto, problema, impacto, urgencia, decisao e recursos antes de recomendar qualquer solucao."
      : focus.includes("crm") || focus.includes("pipeline") || focus.includes("metrica") || focus.includes("forecast")
        ? "Transforme informacao em criterio de decisao: registre evidencia, proxima acao, responsavel, data e risco da oportunidade."
        : focus.includes("disciplina") || focus.includes("planejamento") || focus.includes("rotina") || focus.includes("habito")
          ? "Converta a meta em comportamento diario, bloco de agenda, indicador de execucao e revisao semanal."
          : focus.includes("beneficio") || focus.includes("diferencial") || focus.includes("prova") || focus.includes("produto")
            ? "Traduza recurso em beneficio, impacto comprovavel e evidencia relevante para o perfil do comprador."
            : null;
  const technique = lessonTechnique ?? (module.id === "objecoes" ? "Validar, investigar a causa real, responder com valor e confirmar se a resistencia foi resolvida."
    : module.id === "prospeccao" ? "Contexto, relevancia, pergunta curta e pedido de permissao para continuar."
    : module.id === "fechamento" ? "Resumir valor, confirmar criterio de decisao e combinar proximo passo com data, responsavel e pauta."
    : module.id === "pitch" ? "Problema confirmado, impacto, proposta de valor, evidencia e pergunta de validacao."
    : "Preparar o objetivo, entender o contexto, aplicar a tecnica e confirmar o entendimento do cliente.");
  const script = module.id === "objecoes" ? "Faz sentido voce avaliar isso com cuidado. Quando diz que esta caro, esta comparando com o orcamento, com outra proposta ou com o retorno esperado?"
    : module.id === "prospeccao" ? "Tenho uma hipotese sobre um gargalo comum em empresas como a sua. Posso fazer uma pergunta rapida para ver se faz sentido conversar?"
    : module.id === "fechamento" ? "Se resolvermos os pontos que voce levantou, faz sentido envolver o decisor em uma conversa de 30 minutos na quinta-feira?"
    : `Pelo que voce descreveu, ${module.outcome.toLowerCase()} Isso atende ao resultado que voce precisa agora?`;
  return {
    technique,
    script,
    concepts: [module.outcome, `Em ${lessonTitle}, o comportamento esperado e: ${technique}`, "Toda tecnica precisa ser adaptada ao contexto, sustentada por evidencia e confirmada com o cliente."],
    checklist: ["Defini o objetivo da conversa", "Entendi o contexto antes de apresentar", "Usei uma pergunta de validacao", "Registrei evidencia e proximo passo"],
    avoid: ["Repetir um roteiro sem ouvir", "Apresentar funcionalidades antes da dor", "Usar promessas sem prova", "Encerrar sem compromisso verificavel"],
    objective: `Aplicar ${lessonTitle.toLowerCase()} de forma consultiva, mensuravel e adaptada ao cliente.`,
    deepDive: `${module.outcome} Nesta aula, o conceito deixa de ser teoria: o vendedor observa sinais do cliente, escolhe a tecnica adequada, executa com naturalidade e confirma se a conversa avancou.`,
    examples: [
      `Antes de aplicar ${lessonTitle.toLowerCase()}, o vendedor confirma contexto, impacto e expectativa do comprador.`,
      `Depois da resposta, registra a evidencia, o risco e o proximo passo para nao depender da memoria.`,
    ],
    dialogue: [`Vendedor: ${script}`, "Cliente: Faz sentido. Quero entender como isso se aplica ao meu cenario.", "Vendedor: Posso fazer duas perguntas para conectar a proposta ao seu resultado?"],
    bestPractices: ["Usar as palavras e os dados apresentados pelo cliente", "Explicar o motivo da pergunta quando o tema for sensivel", "Confirmar entendimento antes de mudar de assunto", "Terminar com uma acao verificavel"],
    practice: `Escreva uma abordagem de tres etapas para aplicar ${lessonTitle.toLowerCase()} ao seu principal cliente: pergunta, argumento baseado em evidencia e confirmacao.`,
    summary: `${lessonTitle} funciona quando o vendedor prepara o objetivo, entende o contexto, executa a tecnica sem parecer decorado e mede o efeito na decisao do cliente.`,
  };
}

function buildLessonQuestions(module: TrainingModule, lessonTitle: string): LessonQuestion[] {
  const resource = lessonResource(module, lessonTitle);
  const questions = [
    {
      difficulty: "Facil",
      type: "Situacao comercial real",
      prompt: `Durante uma conversa sobre ${lessonTitle}, o cliente responde de forma vaga. Qual e a melhor proxima acao?`,
      options: ["Apresentar todas as funcionalidades", "Aprofundar com uma pergunta ligada ao impacto", "Oferecer desconto", "Encerrar e enviar um PDF"],
      correct: 1,
      explanation: `A tecnica de ${lessonTitle.toLowerCase()} exige contexto antes de recomendacao. Aprofundar evita uma resposta generica.`,
      application: "Na venda real, use a ultima frase do cliente como ponto de partida para a proxima pergunta.",
    },
    {
      difficulty: "Facil",
      type: "Identificacao de erro",
      prompt: `Qual comportamento mais prejudica a aplicacao de ${lessonTitle}?`,
      options: ["Confirmar o entendimento", resource.avoid[0], "Registrar o proximo passo", "Adaptar a linguagem ao comprador"],
      correct: 1,
      explanation: `${resource.avoid[0]} transforma uma tecnica util em um discurso mecanico e reduz a escuta.`,
      application: "Prepare pontos de apoio, mas construa a resposta usando o que o cliente acabou de dizer.",
    },
    {
      difficulty: "Facil",
      type: "Tomada de decisao",
      prompt: `O comprador pede objetividade no meio da conversa. O que voce faria ao aplicar ${lessonTitle}?`,
      options: ["Acelerar e omitir o diagnostico", "Ignorar o pedido", "Resumir o que entendeu e fazer uma pergunta decisiva", "Reiniciar o pitch"],
      correct: 2,
      explanation: "Objetividade nao significa pular o diagnostico. Um resumo curto demonstra escuta e protege a qualidade da decisao.",
      application: `Diga: "Pelo que entendi, o ponto central e X. Para aplicar ${lessonTitle.toLowerCase()}, preciso confirmar Y. Correto?"`,
    },
    {
      difficulty: "Facil",
      type: "Construcao de argumento",
      prompt: `Qual argumento demonstra melhor dominio do objetivo desta aula?`,
      options: ["Somos lideres e temos muitos recursos", module.outcome, "Nosso preco termina hoje", "Todo cliente precisa desta solucao"],
      correct: 1,
      explanation: "Um argumento profissional descreve a mudanca esperada e conecta a tecnica a um resultado, sem promessas vazias.",
      application: "Troque adjetivos por problema, impacto, evidencia e resultado esperado.",
    },
    {
      difficulty: "Facil",
      type: "Objecao do cliente",
      prompt: `O cliente diz: "nao vejo prioridade nisso agora". Qual resposta usa melhor o principio de ${lessonTitle}?`,
      options: ["Se fechar hoje, consigo desconto", "Entendo. O que precisaria acontecer para isso virar prioridade?", "Voce esta errado", "Vou mandar a proposta novamente"],
      correct: 1,
      explanation: "A pergunta valida a resistencia e investiga o criterio real, em vez de criar pressao artificial.",
      application: "Investigue evento, impacto e custo da inacao antes de defender urgencia.",
    },
    {
      difficulty: "Facil",
      type: "O que voce faria?",
      prompt: `Voce percebe que falou por dois minutos sem validar o cliente. Qual deve ser sua correcao imediata?`,
      options: ["Continuar para nao perder a linha", "Perguntar se o preco cabe no orcamento", "Resumir em uma frase e devolver a conversa ao cliente", "Encerrar a reuniao"],
      correct: 2,
      explanation: "Recuperar a escuta exige interromper o proprio monologo, sintetizar valor e convidar o cliente a reagir.",
      application: "Use uma pergunta de validacao a cada bloco importante da conversa.",
    },
    {
      difficulty: "Facil",
      type: "Aplicacao da tecnica",
      prompt: `Qual sequencia representa uma aplicacao profissional de ${lessonTitle}?`,
      options: ["Pitch, desconto, urgencia", "Contexto, tecnica, confirmacao e proximo passo", "Funcionalidades, proposta e silencio", "Historia pessoal, preco e follow-up"],
      correct: 1,
      explanation: "A sequencia conecta preparacao, execucao e confirmacao. Isso torna o comportamento observavel e repetivel.",
      application: `Use o checklist da aula antes de praticar ${lessonTitle.toLowerCase()} em uma call real.`,
    },
    {
      difficulty: "Dificil",
      type: "Boas praticas",
      prompt: "O que um vendedor de alta performance faria diferente?",
      options: [resource.bestPractices[0], "Usaria o mesmo texto em todas as conversas", "Evitaria perguntas para ganhar tempo", "Prometeria resultado sem dados"],
      correct: 0,
      explanation: `${resource.bestPractices[0]} aumenta relevancia e mostra que a recomendacao nasceu da conversa.`,
      application: "Anote duas expressoes usadas pelo cliente e reutilize-as no resumo de valor.",
    },
    {
      difficulty: "Dificil",
      type: "Analise de conversa",
      prompt: `No exemplo "${resource.script}", qual e o principal objetivo da frase?`,
      options: ["Pressionar uma decisao", "Mostrar superioridade", "Conectar contexto e validar entendimento", "Mudar de assunto"],
      correct: 2,
      explanation: "O script organiza o raciocinio e termina abrindo espaco para o cliente confirmar, corrigir ou aprofundar.",
      application: "Nao trate o script como frase decorada; substitua os campos pelo contexto verdadeiro.",
    },
    {
      difficulty: "Dificil",
      type: "Fechamento da atividade",
      prompt: `Como saber se ${lessonTitle} foi bem aplicada?`,
      options: ["O vendedor falou mais", "A reuniao ficou mais longa", "Existe evidencia de entendimento e um proximo passo coerente", "O cliente recebeu muitos materiais"],
      correct: 2,
      explanation: "Competencia comercial aparece em evidencias: entendimento confirmado, resistencia esclarecida e avancos verificaveis.",
      application: "Ao final, registre o que mudou na percepcao do cliente e qual compromisso foi assumido.",
    },
    {
      difficulty: "Dificil",
      type: "Diagnostico versus pitch",
      prompt: `O cliente demonstra interesse em ${lessonTitle}, mas ainda nao explicou impacto nem urgencia. Qual decisao preserva a qualidade da venda?`,
      options: ["Enviar a proposta imediatamente", "Apresentar um case e pedir assinatura", "Quantificar impacto, urgencia e criterio de decisao antes da recomendacao", "Oferecer um teste sem definir sucesso"],
      correct: 2,
      explanation: "Interesse nao equivale a qualificacao. Sem impacto, urgencia e criterio, a proposta nasce sem base para decisao.",
      application: "Confirme problema, impacto, urgencia, decisor e proximo passo antes de considerar a descoberta concluida.",
    },
    {
      difficulty: "Dificil",
      type: "Escuta aplicada",
      prompt: "O cliente diz que a equipe nao adere ao processo. Qual resposta demonstra escuta ativa e investigacao?",
      options: ["Nossa plataforma e muito facil de usar", "Entendi que o problema e tecnologia", "Quando voce diz falta de adesao, em qual etapa isso acontece e qual impacto gera?", "Podemos dar desconto na implantacao"],
      correct: 2,
      explanation: "A resposta reutiliza a linguagem do cliente, evita assumir a causa e abre uma investigacao observavel.",
      application: "Parafraseie a frase principal e aprofunde um termo antes de apresentar a solucao.",
    },
    {
      difficulty: "Dificil",
      type: "Protecao de margem",
      prompt: "O comprador pede 15% de desconto antes de validar valor. Qual e a resposta mais profissional?",
      options: ["Conceder 10% para manter a oportunidade", "Recusar sem explicar", "Entender a referencia de preco, retomar o impacto e negociar mediante contrapartida", "Reduzir o escopo sem avisar"],
      correct: 2,
      explanation: "Negociacao profissional separa objecao de valor, restricao de caixa e tatica de compra antes de discutir concessao.",
      application: "Toda concessao deve ter contrapartida explicita de prazo, volume, escopo ou compromisso.",
    },
    {
      difficulty: "Dificil",
      type: "Processo de decisao",
      prompt: "Seu contato gosta da proposta, mas nao assina. Qual pergunta produz o melhor mapa de decisao?",
      options: ["Voce gostou da apresentacao?", "Posso mandar o contrato?", "Alem de voce, quem valida, quais criterios usara e o que precisa ocorrer antes da assinatura?", "Qual desconto faria voce comprar?"],
      correct: 2,
      explanation: "A pergunta revela autoridade, criterios e processo, reduzindo o risco de confundir apoiador com decisor.",
      application: "Mapeie decisor economico, criterios, processo e etapa documental antes de prever fechamento.",
    },
    {
      difficulty: "Impossivel",
      type: "Caso executivo complexo",
      prompt: `Em uma negociacao sobre ${lessonTitle}, o CFO exige retorno em seis meses, o usuario teme a implantacao e o diretor quer decidir nesta semana. Qual sequencia e mais solida?`,
      options: ["Responder ao diretor e ignorar os demais", "Dar desconto para compensar o risco", "Separar criterios por stakeholder, quantificar valor, definir prova de sucesso e alinhar um processo comum", "Enviar tres propostas diferentes"],
      correct: 2,
      explanation: "Vendas complexas exigem consenso entre valor economico, risco operacional e processo de decisao.",
      application: "Crie um mapa com stakeholder, criterio, evidencia, risco e compromisso para cada envolvido.",
    },
    {
      difficulty: "Impossivel",
      type: "Inferencia comercial",
      prompt: "O lead diz que precisa pensar, participou ativamente e perguntou sobre implantacao, mas evita falar de decisao. Qual hipotese deve ser validada primeiro?",
      options: ["Ele nao tem interesse", "O preco esta alto", "Existe risco ou stakeholder nao mapeado impedindo compromisso", "Ele quer mais funcionalidades"],
      correct: 2,
      explanation: "Engajamento sem compromisso pode indicar risco percebido, criterio oculto ou processo decisorio incompleto; a hipotese precisa ser testada.",
      application: "Pergunte o que exatamente precisa ser pensado e qual pessoa, criterio ou risco ainda impede o avancar.",
    },
    {
      difficulty: "Impossivel",
      type: "Construcao de consenso",
      prompt: "Dois decisores discordam: um prioriza velocidade e outro seguranca. Como o vendedor deve conduzir?",
      options: ["Escolher o decisor mais influente", "Defender que velocidade e mais importante", "Transformar prioridades em criterios mensuraveis e construir uma validacao que proteja ambos", "Adiar sem proximo passo"],
      correct: 2,
      explanation: "O vendedor transforma interesses em criterios verificaveis e cria um caminho de decisao compartilhado.",
      application: "Proponha validacao com prazo, risco controlado, indicador de sucesso e responsavel por criterio.",
    },
    {
      difficulty: "Impossivel",
      type: "Custo da inacao",
      prompt: "O cliente reconhece a dor, mas diz que pode conviver com ela por mais um ano. Qual abordagem evita urgencia artificial?",
      options: ["Informar que o preco aumenta amanha", "Afirmar que o concorrente vai avancar", "Quantificar o custo acumulado, relacionar a um evento real e comparar agir versus manter o cenario", "Repetir os beneficios"],
      correct: 2,
      explanation: "Urgencia genuina nasce da consequencia comprovada e de um evento do negocio, nunca de pressao inventada.",
      application: "Calcule com o cliente impacto mensal, probabilidade, horizonte e evento que altera a prioridade.",
    },
    {
      difficulty: "Impossivel",
      type: "Negociacao multivariavel",
      prompt: "Para manter preco, o cliente pede prazo maior, implantacao completa e cancelamento flexivel. Qual resposta protege valor e relacao?",
      options: ["Aceitar tudo para fechar", "Negar todos os pedidos", "Priorizar interesses, calcular o custo de cada termo e trocar concessoes por compromissos equivalentes", "Reduzir preco e manter os termos"],
      correct: 2,
      explanation: "Negociacao multivariavel compara custo e valor de cada termo, permitindo trocas equivalentes sem concessao unilateral.",
      application: "Monte uma matriz de pedido, interesse, custo, alternativa e contrapartida minima.",
    },
    {
      difficulty: "Impossivel",
      type: "Decisao sob ambiguidade",
      prompt: `Nao ha dados suficientes para provar o retorno de ${lessonTitle}, mas o problema e relevante. Qual proximo passo e eticamente mais forte?`,
      options: ["Prometer o retorno medio do mercado", "Usar um case como garantia", "Propor uma validacao limitada com linha de base, criterio de sucesso e decisao posterior", "Pressionar pelo contrato anual"],
      correct: 2,
      explanation: "Quando a evidencia e insuficiente, o vendedor reduz a incerteza com um experimento mensuravel em vez de fabricar certeza.",
      application: "Defina linha de base, escopo, prazo, indicador, responsavel e regra de decisao antes do piloto.",
    },
  ] as LessonQuestion[];
  const levels: LessonQuestion["difficulty"][] = ["Facil", "Facil", "Facil", "Facil", "Medio", "Medio", "Medio", "Dificil", "Dificil", "Dificil", "Especialista", "Especialista", "Especialista", "Especialista", "Extremo", "Extremo", "Extremo", "Extremo", "Extremo", "Extremo"];
  return questions.map((question, index) => ({ ...question, difficulty: levels[index] }));
}

function prepareLessonQuestions(questions: LessonQuestion[], attempt: number) {
  const rotatedQuestions = [...questions.slice(attempt % questions.length), ...questions.slice(0, attempt % questions.length)];
  return rotatedQuestions.map((question, index) => {
    const shift = (index + attempt) % question.options.length;
    const options = [...question.options.slice(shift), ...question.options.slice(0, shift)];
    const correctText = question.options[question.correct];
    return { ...question, options, correct: options.indexOf(correctText) };
  });
}

function readProgress(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"); } catch { return {}; }
}

function LessonAssessment({
  questions,
  state,
  onChange,
  onRetry,
}: {
  questions: LessonQuestion[];
  state: AssessmentState;
  onChange: (state: AssessmentState) => void;
  onRetry: () => void;
}) {
  const score = state.answers.reduce((total, answer, index) => total + (answer === questions[index]?.correct ? 1 : 0), 0);
  const percentage = Math.round((score / questions.length) * 100);
  const performance = percentage >= 90 ? "Excelente" : percentage >= 80 ? "Aprovado" : "Ainda nao aprovado";
  const current = questions[state.index];
  const answer = state.answers[state.index];
  const difficultyScore = (difficulty: LessonQuestion["difficulty"]) => {
    const indexes = questions.map((question, index) => ({ question, index })).filter((item) => item.question.difficulty === difficulty);
    return { correct: indexes.filter((item) => state.answers[item.index] === item.question.correct).length, total: indexes.length };
  };
  useEffect(() => {
    if (!state.finished) return;
    const gaps = questions
      .map((question, index) => ({ skill: question.type, correct: state.answers[index] === question.correct }))
      .filter((item) => !item.correct)
      .map((item) => item.skill);
    window.localStorage.setItem("performai_competency_gaps", JSON.stringify({ score: percentage, gaps: [...new Set(gaps)].slice(0, 5), updatedAt: new Date().toISOString() }));
  }, [percentage, questions, state.answers, state.finished]);

  if (state.finished) {
    const mistakes = questions.map((question, index) => ({ question, index, answer: state.answers[index] })).filter((item) => item.answer !== item.question.correct);
    return <section className="lesson-assessment-result">
      <header><div><small>RESULTADO DO EXERCICIO</small><h2>{performance}</h2><p>{percentage >= 80 ? "Voce atingiu a nota minima de 80%. Revise os pontos abaixo para consolidar a aplicacao." : "A nota minima e 80%. Revise as competencias fracas e refaca uma prova com ordem e alternativas diferentes."}</p></div><strong>{percentage}<span>/100</span></strong></header>
      <div className="assessment-result-kpis"><article><span>Nota final</span><strong>{percentage}/100</strong></article>{(["Facil", "Medio", "Dificil", "Especialista", "Extremo"] as LessonQuestion["difficulty"][]).map((level) => <article key={level}><span>{level}</span><strong>{difficultyScore(level).correct}/{difficultyScore(level).total}</strong></article>)}</div>
      {mistakes.length > 0 ? <div className="assessment-review"><h3>Questoes para revisar</h3>{mistakes.map(({ question, index, answer: selectedAnswer }) => <article key={question.prompt}><span>{index + 1}</span><div><small>{question.difficulty} · Competencia: {question.type}</small><strong>{question.prompt}</strong><p className="student-error"><b>Sua resposta:</b> {question.options[selectedAnswer] ?? "Nao respondida"}</p><p><b>Resposta correta:</b> {question.options[question.correct]}</p><p><b>Erro identificado:</b> A decisao escolhida nao protegeu o diagnostico, o valor ou o proximo passo exigido pelo contexto.</p><p><b>Justificativa:</b> {question.explanation}</p><small><Lightbulb /> Recomendacao: {question.application}</small></div></article>)}</div> : <div className="assessment-perfect"><CheckCircle2 /><div><strong>Dominio completo</strong><p>Voce acertou todas as questoes e pode seguir para a proxima etapa.</p></div></div>}
      <div className="assessment-recommendation"><Target /><div><strong>Recomendacao personalizada</strong><p>{mistakes.length ? `Revise ${mistakes.slice(0, 2).map((item) => item.question.type.toLowerCase()).join(" e ")}. Depois, repita a atividade buscando justificar cada decisao com contexto, impacto e evidencia.` : "Aplique o checklist em uma conversa real nas proximas 48 horas e registre o resultado."}</p></div></div>
      <button className="assessment-restart" onClick={onRetry}>Refazer com novas alternativas</button>
    </section>;
  }

  return <section className="lesson-assessment exercise">
    <header><div><small>EXERCICIO COMPLETO · PERGUNTA {state.index + 1} DE {questions.length}</small><h2>{current.prompt}</h2><p>{current.difficulty} · {current.type}</p></div><span>{Math.round((state.answers.length / questions.length) * 100)}%</span></header>
    <div className="assessment-progress"><i style={{ width: `${(state.answers.length / questions.length) * 100}%` }} /><span>{state.answers.length} de {questions.length} respondidas</span></div>
    <div className="assessment-options">{current.options.map((option, index) => <button className={state.revealed ? index === current.correct ? "correct" : answer === index ? "wrong" : "" : ""} disabled={state.revealed} onClick={() => onChange({ ...state, answers: [...state.answers.slice(0, state.index), index], revealed: true })} key={option}><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong></button>)}</div>
    {state.revealed && <div className={`assessment-feedback ${answer === current.correct ? "correct" : "wrong"}`}>{answer === current.correct ? <CheckCircle2 /> : <Target />}<div><strong>{answer === current.correct ? "Resposta correta" : "Resposta incorreta"}</strong>{answer !== current.correct && <p><b>Resposta correta:</b> {current.options[current.correct]}</p>}<p>{current.explanation}</p><small><Lightbulb /> Por que e melhor na venda real: {current.application}</small></div></div>}
    <footer><span>Nota parcial: {score}/{Math.max(1, state.answers.length)} acertos</span><button disabled={!state.revealed} onClick={() => state.index === questions.length - 1 ? onChange({ ...state, finished: true }) : onChange({ ...state, index: state.index + 1, revealed: false })}>{state.index === questions.length - 1 ? "Ver resultado" : "Proxima pergunta"}<ArrowRight /></button></footer>
  </section>;
}

export function PremiumTrainingAcademy({ onNavigate }: { onNavigate: (view: EnterpriseView) => void }) {
  const [selected, setSelected] = useState<TrainingModule | null>(null);
  const [lesson, setLesson] = useState(0);
  const [panel, setPanel] = useState<"content" | "exercise" | "mentor">("content");
  const [filter, setFilter] = useState("Todos");
  const [progress, setProgress] = useState<Record<string, number[]>>({});
  const [exerciseState, setExerciseState] = useState<AssessmentState>(EMPTY_ASSESSMENT);
  const [exerciseAttempt, setExerciseAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [resourceView, setResourceView] = useState<"material" | "summary" | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setProgress(readProgress());
      const savedFocus = localStorage.getItem("performai_training_focus");
      if (savedFocus) {
        try {
          const focus = JSON.parse(savedFocus) as { moduleId?: string; lesson?: string };
          const focusedModule = MODULES.find((module) => module.id === focus.moduleId);
          if (focusedModule) { setSelected(focusedModule); setLesson(Math.max(0, focusedModule.lessons.findIndex((item) => item === focus.lesson))); setPanel("content"); }
        } catch {
          const focusedModule = MODULES.find((module) => module.id === savedFocus);
          if (focusedModule) { setSelected(focusedModule); setLesson(0); setPanel("content"); }
        }
        localStorage.removeItem("performai_training_focus");
      }
    });
  }, []);
  const saveProgress = (next: Record<string, number[]>) => { setProgress(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const moduleProgress = (module: TrainingModule) => Math.round(((progress[module.id]?.length ?? 0) / module.lessons.length) * 100);
  const completedLessons = Object.values(progress).reduce((total, items) => total + items.length, 0);
  const totalLessons = MODULES.reduce((total, module) => total + module.lessons.length, 0);
  const overall = Math.round(completedLessons / totalLessons * 100);
  const visible = useMemo(() => MODULES.filter((module) => filter === "Todos" || COURSE_META[module.id]?.category === filter), [filter]);

  const resetActivities = () => {
    setExerciseState(EMPTY_ASSESSMENT);
  };
  const openModule = (module: TrainingModule) => { setSelected(module); setLesson(0); setPanel("content"); resetActivities(); setResourceView(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const markLesson = () => {
    if (!selected) return;
    const completed = new Set(progress[selected.id] ?? []); completed.add(lesson);
    saveProgress({ ...progress, [selected.id]: [...completed] });
    setNotice("Aula concluida e registrada no seu historico profissional.");
    window.setTimeout(() => setNotice(""), 2800);
    if (lesson < selected.lessons.length - 1) { setLesson(lesson + 1); setPanel("content"); resetActivities(); }
  };
  const downloadMaterial = () => {
    if (!selected) return;
    const resource = lessonResource(selected, selected.lessons[lesson]);
    const content = `PERFORMA AI - MATERIAL PROFISSIONAL\n\nMODULO: ${selected.title}\nAULA: ${selected.lessons[lesson]}\n\nOBJETIVO DA AULA\n${resource.objective}\n\nO QUE O VENDEDOR APRENDERA\n${selected.outcome}\n\nCONTEUDO PRINCIPAL\n${resource.deepDive}\n\nCONCEITOS IMPORTANTES\n${resource.concepts.map((item) => `- ${item}`).join("\n")}\n\nTECNICA\n${resource.technique}\n\nEXEMPLOS\n${resource.examples.map((item) => `- ${item}`).join("\n")}\n\nEXEMPLO DE CONVERSA\n${resource.dialogue.join("\n")}\n\nERROS COMUNS\n${resource.avoid.map((item) => `- ${item}`).join("\n")}\n\nBOAS PRATICAS\n${resource.bestPractices.map((item) => `- ${item}`).join("\n")}\n\nCHECKLIST\n${resource.checklist.map((item) => `[ ] ${item}`).join("\n")}\n\nEXERCICIO PRATICO\n${resource.practice}\n\nRESUMO\n${resource.summary}`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${selected.id}-aula-${lesson + 1}-material.txt`; link.click(); URL.revokeObjectURL(url);
  };

  if (selected) {
    const Icon = selected.icon;
    const completed = progress[selected.id]?.includes(lesson) ?? false;
    const percent = moduleProgress(selected);
    const resource = lessonResource(selected, selected.lessons[lesson]);
    const exerciseQuestions = prepareLessonQuestions(buildLessonQuestions(selected, selected.lessons[lesson]), exerciseAttempt);
    return <div className="premium-academy lesson-workspace">
      {notice && <div className="academy-toast"><Award /> {notice}</div>}
      {resourceView && <div className="lesson-resource-backdrop" role="presentation" onClick={() => setResourceView(null)}><article className="lesson-resource-modal" role="dialog" aria-modal="true" aria-label={resourceView === "material" ? "Material da aula" : "Resumo pratico"} onClick={(event) => event.stopPropagation()}><header><div><small>{resourceView === "material" ? "MATERIAL PROFISSIONAL" : "RESUMO PRATICO"}</small><h2>{selected.lessons[lesson]}</h2><p>{selected.title}</p></div><button onClick={() => setResourceView(null)} aria-label="Fechar"><X /></button></header>{resourceView === "material" ? <div className="lesson-resource-body professional"><section className="resource-wide"><h3>Objetivo da aula</h3><p>{resource.objective}</p></section><section className="resource-wide"><h3>O que o vendedor aprendera</h3><p>{selected.outcome}</p></section><section className="resource-wide"><h3>Conteudo principal</h3><p>{resource.deepDive}</p></section><section><h3>Conceitos fundamentais</h3><ul>{resource.concepts.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Tecnica comercial</h3><p>{resource.technique}</p></section><section><h3>Exemplos de aplicacao</h3><ul>{resource.examples.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="resource-script"><h3>Exemplo de conversa</h3><blockquote>{resource.dialogue.map((line) => <span key={line}>{line}</span>)}</blockquote></section><section><h3>Erros comuns</h3><ul>{resource.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Boas praticas</h3><ul>{resource.bestPractices.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Checklist de campo</h3><ul>{resource.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Exercicio pratico</h3><p>{resource.practice}</p></section><section className="resource-wide"><h3>Resumo da aula</h3><p>{resource.summary}</p></section></div> : <div className="lesson-resource-body summary"><section><h3>O que foi ensinado</h3><p>{selected.outcome}</p></section><section><h3>Pontos principais</h3><ul>{resource.concepts.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>O que fazer</h3><ul>{resource.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>O que evitar e erros comuns</h3><ul>{resource.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Exemplo melhor</h3><blockquote>{resource.script}</blockquote></section><section><h3>Proximo passo recomendado</h3><p>Pratique esta situacao no Treino de Vendas IA, conclua o quiz e aplique a tecnica em uma conversa real nas proximas 48 horas.</p></section></div>}<footer><button onClick={downloadMaterial}><Download /> Baixar material</button><button onClick={() => { setResourceView(null); onNavigate("simulation"); }}><Mic /> Praticar agora</button></footer></article></div>}
      <header className="lesson-topbar"><button onClick={() => setSelected(null)}><ArrowLeft /> Voltar para trilhas</button><div><span>{selected.title}</span><strong>{percent}% concluido</strong><i><b style={{ width: `${percent}%` }} /></i></div></header>
      <section className="lesson-hero"><div className={`academy-icon ${selected.color}`}><Icon /></div><div><small>MODULO {selected.number} · AULA {lesson + 1} DE {selected.lessons.length}</small><h1>{selected.lessons[lesson]}</h1><p>{selected.outcome}</p></div><aside><span><Clock3 /> 35 minutos</span><span><Star /> Evidencia pratica</span><span><Trophy /> Avaliacao ao final</span></aside></section>
      <nav className="lesson-tabs"><button className={panel === "content" ? "active" : ""} onClick={() => setPanel("content")}><Play /> Aula</button><button className={panel === "exercise" ? "active" : ""} onClick={() => setPanel("exercise")}><Target /> Exercicio · 20 questoes</button><button className={panel === "mentor" ? "active" : ""} onClick={() => setPanel("mentor")}><Sparkles /> Tirar duvidas</button></nav>
      <div className="lesson-layout">
        <main>
          {panel === "content" && <div className="lesson-content"><div className="academy-video"><iframe src={`https://www.youtube-nocookie.com/embed/${selected.videoId}`} title={selected.lessons[lesson]} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><section><small>CONCEITO APLICADO</small><h2>O que voce precisa dominar</h2><p>{selected.outcome} Nesta aula, voce aprende o conceito, reconhece os erros mais comuns e transforma o conhecimento em uma acao observavel na rotina comercial.</p><div className="lesson-summary"><Lightbulb /><span><strong>Resumo executivo</strong><p>Use o metodo em uma situacao real, confirme o entendimento do cliente e registre o resultado. Conhecimento comercial so vira competencia quando aparece no comportamento.</p></span></div><h3>Aplicacao em campo</h3><ol><li>Prepare o objetivo antes da conversa.</li><li>Use uma pergunta para validar o contexto.</li><li>Aplique a tecnica sem parecer decorado.</li><li>Registre o que funcionou e o que precisa mudar.</li></ol></section></div>}
          {panel === "exercise" && <LessonAssessment questions={exerciseQuestions} state={exerciseState} onChange={setExerciseState} onRetry={() => { setExerciseAttempt((value) => value + 1); setExerciseState(EMPTY_ASSESSMENT); }} />}
          {panel === "mentor" && <section className="lesson-mentor"><BotFace /><div><small>COACH COMERCIAL COM CONTEXTO</small><h2>Tire duvidas sobre {selected.lessons[lesson]}</h2><p>O Coach Comercial ajuda a aplicar o conteudo em uma situacao real, explica o motivo das recomendacoes e continua a conversa com voce.</p><div>{["Explique com outro exemplo", "Corrija minha abordagem", "Mostre os erros comuns", "Prepare uma conversa real"].map((item) => <button onClick={() => onNavigate("coach")} key={item}>{item}<ChevronRight /></button>)}</div><button className="mentor-main" onClick={() => onNavigate("coach")}><Sparkles /> Abrir Coach Comercial</button></div></section>}
        </main>
        <aside className="lesson-sidebar"><header><small>CONTEUDO DO MODULO</small><h2>{selected.lessons.length} aulas</h2></header>{selected.lessons.map((item, index) => <button className={lesson === index ? "active" : progress[selected.id]?.includes(index) ? "completed" : ""} onClick={() => { setLesson(index); setPanel("content"); resetActivities(); setResourceView(null); }} key={item}><span>{progress[selected.id]?.includes(index) ? <Check /> : index + 1}</span><div><strong>{item}</strong><small>{progress[selected.id]?.includes(index) ? "Concluida · revisar" : "35 min · pratica aplicada"}</small></div><ChevronRight /></button>)}<div className="lesson-tools"><button onClick={() => setResourceView("material")}><BookOpen /> Material da aula</button><button onClick={() => setResourceView("summary")}><Lightbulb /> Resumo pratico</button><button onClick={downloadMaterial}><Download /> Baixar material</button><button onClick={() => setPanel("exercise")}><Target /> Exercicio de 20 questoes</button></div></aside>
      </div>
      <footer className="lesson-footer"><div>{completed ? <><CheckCircle2 /><span><strong>Aula concluida</strong><small>Voce pode revisar e refazer as atividades quando quiser.</small></span></> : <><Target /><span><strong>Conclua sua jornada</strong><small>Assista, pratique e valide o conhecimento.</small></span></>}</div><button onClick={markLesson}>{completed ? "Continuar evolucao" : "Concluir aula"}<ArrowRight /></button></footer>
    </div>;
  }

  const displayedOverall = overall || 68;
  const displayedLessons = completedLessons || 24;
  const displayedTotalLessons = completedLessons ? totalLessons : 35;
  const nextModule = MODULES.find((module) => moduleProgress(module) < 100) ?? MODULES[0];
  const courseProgress = (module: TrainingModule) => moduleProgress(module) || DEMO_PROGRESS[module.id] || 0;
  const continueModules = CONTINUE_MODULES.map((id) => MODULES.find((module) => module.id === id)).filter((module): module is TrainingModule => Boolean(module));
  const thumbnailStyle = (module: TrainingModule): CSSProperties => ({ backgroundPosition: `${((module.number - 1) % 4) * 33.333}% 38%` });

  const CourseCard = ({ module, featured = false }: { module: TrainingModule; featured?: boolean }) => {
    const percent = courseProgress(module);
    return <button className={`sales-course-card ${featured ? "featured" : ""}`} onClick={() => openModule(module)}>
      <div className="sales-course-thumb" style={thumbnailStyle(module)}>
        <span className="sales-course-play"><Play /></span>
        <em>{COURSE_META[module.id]?.duration ?? "18:30"}</em>
      </div>
      <div className="sales-course-copy"><h3>{featured ? ({ prospeccao: "Prospeccao ativa: tecnicas que realmente funcionam", processo: "Como conduzir reunioes comerciais de alta conversao", objecoes: "Tratamento de objecoes: supere resistencias", fechamento: "Tecnicas de fechamento que aumentam resultados" }[module.id] ?? module.title) : module.title}</h3><p>{module.description}</p></div>
      <footer><i><b style={{ width: `${percent}%` }} /></i><span>{percent ? `${percent}% concluido` : "Comecar agora"}</span>{percent === 100 && <CheckCircle2 />}</footer>
    </button>;
  };

  return <div className="premium-academy sales-training-academy">
    <section className="sales-training-hero">
      <Image src="/brand/training-academy-hero-v2.png" alt="Especialista comercial estudando no notebook" fill priority sizes="(max-width: 900px) 100vw, 1200px" />
      <div className="sales-training-hero-shade" />
      <div className="sales-training-copy">
        <span className="sales-training-breadcrumb"><Play /> Treinamento <ChevronRight /> Videos</span>
        <h1>Aprenda. Pratique.<br /><strong>Evolua</strong> todos os dias.</h1>
        <p>Conteudos em video com especialistas para voce dominar tecnicas, estrategias e habilidades que geram resultados.</p>
        <div><button onClick={() => openModule(nextModule)}><Play /> Continuar assistindo</button><button onClick={() => document.getElementById("meu-progresso")?.scrollIntoView({ behavior: "smooth" })}>Ver meu progresso <ArrowRight /></button></div>
      </div>
      <aside className="sales-progress-card" id="meu-progresso"><header><BarChart3 /><span>Seu progresso<strong>{displayedOverall}%</strong></span></header><i><b style={{ width: `${displayedOverall}%` }} /></i><dl><div><dt>Tempo total</dt><dd>{completedLessons ? `${Math.max(1, Math.floor(completedLessons * .58))}h ${completedLessons % 2 ? "35" : "10"}m` : "15h 42m"}</dd></div><div><dt>Videos concluidos</dt><dd>{displayedLessons} de {displayedTotalLessons}</dd></div></dl></aside>
    </section>

    <section className="training-shelf continue-shelf"><header><h2>Continue de onde parou</h2><button onClick={() => setFilter("Todos")}>Ver todos</button></header><div className="training-video-row">{continueModules.map((module) => <CourseCard module={module} featured key={module.id} />)}</div></section>

    <section className="training-shelf recommended-shelf"><header><h2>Recomendados para voce</h2><button onClick={() => setFilter("Todos")}>Ver todos</button></header><nav aria-label="Filtrar treinamentos">{TRAINING_FILTERS.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</nav><div className="training-video-grid">{visible.map((module) => <CourseCard module={module} key={module.id} />)}</div></section>

    <section className="sales-training-footer"><div><Award /><span><small>CERTIFICACAO PERFORMA AI</small><strong>Transforme aprendizado em competencia comprovada.</strong><p>Conclua as aulas, exercicios e avaliacoes para avancar na sua jornada profissional.</p></span></div><button onClick={() => onNavigate("certificates")}>Ver certificados <ArrowRight /></button></section>
  </div>;
}

function BotFace() { return <div className="bot-face"><Brain /><i /></div>; }
