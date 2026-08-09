import Link from "next/link";
import { Award, ShieldCheck } from "lucide-react";

export default async function CertificateVerification({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const isDemo = code.includes("DEMO");
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, color: "#14213a", background: "#f4f7fb", fontFamily: "Arial, sans-serif" }}>
    <article style={{ width: "min(620px, 100%)", padding: 34, border: "1px solid #dce4ef", borderRadius: 8, background: "#fff", boxShadow: "0 18px 50px rgba(20,33,58,.08)" }}>
      <Award size={38} color="#2563eb" />
      <p style={{ margin: "18px 0 6px", color: "#2563eb", fontSize: 11, fontWeight: 800, letterSpacing: ".1em" }}>VERIFICACAO PERFORMA AI</p>
      <h1 style={{ margin: 0, fontSize: 32 }}>{isDemo ? "Certificado de demonstracao" : "Registro de certificacao"}</h1>
      <p style={{ color: "#60718a", lineHeight: 1.7 }}>{isDemo ? "Este codigo foi criado apenas para visualizar o modelo e nao representa uma certificacao conquistada." : "Este codigo pertence ao fluxo de verificacao profissional da Performa AI. Dados pessoais completos so aparecem em registros emitidos e autorizados."}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", padding: 16, color: "#174785", background: "#edf4ff" }}><ShieldCheck /><span><b>Codigo apresentado</b><br />{code}</span></div>
      <p style={{ color: "#60718a", fontSize: 13 }}>A autenticidade definitiva exige status emitido, competencias aprovadas, carga concluida, nivel e data de emissao registrados na plataforma.</p>
      <Link href="/" style={{ display: "inline-block", marginTop: 12, padding: "11px 16px", borderRadius: 5, color: "#fff", background: "#2563eb", textDecoration: "none", fontWeight: 700 }}>Conhecer a Performa AI</Link>
    </article>
  </main>;
}
