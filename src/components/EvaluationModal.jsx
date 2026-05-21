import React, { useState, useEffect } from "react";
import { X, Users, Award, MessageSquare, Plus, Save, BookOpen } from "lucide-react";

/**
 * Modal de avaliação e notas para as apresentações do Clube de Revista.
 */
export default function EvaluationModal({
  apresentacao,
  grupo,
  alunos,
  avaliacaoExistente,
  onClose,
  onSave,
  onSaveMetadata
}) {
  // Estados para o formulário
  const [notaMetodologia, setNotaMetodologia] = useState("");
  const [notaExposicao, setNotaExposicao] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados para edição dos detalhes da apresentação (artigo/links)
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitulo, setEditTitulo] = useState(apresentacao.titulo_artigo || "");
  const [editLinkArtigo, setEditLinkArtigo] = useState(apresentacao.link_artigo || "");
  const [editLinkSlides, setEditLinkSlides] = useState(apresentacao.link_slides || "");
  const [editData, setEditData] = useState("");

  // Estados adicionais para edição de grupo e alunos
  const [editGrupoNome, setEditGrupoNome] = useState(grupo?.nome || "");
  const [editGrupoTema, setEditGrupoTema] = useState(grupo?.tema_foco || "");
  const [editAlunos, setEditAlunos] = useState(alunos || []);

  // Atualiza os estados locais quando a apresentação, grupo ou alunos mudam
  useEffect(() => {
    setEditTitulo(apresentacao.titulo_artigo || "");
    setEditLinkArtigo(apresentacao.link_artigo || "");
    setEditLinkSlides(apresentacao.link_slides || "");
    setEditGrupoNome(grupo?.nome || "");
    setEditGrupoTema(grupo?.tema_foco || "");
    setEditAlunos(alunos || []);
    
    if (apresentacao.data_agendada) {
      try {
        const d = new Date(apresentacao.data_agendada);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        setEditData(localDate.toISOString().slice(0, 16));
      } catch (e) {
        setEditData("");
      }
    } else {
      setEditData("");
    }
  }, [apresentacao, grupo, alunos]);

  const handleStudentNameChange = (id_aluno, novoNome) => {
    setEditAlunos((prev) =>
      prev.map((al) => (al.id_aluno === id_aluno ? { ...al, nome: novoNome } : al))
    );
  };

  // Popula o formulário com dados de notas existentes (se houver) ao abrir/mudar
  useEffect(() => {
    if (avaliacaoExistente) {
      setNotaMetodologia(avaliacaoExistente.nota_metodologia?.toString() || "");
      setNotaExposicao(avaliacaoExistente.nota_exposicao?.toString() || "");
      setFeedback(avaliacaoExistente.feedback || "");
    } else {
      setNotaMetodologia("");
      setNotaExposicao("");
      setFeedback("");
    }
  }, [avaliacaoExistente, apresentacao]);

  const handleSaveMeta = () => {
    onSaveMetadata({
      id_apresentacao: apresentacao.id_apresentacao,
      titulo_artigo: editTitulo,
      link_artigo: editLinkArtigo,
      link_slides: editLinkSlides,
      data_agendada: editData ? new Date(editData).toISOString() : apresentacao.data_agendada,
      grupo: {
        id_grupo: grupo?.id_grupo,
        nome: editGrupoNome,
        tema_foco: editGrupoTema
      },
      alunos: editAlunos
    });
    setIsEditingMeta(false);
  };

  // Calcula a média em tempo real para auxiliar o professor
  const calcularMedia = () => {
    const nMet = parseFloat(notaMetodologia);
    const nExp = parseFloat(notaExposicao);
    if (!isNaN(nMet) && !isNaN(nExp)) {
      return ((nMet + nExp) / 2).toFixed(2);
    }
    return null;
  };

  // Frases de feedback rápido para aumentar a produtividade
  const templatesFeedback = [
    { label: "Postura e Didática", texto: "Excelente postura profissional e clareza de exposição do tema." },
    { label: "Domínio Metodológico", texto: "O grupo demonstrou excelente compreensão do desenho metodológico e dos critérios de seleção." },
    { label: "Discussão de Limitações", texto: "Recomenda-se aprofundar na discussão de vieses e limitações inerentes ao estudo original." },
    { label: "Qualidade dos Slides", texto: "Slides muito bem estruturados, concisos e com boa carga visual de apoio." },
    { label: "Discussão Clínica", texto: "Excelente correlação feita pelo grupo entre os achados estatísticos e a prática clínica diária." }
  ];

  // Insere um template no final ou na posição atual do feedback
  const inserirFeedbackTemplate = (texto) => {
    setFeedback((prev) => {
      const separador = prev.trim() === "" ? "" : " \n";
      return prev + separador + textToAppend(texto);
    });
  };

  // Garante que o texto de feedback não fique duplicado
  const textToAppend = (texto) => {
    if (feedback.includes(texto)) return "";
    return texto;
  };

  // Adiciona formatação Markdown rápida
  const aplicarFormatacao = (prefixo, sufixo = "") => {
    const textarea = document.getElementById("feedback-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = prefixo + selectedText + sufixo;

    setFeedback(
      text.substring(0, start) + replacement + text.substring(end)
    );
    
    // Devolve o foco e ajusta seleção
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefixo.length, start + prefixo.length + selectedText.length);
    }, 50);
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        id_apresentacao: apresentacao.id_apresentacao,
        nota_metodologia: parseFloat(notaMetodologia) || 0,
        nota_exposicao: parseFloat(notaExposicao) || 0,
        feedback: feedback
      });
    } catch (err) {
      console.error("Erro ao salvar avaliação no modal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="modal-header">
          <div className="modal-title-container">
            <h3>Ficha de Arguição</h3>
            <span className="modal-subtitle">
              {grupo?.nome} &bull; {grupo?.tema_foco}
            </span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Título do Artigo */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.01)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <BookOpen size={18} style={{ color: "var(--primary)" }} />
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Detalhes da Apresentação:</strong>
                </div>
                <button
                  type="button"
                  style={{ fontSize: "0.75rem", color: "var(--primary)", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px" }}
                  onClick={() => setIsEditingMeta(!isEditingMeta)}
                >
                  {isEditingMeta ? "Cancelar Edição" : "Editar Detalhes/Membros"}
                </button>
              </div>
              
              {!isEditingMeta ? (
                <div style={{ marginTop: "4px" }}>
                  <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "var(--text-primary)" }}>
                    {apresentacao.titulo_artigo || "Sem artigo cadastrado"}
                  </p>
                  <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.8rem" }}>
                    {apresentacao.link_artigo && (
                      <a href={apresentacao.link_artigo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center" }}>
                        Ver Artigo Original
                      </a>
                    )}
                    {apresentacao.link_slides && (
                      <a href={apresentacao.link_slides} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center" }}>
                        Ver Slides da Apresentação
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", width: "100%" }}>
                  <div className="input-group" style={{ margin: "0" }}>
                    <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Título do Artigo</label>
                    <input
                      type="text"
                      className="input-field"
                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      placeholder="Título completo do artigo..."
                    />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div className="input-group" style={{ margin: "0" }}>
                      <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Link do Artigo</label>
                      <input
                        type="url"
                        className="input-field"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                        value={editLinkArtigo}
                        onChange={(e) => setEditLinkArtigo(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="input-group" style={{ margin: "0" }}>
                      <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Link dos Slides</label>
                      <input
                        type="url"
                        className="input-field"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                        value={editLinkSlides}
                        onChange={(e) => setEditLinkSlides(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ margin: "0" }}>
                    <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Data e Hora da Apresentação</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                      value={editData}
                      onChange={(e) => setEditData(e.target.value)}
                    />
                  </div>

                  {/* Seção de Edição do Grupo e Alunos */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
                    <div className="input-group" style={{ margin: "0" }}>
                      <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Nome do Grupo</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                        value={editGrupoNome}
                        onChange={(e) => setEditGrupoNome(e.target.value)}
                        placeholder="Nome do grupo..."
                      />
                    </div>
                    <div className="input-group" style={{ margin: "0" }}>
                      <label className="input-label" style={{ fontSize: "0.75rem", marginBottom: "4px" }}>Tema de Foco</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                        value={editGrupoTema}
                        onChange={(e) => setEditGrupoTema(e.target.value)}
                        placeholder="Tema científico..."
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px dashed var(--border-color)", paddingTop: "8px" }}>
                    <label className="input-label" style={{ fontSize: "0.75rem", fontWeight: "bold" }}>Membros do Grupo (Nomes)</label>
                    {editAlunos.map((al, idx) => (
                      <div key={al.id_aluno} className="input-group" style={{ margin: "0" }}>
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                          value={al.nome}
                          onChange={(e) => handleStudentNameChange(al.id_aluno, e.target.value)}
                          placeholder={`Nome do Aluno ${idx + 1}...`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ alignSelf: "flex-end", padding: "0.4rem 0.8rem", fontSize: "0.8rem", height: "auto" }}
                    onClick={handleSaveMeta}
                  >
                    Salvar Detalhes
                  </button>
                </div>
              )}
            </div>

            {/* Seção Alunos */}
            <div>
              <div className="modal-section-title">
                <Users size={14} />
                <span>Alunos do Grupo</span>
              </div>
              <div className="student-list">
                {alunos.length > 0 ? (
                  alunos.map((aluno) => (
                    <div key={aluno.id_aluno} className="student-item">
                      <div className="student-avatar">
                        {aluno.nome.charAt(0)}
                      </div>
                      <div className="student-info">
                        <span className="student-name">{aluno.nome}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    Nenhum aluno cadastrado neste grupo.
                  </div>
                )}
              </div>
            </div>

            {/* Seção Notas */}
            <div>
              <div className="modal-section-title">
                <Award size={14} />
                <span>Avaliação de Notas</span>
              </div>
              
              <div className="evaluation-inputs-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="nota-metodologia">
                    Nota de Metodologia (0 - 10)
                  </label>
                  <input
                    id="nota-metodologia"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    placeholder="Ex: 9.5"
                    className="input-field"
                    value={notaMetodologia}
                    onChange={(e) => setNotaMetodologia(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="nota-exposicao">
                    Nota de Exposição (0 - 10)
                  </label>
                  <input
                    id="nota-exposicao"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    required
                    placeholder="Ex: 9.0"
                    className="input-field"
                    value={notaExposicao}
                    onChange={(e) => setNotaExposicao(e.target.value)}
                  />
                </div>
              </div>

              {/* Média Calculada em Tempo Real */}
              {calcularMedia() && (
                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Média Calculada:</span>
                  <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--success)", fontFamily: "var(--font-title)", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                    {calcularMedia()}
                  </span>
                </div>
              )}
            </div>

            {/* Seção Feedback */}
            <div>
              <div className="modal-section-title">
                <MessageSquare size={14} />
                <span>Feedback Construtivo</span>
              </div>

              {/* Editor Rico Simples */}
              <div className="rich-feedback-container">
                <div className="feedback-toolbar">
                  <button type="button" className="toolbar-btn" onClick={() => aplicarFormatacao("**", "**")} title="Negrito">
                    B
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => aplicarFormatacao("*", "*")} title="Itálico">
                    I
                  </button>
                  <button type="button" className="toolbar-btn" onClick={() => aplicarFormatacao("- ", "")} title="Lista de Tópicos">
                    &bull;
                  </button>
                  <span style={{ borderLeft: "1px solid var(--border-color)", margin: "0 4px" }}></span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", paddingLeft: "4px" }}>
                    Editor Markdown
                  </span>
                </div>
                
                <textarea
                  id="feedback-textarea"
                  className="feedback-textarea"
                  placeholder="Escreva aqui sugestões, melhorias e análises sobre a apresentação dos estudantes..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  maxLength={1000}
                />
              </div>

              {/* Sugestões Rápidas de Feedback (Aumento de Produtividade) */}
              <div style={{ marginTop: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500", display: "block", marginBottom: "0.35rem" }}>
                  Templates de Avaliação Rápida (Clique para inserir):
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {templatesFeedback.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => inserirFeedbackTemplate(template.texto)}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-secondary)",
                        fontSize: "0.7rem",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(0, 210, 255, 0.05)";
                        e.target.style.borderColor = "var(--primary)";
                        e.target.style.color = "var(--primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.03)";
                        e.target.style.borderColor = "var(--border-color)";
                        e.target.style.color = "var(--text-secondary)";
                      }}
                    >
                      <Plus size={10} />
                      <span>{template.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicador de que a ação finaliza a apresentação */}
            {apresentacao.status_atividade !== "Finalizado" && (
              <div className="status-indicator-bar" style={{ marginTop: "0.25rem" }}>
                <span className="indicator-text">Mudar Status para:</span>
                <span className="indicator-val finalizado">✓ Finalizado</span>
              </div>
            )}

          </div>

          {/* Rodapé do Modal */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              <Save size={16} />
              <span>{isSaving ? "Salvando..." : "Salvar Avaliação"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
