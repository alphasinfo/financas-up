"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useUserPhoto } from "@/contexts/logo-context";
import { usePWA } from "@/components/pwa-manager";
import { Check, AlertCircle, Home, User, Mail, Database, FileText, Users, UserPlus, Shield } from "lucide-react";

// Importar componentes das abas
import { AbaInicio } from "@/components/configuracoes/aba-inicio";
import { AbaUsuario } from "@/components/configuracoes/aba-usuario";
import { AbaEmail } from "@/components/configuracoes/aba-email";
import { AbaBackup } from "@/components/configuracoes/aba-backup";
import { AbaDocs } from "@/components/configuracoes/aba-docs";
import { AbaCompartilhamento } from "@/components/configuracoes/aba-compartilhamento";
import { AbaConvites } from "@/components/configuracoes/aba-convites";
import { AbaLogAcesso } from "@/components/configuracoes/aba-log-acesso";

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const { setFotoUrl } = useUserPhoto();
  const { isInstalled, isStandalone, canInstall } = usePWA();
  
  // Estados gerais
  const [activeTab, setActiveTab] = useState("inicio");
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  // Estados do usuário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Estados de email
  const [provedorEmail, setProvedorEmail] = useState<"gmail" | "outlook" | "outro">("gmail");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpSenha, setSmtpSenha] = useState("");
  const [smtpNome, setSmtpNome] = useState("Finanças UP");
  const [notificacaoEmail, setNotificacaoEmail] = useState(true);
  const [notificacaoVencimento, setNotificacaoVencimento] = useState(true);
  const [notificacaoOrcamento, setNotificacaoOrcamento] = useState(true);
  const [enviarRelatorioEmail, setEnviarRelatorioEmail] = useState(false);
  const [diaEnvioRelatorio, setDiaEnvioRelatorio] = useState(1);

  // Estados de backup
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (session?.user) {
      setNome(session.user.name || "");
      setEmail(session.user.email || "");
    }
    carregarLogo();
    carregarConfiguracoesEmail();
  }, [session]);

  // Funções de carregamento
  const carregarLogo = async () => {
    try {
      const resposta = await fetch("/api/usuario/logo");
      if (resposta.ok) {
        const dados = await resposta.json();
        setFoto(dados.foto);
        setFotoUrl(dados.foto);
      }
    } catch (error) {
      console.error("Erro ao carregar foto:", error);
    }
  };

  const carregarConfiguracoesEmail = async () => {
    try {
      const resposta = await fetch("/api/usuario/relatorio-email");
      if (resposta.ok) {
        const dados = await resposta.json();
        setEnviarRelatorioEmail(dados.enviarRelatorioEmail || false);
        setDiaEnvioRelatorio(dados.diaEnvioRelatorio || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de email:", error);
    }
  };

  // Handlers do usuário
  const handleSalvarPerfil = async () => {
    setCarregando(true);
    setErro("");
    setSucesso(false);

    try {
      const resposta = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });

      if (resposta.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        setErro("Erro ao salvar perfil");
      }
    } catch (error) {
      setErro("Erro ao salvar perfil");
    } finally {
      setCarregando(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setCarregando(true);
    setErro("");
    setSucesso(false);

    try {
      const resposta = await fetch("/api/usuario/senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      if (resposta.ok) {
        setSucesso(true);
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        setTimeout(() => setSucesso(false), 3000);
      } else {
        const erro = await resposta.json();
        setErro(erro.erro || "Erro ao alterar senha");
      }
    } catch (error) {
      setErro("Erro ao alterar senha");
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarFoto = async () => {
    if (!fotoFile) return;

    setCarregando(true);
    setErro("");

    try {
      const formData = new FormData();
      formData.append("foto", fotoFile);

      const resposta = await fetch("/api/usuario/logo", {
        method: "POST",
        body: formData,
      });

      if (resposta.ok) {
        const dados = await resposta.json();
        setFoto(dados.foto);
        setFotoUrl(dados.foto);
        setFotoFile(null);
        setFotoPreview(null);
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        setErro("Erro ao salvar foto");
      }
    } catch (error) {
      setErro("Erro ao salvar foto");
    } finally {
      setCarregando(false);
    }
  };

  const handleRemoverFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
  };

  // Handlers de email
  const handleMudarProvedor = (provedor: "gmail" | "outlook" | "outro") => {
    setProvedorEmail(provedor);
    
    if (provedor === "gmail") {
      setSmtpHost("smtp.gmail.com");
      setSmtpPort("587");
    } else if (provedor === "outlook") {
      setSmtpHost("smtp-mail.outlook.com");
      setSmtpPort("587");
    } else {
      setSmtpHost("");
      setSmtpPort("587");
    }
  };

  const handleSalvarRelatorio = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch("/api/usuario/relatorio-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enviarRelatorioEmail,
          diaEnvioRelatorio,
        }),
      });

      if (resposta.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      } else {
        setErro("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar relatório:", error);
      setErro("Erro ao salvar configurações");
    } finally {
      setCarregando(false);
    }
  };

  const handleEnviarAgora = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch("/api/relatorios/enviar-email", {
        method: "POST",
      });

      if (resposta.ok) {
        alert("Relatório enviado com sucesso!");
      } else {
        alert("Erro ao enviar relatório. Verifique as configurações de email.");
      }
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      alert("Erro ao enviar relatório.");
    } finally {
      setCarregando(false);
    }
  };

  // Handlers de backup
  const handleExportarDados = async () => {
    setExportando(true);
    try {
      const resposta = await fetch("/api/usuario/exportar");
      if (!resposta.ok) throw new Error("Erro ao exportar dados");
      
      const dados = await resposta.json();
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Gerar nome com data e hora atual
      const agora = new Date();
      const dataHora = agora.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `financas-up-backup-${dataHora}.json`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar dados");
    } finally {
      setExportando(false);
    }
  };

  const handleImportarDados = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    try {
      const text = await file.text();
      const dados = JSON.parse(text);

      const resposta = await fetch("/api/usuario/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (resposta.ok) {
        alert("Dados importados com sucesso!");
        window.location.reload();
      } else {
        throw new Error("Erro ao importar");
      }
    } catch (error) {
      console.error("Erro ao importar:", error);
      alert("Erro ao importar dados. Verifique se o arquivo está correto.");
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      {/* Mensagens */}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{erro}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 gap-2">
          <TabsTrigger value="inicio" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Início</span>
          </TabsTrigger>
          <TabsTrigger value="usuario" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Usuário</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Backup</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="compartilhamento" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </TabsTrigger>
          <TabsTrigger value="convites" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Convites</span>
          </TabsTrigger>
          <TabsTrigger value="log-acesso" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inicio" className="mt-6">
          <AbaInicio onMudarAba={setActiveTab} />
        </TabsContent>

        <TabsContent value="usuario" className="mt-6">
          <AbaUsuario
            nome={nome}
            setNome={setNome}
            email={email}
            setEmail={setEmail}
            senhaAtual={senhaAtual}
            setSenhaAtual={setSenhaAtual}
            novaSenha={novaSenha}
            setNovaSenha={setNovaSenha}
            confirmarSenha={confirmarSenha}
            setConfirmarSenha={setConfirmarSenha}
            foto={foto}
            fotoPreview={fotoPreview}
            carregando={carregando}
            onSalvarPerfil={handleSalvarPerfil}
            onAlterarSenha={handleAlterarSenha}
            onSelecionarFoto={handleSelecionarFoto}
            onSalvarFoto={handleSalvarFoto}
            onRemoverFoto={handleRemoverFoto}
          />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <AbaEmail
            provedorEmail={provedorEmail}
            smtpHost={smtpHost}
            smtpPort={smtpPort}
            smtpEmail={smtpEmail}
            smtpSenha={smtpSenha}
            smtpNome={smtpNome}
            onMudarProvedor={handleMudarProvedor}
            setSmtpHost={setSmtpHost}
            setSmtpPort={setSmtpPort}
            setSmtpEmail={setSmtpEmail}
            setSmtpSenha={setSmtpSenha}
            setSmtpNome={setSmtpNome}
            notificacaoEmail={notificacaoEmail}
            notificacaoVencimento={notificacaoVencimento}
            notificacaoOrcamento={notificacaoOrcamento}
            setNotificacaoEmail={setNotificacaoEmail}
            setNotificacaoVencimento={setNotificacaoVencimento}
            setNotificacaoOrcamento={setNotificacaoOrcamento}
            enviarRelatorioEmail={enviarRelatorioEmail}
            diaEnvioRelatorio={diaEnvioRelatorio}
            setEnviarRelatorioEmail={setEnviarRelatorioEmail}
            setDiaEnvioRelatorio={setDiaEnvioRelatorio}
            carregando={carregando}
            onSalvarRelatorio={handleSalvarRelatorio}
            onEnviarAgora={handleEnviarAgora}
          />
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <AbaBackup
            exportando={exportando}
            importando={importando}
            onExportar={handleExportarDados}
            onImportar={handleImportarDados}
          />
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <AbaDocs />
        </TabsContent>

        <TabsContent value="compartilhamento" className="mt-6">
          <AbaCompartilhamento />
        </TabsContent>

        <TabsContent value="convites" className="mt-6">
          <AbaConvites />
        </TabsContent>

        <TabsContent value="log-acesso" className="mt-6">
          <AbaLogAcesso />
        </TabsContent>
      </Tabs>
    </div>
  );
}