import React, { useState, useEffect } from "react";
import KanbanBoard from "./components/KanbanBoard";
import EvaluationModal from "./components/EvaluationModal";
import { 
  HeartPulse, 
  DatabaseZap, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Sparkles,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  // Estados para dados principais
  const [grupos, setGrupos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [apresentacoes, setApresentacoes] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);

  // Tema claro/escuro (padrão é claro)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  // Estados de controle de fluxo, erro e UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Inicialização e busca dos dados
  useEffect(() => {
    carregarDados();
  }, []);

  // Sistema de Toasts (notificações flutuantes)
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove após 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const carregarDados = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Tenta carregar do backend (Netlify Functions)
      const res = await fetch("/api/data");
      
      if (!res.ok) {
        throw new Error(`Erro na chamada da API: ${res.status}`);
      }

      const data = await res.json();
      
      // Sucesso! Atualiza os estados com os dados reais do Turso
      setGrupos(data.grupos || []);
      setAlunos(data.alunos || []);
      setApresentacoes(data.apresentacoes || []);
      setAvaliacoes(data.avaliacoes || []);
      showToast("Dados carregados com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao conectar com o banco de dados:", err.message);
      setError(err.message);
      showToast("Falha na conexão com o banco de dados.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Atualizar o status de uma apresentação
  const handleUpdateStatus = async (id_apresentacao, novoStatus) => {
    const oldApresentacoes = apresentacoes;
    // Atualização otimista no estado local (interface atualiza instantaneamente!)
    setApresentacoes((prev) =>
      prev.map((ap) =>
        ap.id_apresentacao === id_apresentacao
          ? { ...ap, status_atividade: novoStatus }
          : ap
      )
    );

    try {
      const res = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_apresentacao, status_atividade: novoStatus })
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar status");
      }
      
      showToast(`Status atualizado para '${novoStatus}'`, "success");
    } catch (err) {
      console.error(err);
      showToast("Falha ao salvar status no banco de dados. Revertendo...", "error");
      setApresentacoes(oldApresentacoes);
    }
  };

  // 2. Salvar uma avaliação
  const handleSaveEvaluation = async (evaluationData) => {
    const { id_apresentacao, nota_metodologia, nota_exposicao, feedback } = evaluationData;
    const oldAvaliacoes = avaliacoes;
    const oldApresentacoes = apresentacoes;

    // Atualização otimista no estado local
    setAvaliacoes((prev) => {
      const idx = prev.findIndex((av) => av.id_apresentacao === id_apresentacao);
      const novaAvaliacao = {
        id_avaliacao: idx >= 0 ? prev[idx].id_avaliacao : "av_" + Math.random().toString(36).substr(2, 9),
        id_apresentacao,
        nota_metodologia,
        nota_exposicao,
        feedback
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = novaAvaliacao;
        return copy;
      } else {
        return [...prev, novaAvaliacao];
      }
    });

    // Como salvar avaliação força o status para Finalizado, atualizamos localmente também
    setApresentacoes((prev) =>
      prev.map((ap) =>
        ap.id_apresentacao === id_apresentacao
          ? { ...ap, status_atividade: "Finalizado" }
          : ap
      )
    );

    setSelectedPresentation(null); // Fecha o modal

    try {
      const res = await fetch("/api/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationData)
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar avaliação");
      }

      showToast("Avaliação registrada no banco!", "success");
      carregarDados();
    } catch (err) {
      console.error(err);
      showToast("Falha ao salvar avaliação. Revertendo...", "error");
      setAvaliacoes(oldAvaliacoes);
      setApresentacoes(oldApresentacoes);
    }
  };

  // 2.5. Salvar metadados da apresentação (título do artigo, links e data)
  const handleSavePresentationMetadata = async (metadata) => {
    const { id_apresentacao, titulo_artigo, link_artigo, link_slides, data_agendada } = metadata;
    const oldApresentacoes = apresentacoes;

    // Atualização otimista local
    setApresentacoes((prev) =>
      prev.map((ap) =>
        ap.id_apresentacao === id_apresentacao
          ? { ...ap, titulo_artigo, link_artigo, link_slides, data_agendada }
          : ap
      )
    );
    
    // Atualiza também a apresentação selecionada para refletir mudanças no modal aberto
    setSelectedPresentation((prev) => 
      prev && prev.id_apresentacao === id_apresentacao 
        ? { ...prev, titulo_artigo, link_artigo, link_slides, data_agendada }
        : prev
    );

    try {
      const res = await fetch("/api/update-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata)
      });

      if (!res.ok) {
        throw new Error("Erro ao atualizar dados da apresentação");
      }

      showToast("Detalhes da apresentação atualizados!", "success");
    } catch (err) {
      console.error(err);
      showToast("Falha ao atualizar dados. Revertendo...", "error");
      setApresentacoes(oldApresentacoes);
      const oldSelected = oldApresentacoes.find(ap => ap.id_apresentacao === id_apresentacao);
      if (oldSelected) setSelectedPresentation(oldSelected);
    }
  };

  // Abre modal de avaliação para a apresentação clicada
  const handleOpenEvaluation = (apresentacao) => {
    setSelectedPresentation(apresentacao);
  };

  // Encontra detalhes adicionais para o modal aberto
  const getSelectedGroup = () => {
    if (!selectedPresentation) return null;
    return grupos.find((g) => g.id_grupo === selectedPresentation.id_grupo);
  };

  const getSelectedStudents = () => {
    if (!selectedPresentation) return [];
    return alunos.filter((aluno) => aluno.id_grupo === selectedPresentation.id_grupo);
  };

  const getSelectedEvaluation = () => {
    if (!selectedPresentation) return null;
    return avaliacoes.find((av) => av.id_apresentacao === selectedPresentation.id_apresentacao);
  };

  return (
    <div className="app-container">
      
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="brand-section">
          <HeartPulse className="logo-icon" size={32} />
          <div className="brand-title">
            <h1>Clube de Revista</h1>
            <div className="brand-subtitle">Medicina UNCISAL</div>
          </div>
        </div>

        <div className="header-actions">
          {/* Badge de Conexão com o Banco */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.4rem 0.8rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--success)",
              border: "1px solid rgba(16, 185, 129, 0.2)"
            }}
            title="Conectado ao banco de dados"
          >
            <DatabaseZap size={14} />
            <span>Banco Conectado</span>
          </div>

          {/* Botão de Alternar Tema */}
          <button
            className="btn-icon"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>


        </div>
      </header>

      {/* Visão Geral do Dashboard */}
      <div className="dashboard-overview">
        <div className="dashboard-title">
          <h2>Painel de Avaliação de Artigos</h2>
          <span className="dashboard-subtitle">
            Gerencie as arguições dos estudantes de medicina de forma contínua e sem recarregar a página.
          </span>
        </div>
      </div>

      {/* Conteúdo Principal (Quadro Kanban, Carregamento ou Erro) */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0, 210, 255, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "fadeIn 0.6s infinite linear" }} className="spinner"></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Acessando banco de dados...</p>
        </div>
      ) : error ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "16px", background: "rgba(239, 68, 68, 0.05)", border: "1px dashed #ef4444", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
          <AlertTriangle size={40} style={{ color: "#ef4444" }} />
          <h3 style={{ color: "var(--text-primary)", fontWeight: "700" }}>Falha de Conexão</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "450px" }}>
            Não foi possível carregar os dados do servidor real. Certifique-se de que o backend local está rodando (`netlify dev`) ou que o deploy no Netlify está ativo e configurado.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Detalhe: {error}</p>
          <button className="btn-primary" onClick={carregarDados}>
            Tentar Novamente
          </button>
        </div>
      ) : (
        <KanbanBoard
          apresentacoes={apresentacoes}
          grupos={grupos}
          avaliacoes={avaliacoes}
          onOpenEvaluation={handleOpenEvaluation}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Modal de Avaliação */}
      {selectedPresentation && (
        <EvaluationModal
          apresentacao={selectedPresentation}
          grupo={getSelectedGroup()}
          alunos={getSelectedStudents()}
          avaliacaoExistente={getSelectedEvaluation()}
          onClose={() => setSelectedPresentation(null)}
          onSave={handleSaveEvaluation}
          onSaveMetadata={handleSavePresentationMetadata}
        />
      )}

      {/* Container de Notificações Toast */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "success" && <CheckCircle size={16} style={{ color: "var(--success)" }} />}
            {t.type === "error" && <AlertTriangle size={16} style={{ color: "#ef4444" }} />}
            {t.type === "warning" && <AlertTriangle size={16} style={{ color: "var(--warning)" }} />}
            {t.type === "info" && <Info size={16} style={{ color: "var(--primary)" }} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Rodapé da Aplicação */}
      <footer className="app-footer" style={{ display: "flex", flexDirection: "column", gap: "6px", lineHeight: "1.6" }}>
        <p style={{ fontWeight: "600", color: "var(--text-primary)" }}>
          2026 @ Aldemar Araujo Castro
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>
          Disciplina de Pesquisa em Ciências da Saúde
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Universidade Estadual de Ciências da Saúde de Alagoas - UNCISAL
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Maceió - Alagoas - Brasil
        </p>
      </footer>

    </div>
  );
}
