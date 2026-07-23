# PerformAI

PerformAI é uma plataforma de treinamento comercial com IA para preparar times de vendas em conversas reais. O produto simula compradores difíceis, interrompe como um prospect, analisa as respostas e devolve coaching acionável.

## O que está incluído

- Conversa de áudio bidirecional em tempo real com Gemini Live
- Captura opcional de câmera para análise de presença e linguagem corporal
- Detecção de objeções e feedback durante a sessão
- Três personas de comprador, cada uma com estilo de objeção próprio
- Scorecard ao final da sessão com cinco competências de vendas
- Feedback de coaching gerado pela IA

O acesso inicial da interface é uma autenticação local de demonstração: usuário `Cavalcante` e senha `1234`. Antes de colocar o produto em produção, troque esse fluxo por autenticação persistente e armazene as credenciais em um provedor seguro.

## Personas de comprador

| Persona | ID | Estilo |
|---------|-----|--------|
| CTO cético | `skeptic` | Interrompe, exige provas e rejeita buzzwords |
| CFO guardião do orçamento | `budget_guardian` | Obcecado por ROI e compara com ferramentas gratuitas |
| Compras agressivo | `procurement` | Tem pressa e concentra a conversa em preço |

## Competências avaliadas

Cada sessão recebe nota de 1 a 10 em:

- **Confiança** — presença e segurança na fala
- **Tratamento de objeções** — qualidade das respostas ao pushback
- **Clareza** — objetividade na comunicação de valor
- **Valor e ROI** — conexão entre benefício e resultado
- **Fechamento** — avanço da conversa para o próximo passo

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | FastAPI, Python 3.11, Uvicorn |
| IA | Google Gemini Live (`google-genai`) |
| Transporte | WebSocket com áudio PCM e vídeo JPEG |
| Infraestrutura | Google Cloud Run, Terraform e Docker |

## Desenvolvimento local

Pré-requisitos: Python 3.11+, Node.js 18+ e uma chave Gemini.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Windows PowerShell
pip install -r requirements.txt
$env:GEMINI_API_KEY="sua_chave"
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Crie `frontend/.env.local` quando o backend não estiver na porta padrão:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

Frontend: `http://localhost:3000`  
API: `http://localhost:8001/docs`

## Deploy no Google Cloud Run

```bash
$env:GEMINI_API_KEY="sua_chave_de_producao"
bash infra/scripts/deploy.sh
```

O deploy constrói as imagens do backend e frontend, publica no Container Registry e provisiona os serviços Cloud Run. Configure `NEXT_PUBLIC_WS_URL` com a URL `wss://` do backend.

## Testes

```bash
cd backend
pytest tests/ -v
```

## Estrutura

```text
PerformAI/
├── backend/       # FastAPI, Gemini Live, personas e scorecard
├── frontend/      # Interface PerformAI e streaming de áudio/vídeo
└── infra/         # Terraform e scripts de deploy
```

## Licença

Apache 2.0 — consulte [LICENSE](LICENSE).
