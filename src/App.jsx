import React, { useState, useEffect } from "react";
import KanbanBoard from "./components/KanbanBoard";
import EvaluationModal from "./components/EvaluationModal";
import { 
  mockGrupos, 
  mockAlunos, 
  mockApresentacoes, 
  mockAvaliacoes 
} from "./dbMockData";
import { 
  HeartPulse, 
  RotateCcw, 
  Database, 
  DatabaseZap, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Sparkles 
} from "lucide-react";

export default function App() {
  // Estados para dados principais
  const [grupos, setGrupos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [apresentacoes, setApresentacoes] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  
  // Estados de controle de fluxo e UI
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Modo de operação (online com Turso vs fallback mock em memória)
  const [isOfflineMode, setIsOfflineMode] = useState(false);

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
      setIsOfflineMode(false);
      showToast("Conectado ao banco Turso com sucesso!", "success");
    } catch (err) {
      console.warn("Backend não encontrado ou falhou. Ativando modo de simulação local (offline):", err.message);
      
      // Fallback: carrega os dados de simulação locais em memória
      setGrupos(mockGrupos);
      setAlunos(mockAlunos);
      setApresentacoes(mockApresentacoes);
      setAvaliacoes(mockAvaliacoes);
      setIsOfflineMode(true);
      
      showToast("Executando em modo de simulação (Offline). Dados salvos apenas em memória.", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Atualizar o status de uma apresentação
  const handleUpdateStatus = async (id_apresentacao, novoStatus) => {
    // Atualização otimista no estado local (interface atualiza instantaneamente!)
    setApresentacoes((prev) =>
      prev.map((ap) =>
        ap.id_apresentacao === id_apresentacao
          ? { ...ap, status_atividade: novoStatus }
          : ap
      )
    );

    if (isOfflineMode) {
      showToast(`Status movido para '${novoStatus}' (Modo Simulação)`, "info");
      return;
    }

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
      
      // Reverte em caso de falha de conexão
      carregarDados();
    }
  };

  // 2. Salvar uma avaliação
  const handleSaveEvaluation = async (evaluationData) => {
    const { id_apresentacao, nota_metodologia, nota_exposicao, feedback } = evaluationData;

    // Atualização otimista no estado local
    // Insere ou atualiza no array local de avaliações
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

    if (isOfflineMode) {
      showToast("Avaliação registrada localmente!", "success");
      return;
    }

    try {
      const res = await fetch("/api/save-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationData)
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar avaliação");
      }

      showToast("Avaliação salva no banco Turso!", "success");
      // Recarrega dados reais para manter integridade
      carregarDados();
    } catch (err) {
      console.error(err);
      showToast("Falha ao enviar avaliação para a nuvem. Revertendo...", "error");
      carregarDados();
    }
  };

  // 3. Resetar o Banco de Dados para estado inicial (ação do professor)
  const handleResetDatabase = async () => {
    if (window.confirm("Deseja redefinir o banco de dados para os dados originais do Clube de Revista? Isso apagará notas criadas.")) {
      setIsLoading(true);
      if (isOfflineMode) {
        setGrupos(mockGrupos);
        setAlunos(mockAlunos);
        setApresentacoes(mockApresentacoes);
        setAvaliacoes(mockAvaliacoes);
        setIsLoading(false);
        showToast("Dados simulados reiniciados com sucesso!", "success");
        return;
      }

      try {
        const res = await fetch("/api/reset", { method: "POST" });
        if (!res.ok) throw new Error("Erro ao resetar");
        showToast("Banco de dados Turso reiniciado com sucesso!", "success");
        carregarDados();
      } catch (err) {
        console.error(err);
        showToast("Falha ao resetar banco remoto.", "error");
        setIsLoading(false);
      }
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
              background: isOfflineMode ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
              color: isOfflineMode ? "var(--warning)" : "var(--success)",
              border: `1px solid ${isOfflineMode ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
            }}
            title={isOfflineMode ? "Rodando em modo local, operações salvas em memória" : "Conectado ao banco de dados Turso na nuvem"}
          >
            {isOfflineMode ? <Database size={14} /> : <DatabaseZap size={14} />}
            <span>{isOfflineMode ? "Modo Simulado (Offline)" : "Turso Conectado"}</span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={handleResetDatabase}
            title="Repopula e redefine os dados do banco para os originais"
          >
            <RotateCcw size={16} />
            <span>Resetar Dados</span>
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

      {/* Conteúdo Principal (Quadro Kanban ou Carregamento) */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(0, 210, 255, 0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "fadeIn 0.6s infinite linear" }} className="spinner"></div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Acessando banco de dados...</p>
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
        {isOfflineMode && (
          <p style={{ color: "var(--warning)", marginTop: "8px", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <AlertTriangle size={12} />
            <span>Nota: Para habilitar a persistência em nuvem, configure as variáveis de ambiente TURSO_URL e TURSO_TOKEN e inicie com 'netlify dev'</span>
          </p>
        )}
      </footer>

    </div>
  );
}
