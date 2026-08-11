export type CoachIntent = "incomplete" | "greeting" | "casual" | "definition" | "teaching" | "clarification" | "example" | "analysis" | "creation" | "continuation" | "problem" | "practice" | "practice_answer" | "question" | "unknown";

export type CoachContext = { product?: string; customer?: string; stage?: string; objective?: string };
export type CoachHistoryItem = { role?: string; text?: string };
export type CoachMemory = {
  difficulties?: string[];
  topics?: string[];
  examples?: string[];
  decisions?: string[];
  activePractice?: { topic: string; round: number } | null;
};

export type CoachLayer = {
  direct: string;
  hypotheses: string[];
  reasoning: string;
  action: string;
  question: string;
  options: string[];
  next: string[];
  intent: CoachIntent;
  decisionRequired: boolean;
  memory: CoachMemory;
  feedback?: { good: string; missing: string; improved: string };
};

type Topic = {
  id: string;
  label: string;
  aliases: RegExp;
  definition: string;
  principle: string;
  application: string;
  example: string;
  mistake: string;
};

const TOPICS: Topic[] = [
  { id: "pitch", label: "pitch de valor", aliases: /pitch|apresenta(c|ç)ao|proposta de valor|demonstracao/, definition: "Pitch e uma explicacao curta que conecta um problema relevante a uma mudanca concreta e da ao cliente um motivo para continuar a conversa.", principle: "O cliente precisa reconhecer o proprio contexto antes de ouvir a solucao. Estruture em problema, impacto, mudanca, evidencia e validacao.", application: "Comece pelo que o cliente confirmou, traduza a oferta em resultado operacional e termine validando se aquela mudanca importa para ele.", example: "Pelo que voce descreveu, [problema] esta causando [impacto]. Nossa solucao muda [processo] para gerar [resultado verificavel]. Isso atende ao criterio mais importante para voces?", mistake: "Abrir com historia da empresa, lista de funcionalidades ou promessas que nao nasceram da descoberta." },
  { id: "spin", label: "SPIN Selling", aliases: /spin/, definition: "SPIN e uma estrutura de discovery com perguntas de Situacao, Problema, Implicacao e Necessidade de solucao.", principle: "As perguntas de implicacao tornam visivel o custo de manter o problema; as de necessidade ajudam o cliente a verbalizar o valor da mudanca.", application: "Use poucas perguntas de situacao, aprofunde o problema, quantifique consequencias e so depois explore o resultado desejado.", example: "Como fazem hoje? Onde trava? O que isso provoca no resultado? Se resolvessem, o que mudaria na operacao?", mistake: "Transformar SPIN em interrogatorio ou fazer perguntas de implicacao sem escutar a resposta anterior." },
  { id: "bant", label: "BANT", aliases: /bant/, definition: "BANT organiza quatro dimensoes de qualificacao: Budget, Authority, Need e Timeline, ou orcamento, autoridade, necessidade e prazo.", principle: "Ele serve para medir condicoes de compra, nao para eliminar um lead cedo demais. Em vendas complexas, investigue como cada dimensao sera construida.", application: "Descubra impacto e prioridade antes de pressionar por orcamento; mapeie quem decide, como decide e qual evento cria prazo real.", example: "Alem de voce, quem participa desta decisao? Existe um investimento previsto? O que precisa acontecer e ate quando?", mistake: "Perguntar se ha orcamento antes de construir necessidade e parecer um formulario de qualificacao." },
  { id: "rapport", label: "rapport", aliases: /rapport|conexao|quebrar o gelo/, definition: "Rapport e a construcao de confianca e sintonia suficiente para uma conversa franca; nao e conversa fiada nem imitacao artificial.", principle: "Conexao nasce de preparo, curiosidade genuina, escuta e adaptacao ao ritmo do cliente.", application: "Use um contexto real, confirme o objetivo da reuniao e demonstre que entendeu o negocio sem fingir intimidade.", example: "Vi que voces expandiram a operacao recentemente. Isso mudou a prioridade do time comercial ou a reuniao de hoje esta ligada a outro ponto?", mistake: "Forcar assunto pessoal, prolongar a abertura ou confundir simpatia com credibilidade." },
  { id: "objections", label: "tratamento de objecoes", aliases: /objec|caro|preco|desconto|concorrente|pensar|sem verba/, definition: "Objeção e uma resistencia que precisa ser diagnosticada antes de ser respondida. A fala declarada nem sempre e a causa real.", principle: "Valide a preocupacao, esclareca a causa, responda com evidencia e confirme se o ponto foi resolvido.", application: "Separe falta de verba, comparacao, baixa prioridade, risco e valor pouco claro. Cada causa exige uma resposta diferente.", example: "Quando voce diz que esta caro, esta comparando com o orcamento disponivel, com outra alternativa ou com o retorno que ainda nao ficou claro?", mistake: "Dar desconto ou defender o produto antes de descobrir o significado da objecao." },
  { id: "prospecting", label: "prospeccao", aliases: /prospec|outbound|cold call|cadencia|abordagem|leads/, definition: "Prospeccao e o processo de iniciar conversas relevantes com contas que possuem potencial de problema, prioridade e aderencia.", principle: "Relevancia vem de um sinal observavel ligado a uma hipotese honesta, nao de personalizacao superficial.", application: "Defina ICP, escolha sinais de prioridade, conecte-os a um problema plausivel e faca um convite pequeno para investigar.", example: "Vi [sinal real]. Costumo falar com [perfil] quando isso gera [problema]. Posso fazer duas perguntas para entender se existe relacao com o momento de voces?", mistake: "Falar da propria empresa no primeiro paragrafo ou usar urgencia falsa para conseguir resposta." },
  { id: "discovery", label: "discovery", aliases: /discovery|descoberta|diagnostico|dor|qualifica|necessidade/, definition: "Discovery e a investigacao conjunta do contexto, problema, impacto, prioridade, processo de decisao e resultado esperado.", principle: "A profundidade vale mais que a quantidade de perguntas. Cada pergunta deve nascer da resposta anterior.", application: "Mapeie processo atual, friccao, consequencia, urgencia, decisores, criterios e proximo passo antes de apresentar.", example: "Como funciona hoje? Onde mais trava? Qual impacto isso gera? Quem sente esse impacto? O que faria esse tema virar prioridade?", mistake: "Seguir um roteiro sem aprofundar ou aceitar uma dor generica como diagnostico suficiente." },
  { id: "followup", label: "follow-up", aliases: /follow.?up|nao responde|sumiu|retorno|cobrar resposta/, definition: "Follow-up e a continuidade de uma decisao comercial, com contexto, valor e uma acao clara.", principle: "O cliente responde melhor quando a mensagem reduz esforco e ajuda a decidir, em vez de apenas cobrar retorno.", application: "Retome o ponto relevante, acrescente evidencia ou clareza e proponha uma decisao simples com prazo real.", example: "Na conversa voce destacou [prioridade]. Separei [evidencia] para avaliar esse ponto. Faz sentido avancarmos na terca ou prefere encerrar este tema agora?", mistake: "Enviar 'so passando para saber' sem contexto, valor ou proximo passo." },
  { id: "closing", label: "fechamento", aliases: /fechamento|fechar|assinar|contrato|proximo passo/, definition: "Fechamento e a confirmacao de uma decisao construida ao longo da venda, nao uma tecnica isolada aplicada nos ultimos minutos.", principle: "Problema, valor, criterios, decisores, risco e prazo precisam estar claros antes do pedido de compromisso.", application: "Resuma o que foi confirmado, exponha pendencias e proponha uma acao com responsavel, data e objetivo.", example: "Confirmamos [problema], [impacto] e [criterio]. O que ainda impediria avancarmos para [acao] ate [data]?", mistake: "Criar pressao artificial ou encerrar com 'qualquer coisa me avise'." },
  { id: "negotiation", label: "negociacao", aliases: /negocia|margem|concessao|condi(c|ç)ao/, definition: "Negociacao e a troca estruturada de valor, risco, prazo e condicoes entre partes com interesses diferentes.", principle: "Toda concessao deve ter motivo, limite e contrapartida. Preco nao pode ser discutido separado de escopo, risco e resultado.", application: "Mapeie interesses, defina limites e troque concessoes: se houver movimento de um lado, combine um compromisso do outro.", example: "Consigo avaliar essa condicao se ajustarmos prazo de contrato e data de decisao. Faz sentido construir nesses termos?", mistake: "Conceder desconto para aliviar tensao sem receber compromisso ou reduzir escopo." },
  { id: "pipeline", label: "pipeline e forecast", aliases: /pipeline|funil|forecast|crm|conversao|meta|indicador/, definition: "Pipeline representa oportunidades por etapa; forecast estima receita futura usando evidencia de progresso, nao apenas opiniao do vendedor.", principle: "Etapas precisam de criterios de entrada e saida observaveis. Volume sem qualidade cria previsao falsa.", application: "Meça conversao, tempo, aging, proximo passo e motivo de perda por etapa; revise a restricao antes de aumentar atividade.", example: "Uma proposta so avanca quando problema, decisor, criterio, prazo e proximo passo estao registrados e confirmados.", mistake: "Manter oportunidades antigas para proteger o numero do pipeline ou confundir atividade com progresso." },
  { id: "retention", label: "retencao e expansao", aliases: /retencao|churn|upsell|cross.?sell|pos.?venda/, definition: "Retencao preserva o valor entregue; expansao aumenta a relacao quando novos resultados justificam mais escopo.", principle: "Upsell sustentavel nasce de adocao, resultado comprovado e nova necessidade, nao de oferta precoce.", application: "Monitore marcos de valor, risco de uso, objetivos do cliente e oportunidades de ampliar resultado.", example: "Desde a implantacao, qual resultado evoluiu e qual gargalo passou a limitar o proximo nivel?", mistake: "Oferecer modulo adicional antes de comprovar valor no contrato atual." },
];

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const unique = (items: string[], limit = 8) => [...new Set(items.filter(Boolean))].slice(-limit);
const emptyMemory = (memory?: CoachMemory): CoachMemory => ({ difficulties: memory?.difficulties ?? [], topics: memory?.topics ?? [], examples: memory?.examples ?? [], decisions: memory?.decisions ?? [], activePractice: memory?.activePractice ?? null });
const simpleLayer = (direct: string, intent: CoachIntent, memory?: CoachMemory): CoachLayer => ({ direct, intent, hypotheses: [], reasoning: "", action: "", question: "", options: [], next: [], decisionRequired: false, memory: emptyMemory(memory) });

function topicsIn(message: string) {
  const text = normalize(message);
  return TOPICS.filter((topic) => topic.aliases.test(text));
}

function looksIncomplete(message: string) {
  const text = normalize(message);
  const compact = text.replace(/[^a-z0-9]/g, "");
  if (!compact || /^(.)\1{3,}$/.test(compact)) return true;
  if (/^(oi|ola|sim|nao|ok|crm|icp|sdr|bdr|b2b|b2c)$/.test(compact)) return false;
  if (topicsIn(text).length) return false;
  if (compact.length <= 2) return true;
  if (compact.length >= 4 && !/[aeiouy]/.test(compact) && !/^(spin|bant|meddic)$/.test(compact)) return true;
  return false;
}

export function classifyCoachIntent(message: string, history: CoachHistoryItem[] = [], memory?: CoachMemory): CoachIntent {
  const text = normalize(message).replace(/[!,.?]+$/g, "");
  if (looksIncomplete(text)) return "incomplete";
  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|fala|opa)$/.test(text)) return "greeting";
  if (/^(tudo bem|como voce esta|como vc ta|suave|beleza|valeu|obrigad[oa])$/.test(text)) return "casual";
  if (memory?.activePractice && !/(parar|encerrar|cancelar)/.test(text)) return "practice_answer";
  const lastCoach = [...history].reverse().find((item) => item.role === "coach")?.text ?? "";
  if (/^(sim|vamos|quero|bora|pode ser)$/.test(text) && /pratic|simula|papel do cliente|testar/.test(normalize(lastCoach))) return "practice";
  if (/nao entendi|explica de outro jeito|mais simples|pode explicar melhor|nao ficou claro/.test(text)) return "clarification";
  if (/^(mas|e se|so que|nesse caso|e quando|depois|agora|entao)/.test(text)) return "continuation";
  if (/me (da|de|mostra)|quero um exemplo|outro exemplo|exemplo de|como ficaria/.test(text)) return "example";
  if (/analisa|avalia|corrige|o que acha|meu pitch|meu script|minha mensagem/.test(text) && message.length > 35) return "analysis";
  if (/cria|crie|monte|monta|escreva|construa|faz um|faca um/.test(text)) return "creation";
  if (/^(o que e|oque e|o que significa|defina|qual a diferenca)/.test(text)) return "definition";
  if (/me ensina|me explica|explique|quero aprender|como aplicar|explica.*como|aula/.test(text)) return "teaching";
  if (/\bpraticar\b|\bpratica\b|quero treinar|faz o papel|simula/.test(text)) return "practice";
  if (/dificuldade|nao consigo|travando|problema|ruim|perco|preciso melhorar/.test(text)) return "problem";
  if (/^(como|por que|porque|qual|quando|onde|quem)|\?$/.test(text)) return "question";
  if (topicsIn(text).length && text.split(/\s+/).length <= 4) return "teaching";
  return "unknown";
}

function contextualExample(topic: Topic, context: CoachContext) {
  const offer = context.product?.trim();
  const audience = context.customer?.trim();
  if (!offer && !audience) return topic.example;
  const prefix = audience ? `Pensando em ${audience}` : "Pensando no seu cliente";
  const suffix = offer ? ` Aplique isso sem listar recursos de ${offer}; conecte a oferta ao resultado confirmado.` : "";
  return `${prefix}: ${topic.example}${suffix}`;
}

function startPractice(topic: Topic, context: CoachContext, memory: CoachMemory): CoachLayer {
  const offer = context.product || "sua solucao";
  const audience = context.customer || "um potencial cliente";
  const objections: Record<string, string> = {
    objections: `Eu entendi a proposta, mas sinceramente achei ${offer} caro e o concorrente cobra menos. Por que eu deveria pagar mais?`,
    pitch: `Tenho pouco tempo. Me explica em menos de 40 segundos por que ${offer} seria relevante para ${audience}.`,
    prospecting: "Eu nao pedi esse contato e estou entrando em uma reuniao. Por que eu deveria continuar ouvindo?",
    discovery: "Nosso processo funciona razoavelmente bem. Nao vejo um problema urgente para mudar agora.",
    closing: "Gostei, mas ainda nao estou pronto para decidir. Me manda a proposta e eu vejo depois.",
    negotiation: "Se voce der 25% de desconto, eu assino hoje. Caso contrario, vou seguir com outra empresa.",
  };
  return {
    direct: objections[topic.id] || `Vamos praticar ${topic.label}. Eu serei o cliente: "Nao tenho certeza se isso faz sentido para nossa empresa agora."`,
    reasoning: "Responda como falaria em uma call real. Eu vou avaliar clareza, escuta, diagnostico, valor e proximo passo.",
    action: "Nao explique sua estrategia antes. Escreva apenas a resposta que daria ao cliente.",
    question: "Qual seria sua resposta?",
    options: [], hypotheses: [], next: [], intent: "practice", decisionRequired: false,
    memory: { ...memory, activePractice: { topic: topic.id, round: (memory.activePractice?.round ?? 0) + 1 }, topics: unique([...(memory.topics ?? []), topic.label]) },
  };
}

function evaluatePractice(message: string, topic: Topic, context: CoachContext, memory: CoachMemory): CoachLayer {
  const text = normalize(message);
  const hasQuestion = /\?/.test(message) || /^(como|quando|qual|o que)/.test(text);
  const investigates = /quando|compar|orcamento|retorno|impacto|prioridade|motivo|criterio|entender/.test(text);
  const hasValue = /resultado|impacto|valor|econom|receita|tempo|risco|processo|conversao/.test(text);
  const avoidsPrematureDiscount = !/desconto|reduz(ir|o)|abaix(ar|o).*preco|melhorar.*condicao/.test(text);
  const goodParts = [hasQuestion && "voce manteve a conversa aberta", investigates && "investigou antes de argumentar", hasValue && "conectou a resposta a valor", avoidsPrematureDiscount && "protegeu preco e margem"].filter(Boolean) as string[];
  const missing = [!hasQuestion && "terminar com uma pergunta que avance o diagnostico", !investigates && "descobrir a causa real antes de responder", !hasValue && "ligar a resposta ao impacto do cliente", !avoidsPrematureDiscount && "evitar concessao antes de uma contrapartida"].filter(Boolean) as string[];
  const audience = context.customer || "o cliente";
  const improved = topic.id === "objections" ? `Faz sentido comparar. Quando voce diz que esta caro, esta olhando o orcamento disponivel, outra proposta ou o retorno que ainda nao ficou claro? A partir disso eu consigo mostrar se existe valor real para ${audience}, sem defender preco no escuro.` : `Antes de te responder de forma generica, quero entender um ponto: qual resultado e mais importante para ${audience} nessa decisao e o que acontece se o processo continuar como esta?`;
  const score = Math.max(3, Math.min(10, Math.round(3 + 1.75 * (Number(hasQuestion) + Number(investigates) + Number(hasValue) + Number(avoidsPrematureDiscount)))));
  return {
    direct: `Sua resposta ficou em ${score}/10. ${goodParts.length ? `O melhor ponto foi que ${goodParts[0]}.` : "Ela tentou responder, mas ainda pulou cedo demais para a argumentacao."}`,
    reasoning: `Pontos positivos: ${goodParts.join(", ") || "a resposta manteve um tom profissional"}. O principal ajuste e ${missing[0] || "deixar a pergunta mais especifica para obter compromisso"}.`,
    action: "Compare sua resposta com a versao sugerida e tente novamente usando suas proprias palavras, sem decorar.",
    question: "Como voce quer continuar esta pratica?",
    options: ["Praticar novamente", "Praticar outra objecao", "Encerrar pratica"],
    hypotheses: [], next: [], intent: "practice_answer", decisionRequired: true,
    feedback: { good: goodParts.join("; ") || "Tom profissional e tentativa de responder", missing: missing.join("; ") || "Apenas tornar a resposta mais curta e verificavel", improved },
    memory: { ...memory, activePractice: null, topics: unique([...(memory.topics ?? []), topic.label]), examples: unique([...(memory.examples ?? []), improved]) },
  };
}

function multipleTopicDecision(found: Topic[], memory: CoachMemory): CoachLayer {
  const labels = found.slice(0, 4).map((topic) => topic.label);
  return {
    direct: `Voce trouxe ${labels.length} frentes diferentes. Todas importam, mas trabalhar uma por vez vai gerar uma orientacao melhor.`,
    reasoning: "Cada tema exige um diagnostico e uma pratica diferentes. Escolher a primeira prioridade evita uma resposta superficial sobre tudo.",
    action: "Comece pelo tema que mais prejudica uma conversa real nesta semana.",
    question: "Por qual voce quer comecar?", options: labels, hypotheses: [], next: [], intent: "problem", decisionRequired: true,
    memory: { ...memory, difficulties: unique([...(memory.difficulties ?? []), ...labels]) },
  };
}

export function localCoachResponse(message: string, context: CoachContext = {}, history: CoachHistoryItem[] = [], suppliedMemory?: CoachMemory): CoachLayer {
  const memory = emptyMemory(suppliedMemory);
  const intent = classifyCoachIntent(message, history, memory);
  const text = normalize(message);
  const found = topicsIn(message);
  const previousTopicId = memory.topics?.length ? TOPICS.find((topic) => topic.label === memory.topics?.at(-1))?.id : undefined;
  const topic = found[0] || TOPICS.find((item) => item.id === memory.activePractice?.topic) || TOPICS.find((item) => item.id === previousTopicId) || TOPICS.find((item) => item.id === "discovery")!;

  if (intent === "incomplete") return simpleLayer("Acho que sua mensagem veio incompleta. Pode terminar?", intent, memory);
  if (intent === "greeting") return simpleLayer("Fala! Tudo certo? Pode mandar sua duvida comercial do jeito que ela vier.", intent, memory);
  if (intent === "casual") return simpleLayer(/obrig|valeu/.test(text) ? "Tamo junto. Quando quiser, continua daqui." : "Tudo certo por aqui. E contigo? No que eu posso te ajudar hoje?", intent, memory);
  if (found.length >= 3) return multipleTopicDecision(found, memory);
  if (intent === "practice_answer") return evaluatePractice(message, topic, context, memory);
  if (intent === "practice") {
    const requestedTopic = found[0] || TOPICS.find((item) => memory.topics?.includes(item.label)) || TOPICS.find((item) => item.id === "objections")!;
    if (/encerrar|parar|cancelar/.test(text)) return simpleLayer("Pratica encerrada. Guarde o principal ajuste e aplique na proxima conversa real.", "casual", { ...memory, activePractice: null });
    return startPractice(requestedTopic, context, memory);
  }

  const updatedMemory: CoachMemory = {
    ...memory,
    topics: unique([...(memory.topics ?? []), topic.label]),
    difficulties: /dificuldade|nao consigo|travando|problema|ruim|perco/.test(text) ? unique([...(memory.difficulties ?? []), message.slice(0, 180)]) : memory.difficulties,
  };

  if (intent === "definition") return {
    ...simpleLayer(topic.definition, intent, updatedMemory),
    reasoning: topic.principle,
    action: `Na pratica: ${topic.application}`,
  };

  if (intent === "clarification") return {
    ...simpleLayer(`Vou explicar de outro jeito. ${topic.definition}`, intent, updatedMemory),
    reasoning: `Pense assim: ${topic.principle}`,
    action: `Em uma conversa real, faca isto: ${topic.application} Exemplo: ${contextualExample(topic, context)}`,
  };

  if (intent === "example") return {
    ...simpleLayer(`Um exemplo de ${topic.label}:`, intent, { ...updatedMemory, examples: unique([...(updatedMemory.examples ?? []), contextualExample(topic, context)]) }),
    action: contextualExample(topic, context),
  };

  if (intent === "creation") {
    if ((topic.id === "pitch" || /empresa|negocio/.test(text)) && (!context.product || !context.customer)) return {
      ...simpleLayer("Eu consigo construir isso com voce, mas para nao criar um texto generico preciso de duas informacoes que realmente mudam a resposta.", intent, updatedMemory),
      question: "O que voce vende e para quem voce vende?",
    };
    const product = context.product || "sua oferta";
    const customer = context.customer || "seu publico";
    const created = topic.id === "pitch" ? `Eu ajudo ${customer} que enfrentam [problema especifico] a usar ${product} para [resultado mensuravel], sem [custo ou risco da alternativa]. Antes de te mostrar como, como voces lidam com esse problema hoje?` : contextualExample(topic, context);
    return {
      ...simpleLayer(`Aqui esta uma primeira versao aplicada a ${product}:`, intent, { ...updatedMemory, examples: unique([...(updatedMemory.examples ?? []), created]) }),
      reasoning: `A estrutura foi adaptada para ${customer} e evita prometer um resultado que ainda nao foi comprovado na conversa.`,
      action: created,
      question: "Qual parte nao soa natural na sua forma de falar?",
    };
  }

  if (intent === "analysis") {
    const hasCustomer = /cliente|voce|voces|empresa/.test(text);
    const hasProblem = /problema|dificuldade|trava|perde|impacto|resultado/.test(text);
    const hasQuestion = /\?/.test(message);
    return {
      direct: `A base pode ser aproveitada, mas hoje ela esta ${hasProblem ? "mais proxima de uma conversa de valor" : "explicando a oferta antes de provar relevancia"}.`,
      reasoning: `Contexto do cliente: ${hasCustomer ? "presente" : "ausente"}. Problema ou impacto: ${hasProblem ? "presente" : "ausente"}. Pergunta de validacao: ${hasQuestion ? "presente" : "ausente"}.`,
      action: `Reescreva em quatro movimentos: contexto real, problema, resultado e pergunta. Exemplo: ${contextualExample(topic, context)}`,
      question: "Quer que eu corrija uma segunda versao depois deste ajuste?",
      options: ["Vou mandar a nova versao", "Reconstruir comigo"], hypotheses: [], next: [], intent, decisionRequired: true,
      feedback: { good: hasCustomer ? "Existe referencia ao cliente" : "Existe uma tentativa clara de apresentar", missing: !hasProblem ? "Problema e impacto especificos" : !hasQuestion ? "Pergunta de validacao" : "Mais concisao", improved: contextualExample(topic, context) },
      memory: updatedMemory,
    };
  }

  if (intent === "continuation") {
    const lastSeller = [...history].reverse().find((item) => item.role === "seller")?.text;
    if (/concorrente|outra (empresa|solucao)|ja usa/.test(text)) return {
      ...simpleLayer("Nao ataque o concorrente nem tente substituir a solucao antes de entender por que o cliente a escolheu. Descubra o que funciona, o que ainda limita o resultado e qual seria o custo real de mudar.", intent, updatedMemory),
      reasoning: `Como voce vende ${context.product || "sua oferta"} para ${context.customer || "esse publico"}, a comparacao precisa acontecer nos criterios importantes para o cliente, nao em uma lista de funcionalidades.`,
      action: "Responda: 'Faz sentido manter algo que ja funciona. O que voces mais valorizam na solucao atual e o que ainda gostariam que ela resolvesse melhor? Se eu nao encontrar uma diferenca relevante nesses criterios, nao faria sentido propor uma troca.'",
    };
    if (/caro|preco|desconto|orcamento/.test(text)) return {
      ...simpleLayer("Nesse caso, nao negocie contra voce mesmo. Investigue se a resistencia e verba, comparacao ou valor pouco claro e responda somente depois.", intent, updatedMemory),
      reasoning: lastSeller ? `Estou ligando essa objecao ao que voce relatou antes: "${lastSeller.slice(0, 160)}".` : topic.principle,
      action: contextualExample(topic, context),
    };
    return {
      ...simpleLayer(`Isso complementa o que voce contou${lastSeller ? " antes" : ""}. A nova informacao muda o proximo passo, mas nao apaga o diagnostico anterior.`, intent, updatedMemory),
      reasoning: lastSeller ? `Estou considerando junto: "${lastSeller.slice(0, 180)}".` : "Vou manter este assunto como continuacao, sem reiniciar a conversa.",
      action: topic.application,
    };
  }

  const direct = intent === "teaching"
    ? `Vamos aprender ${topic.label} de um jeito aplicavel: ${topic.definition}`
    : intent === "problem"
      ? `Para melhorar ${topic.label}, primeiro pare de tratar o sintoma como causa. ${topic.principle}`
      : intent === "question"
        ? `${topic.principle}`
        : `Posso te ajudar nisso. Pelo que voce escreveu, o tema mais proximo e ${topic.label}.`;
  return {
    direct,
    reasoning: `${topic.application} ${context.product ? `No seu caso, conecte isso a ${context.product}` : ""}${context.customer ? ` e a realidade de ${context.customer}.` : "."}`,
    action: `Exemplo: ${contextualExample(topic, context)} Evite: ${topic.mistake}`,
    question: intent === "problem" ? "Qual foi a ultima situacao real em que isso aconteceu?" : "",
    options: intent === "teaching" ? ["Quero praticar", "Quero outro exemplo"] : [],
    hypotheses: [], next: [], intent, decisionRequired: intent === "teaching",
    memory: updatedMemory,
  };
}

export function sanitizeCoachLayer(layer: Partial<CoachLayer>, fallback: CoachLayer): CoachLayer {
  const decisionRequired = layer.decisionRequired === true;
  return {
    direct: layer.direct?.trim() || fallback.direct,
    hypotheses: Array.isArray(layer.hypotheses) ? layer.hypotheses.filter(Boolean).slice(0, 4) : [],
    reasoning: layer.reasoning?.trim() || "",
    action: layer.action?.trim() || "",
    question: layer.question?.trim() || "",
    options: decisionRequired && Array.isArray(layer.options) ? layer.options.filter(Boolean).slice(0, 4) : [],
    next: [],
    intent: layer.intent || fallback.intent,
    decisionRequired,
    memory: { ...fallback.memory, ...(layer.memory ?? {}) },
    feedback: layer.feedback,
  };
}
