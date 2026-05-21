import React, { useState } from "react";
import KanbanCard from "./KanbanCard";
import { Coffee, PlayCircle, CheckCircle2, Inbox } from "lucide-react";

/**
 * Componente do Quadro Kanban com três colunas ("Parado", "Em andamento", "Finalizado").
 */
export default function KanbanBoard({
  apresentacoes,
  grupos,
  avaliacoes,
  onOpenEvaluation,
  onUpdateStatus
}) {
  // Estado para controlar qual coluna está recebendo um card arrastado
  const [colunaArrastada, setColunaArrastada] = useState(null);

  const colunas = [
    {
      id: "Parado",
      titulo: "Parado",
      cor: "parado",
      icone: <Coffee size={18} className="column-icon" style={{ color: "var(--info)" }} />
    },
    {
      id: "Em andamento",
      titulo: "Em andamento",
      cor: "andamento",
      icone: <PlayCircle size={18} className="column-icon" style={{ color: "var(--warning)" }} />
    },
    {
      id: "Finalizado",
      titulo: "Finalizado",
      cor: "finalizado",
      icone: <CheckCircle2 size={18} className="column-icon" style={{ color: "var(--success)" }} />
    }
  ];

  // Permite o evento de arrastar sobre a coluna
  const handleDragOver = (e, colunaId) => {
    e.preventDefault();
  };

  // Quando o card entra na área da coluna
  const handleDragEnter = (e, colunaId) => {
    e.preventDefault();
    setColunaArrastada(colunaId);
  };

  // Quando o card sai da área da coluna
  const handleDragLeave = (e) => {
    // Reset apenas se for necessário ou ignorar para evitar tremulações
  };

  // Quando o card é solto na coluna
  const handleDrop = (e, colunaId) => {
    e.preventDefault();
    setColunaArrastada(null);
    const apresentacaoId = e.dataTransfer.getData("text/plain");
    
    if (apresentacaoId) {
      onUpdateStatus(apresentacaoId, colunaId);
    }
  };

  return (
    <div className="kanban-grid">
      {colunas.map((coluna) => {
        // Filtra apresentações pertencentes a esta coluna
        const apresentacoesFiltradas = apresentacoes.filter(
          (ap) => ap.status_atividade === coluna.id
        );

        return (
          <div
            key={coluna.id}
            className="kanban-column"
            onDragOver={(e) => handleDragOver(e, coluna.id)}
            onDragEnter={(e) => handleDragEnter(e, coluna.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, coluna.id)}
          >
            <div className="kanban-column-header">
              <div className="column-title-wrapper">
                <span className={`column-indicator ${coluna.cor}`}></span>
                {coluna.icone}
                <h3>{coluna.titulo}</h3>
              </div>
              <span className="cards-counter">{apresentacoesFiltradas.length}</span>
            </div>

            <div 
              className={`kanban-cards-container ${colunaArrastada === coluna.id ? "drag-hover" : ""}`}
            >
              {apresentacoesFiltradas.length > 0 ? (
                apresentacoesFiltradas.map((ap) => {
                  // Encontra o grupo associado
                  const grupo = grupos.find((g) => g.id_grupo === ap.id_grupo);
                  // Encontra a avaliação associada
                  const avaliacao = avaliacoes.find((av) => av.id_apresentacao === ap.id_apresentacao);

                  return (
                    <KanbanCard
                      key={ap.id_apresentacao}
                      apresentacao={ap}
                      grupo={grupo}
                      avaliacao={avaliacao}
                      onOpenEvaluation={onOpenEvaluation}
                      onUpdateStatus={onUpdateStatus}
                    />
                  );
                })
              ) : (
                <div className="empty-state">
                  <Inbox size={32} className="empty-state-icon" />
                  <p>Nenhuma atividade nesta coluna</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
