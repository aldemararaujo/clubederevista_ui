import React from "react";
import { ExternalLink, Calendar, BookOpen, Presentation, ClipboardEdit, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * Componente que representa cada grupo/apresentação na coluna do Kanban.
 */
export default function KanbanCard({
  apresentacao,
  grupo,
  avaliacao,
  onOpenEvaluation,
  onUpdateStatus
}) {
  const { id_apresentacao, data_agendada, titulo_artigo, link_artigo, link_slides, status_atividade } = apresentacao;

  // Formata a data no padrão brasileiro
  const formatarData = (isoString) => {
    try {
      const data = new Date(isoString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) + "h";
    } catch (e) {
      return isoString;
    }
  };

  // Manipulador de início de arrasto
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", id_apresentacao);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handlers para botões rápidos de status
  const moverEsquerda = (e) => {
    e.stopPropagation();
    if (status_atividade === "Em andamento") onUpdateStatus(id_apresentacao, "Parado");
    else if (status_atividade === "Finalizado") onUpdateStatus(id_apresentacao, "Em andamento");
  };

  const moverDireita = (e) => {
    e.stopPropagation();
    if (status_atividade === "Parado") onUpdateStatus(id_apresentacao, "Em andamento");
    else if (status_atividade === "Em andamento") onUpdateStatus(id_apresentacao, "Finalizado");
  };

  // Determina classes adicionais de tag
  const getTagClass = () => {
    if (status_atividade === "Finalizado") return "card-tag finalizado";
    if (status_atividade === "Em andamento") return "card-tag andamento";
    return "card-tag";
  };

  // Verifica se a data da apresentação já passou e ainda não foi finalizada
  const isAtrasado = () => {
    if (status_atividade === "Finalizado") return false;
    return new Date(data_agendada) < new Date();
  };

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenEvaluation(apresentacao)}
      title="Clique para avaliar/ver detalhes deste grupo"
    >
      <div className="card-top">
        <span className={getTagClass()}>{status_atividade}</span>
        <div className={`card-date-badge ${isAtrasado() ? "overdue" : ""}`}>
          <Calendar size={13} />
          <span>{formatarData(data_agendada)}</span>
        </div>
      </div>

      <div>
        <div className="card-group-name">{grupo?.nome || `Grupo ${id_apresentacao}`}</div>
        <div className="card-topic">{grupo?.tema_foco || "Sem tema cadastrado"}</div>
      </div>

      {titulo_artigo && (
        <div className="card-title-article" title={titulo_artigo}>
          <BookOpen size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
          {titulo_artigo}
        </div>
      )}

      {/* Exibe resumo da nota se já foi avaliado */}
      {avaliacao && (
        <div className="card-evaluation-summary">
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)" }}>
            <CheckCircle size={14} />
            <span>Avaliado</span>
          </span>
          <span className="evaluation-score">
            M: {avaliacao.nota_metodologia?.toFixed(1)} | E: {avaliacao.nota_exposicao?.toFixed(1)}
          </span>
        </div>
      )}

      <div className="card-actions-row">
        <div className="card-links">
          {link_artigo && (
            <a
              href={link_artigo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="Abrir Artigo Científico (Link Externo)"
            >
              <BookOpen size={16} />
            </a>
          )}
          {link_slides && (
            <a
              href={link_slides}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon-link"
              onClick={(e) => e.stopPropagation()}
              title="Abrir Slides da Apresentação (Link Externo)"
            >
              <Presentation size={16} />
            </a>
          )}
        </div>

        {/* Controles de movimentação rápida para acessibilidade */}
        <div className="card-move-controls" onClick={(e) => e.stopPropagation()}>
          {status_atividade !== "Parado" && (
            <button
              onClick={moverEsquerda}
              className="btn-move"
              title={`Mover para ${status_atividade === "Finalizado" ? "'Em andamento'" : "'Parado'"}`}
            >
              <ArrowLeft size={14} />
            </button>
          )}

          <button
            onClick={() => onOpenEvaluation(apresentacao)}
            className="btn-card-action"
          >
            <ClipboardEdit size={13} />
            <span>{status_atividade === "Finalizado" ? "Ver Nota" : "Avaliar"}</span>
          </button>

          {status_atividade !== "Finalizado" && (
            <button
              onClick={moverDireita}
              className="btn-move"
              title={`Mover para ${status_atividade === "Parado" ? "'Em andamento'" : "'Finalizado'"}`}
            >
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
