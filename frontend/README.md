# PerformAI — frontend

Interface do PerformAI, SaaS de treinamento comercial com IA. A tela de login, a seleção de compradores, o role-play por áudio/vídeo e o scorecard vivem neste pacote.

## Rodar localmente

```bash
npm install
npm run dev
```

O frontend usa `NEXT_PUBLIC_WS_URL` para localizar o WebSocket do backend. Em desenvolvimento, crie `.env.local` com:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

O acesso de demonstração é `Cavalcante` / `1234`. Para produção, substitua a autenticação local por um provedor seguro.

## Build de produção

```bash
npm run build
npm run start
```
