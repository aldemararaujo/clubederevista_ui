// Dados mock e SQL de inicialização do banco de dados Turso (SQLite)
// Este arquivo é usado pela Netlify Function para popular o banco de dados se ele estiver vazio.

export const schemaQueries = [
  `CREATE TABLE IF NOT EXISTS grupos (
    id_grupo TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    tema_foco TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS alunos (
    id_aluno TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    id_grupo TEXT,
    FOREIGN KEY(id_grupo) REFERENCES grupos(id_grupo)
  )`,
  `CREATE TABLE IF NOT EXISTS apresentacoes (
    id_apresentacao TEXT PRIMARY KEY,
    id_grupo TEXT NOT NULL,
    data_agendada TEXT NOT NULL,
    titulo_artigo TEXT,
    link_artigo TEXT,
    link_slides TEXT,
    status_atividade TEXT DEFAULT 'Parado',
    FOREIGN KEY(id_grupo) REFERENCES grupos(id_grupo)
  )`,
  `CREATE TABLE IF NOT EXISTS avaliacoes (
    id_avaliacao TEXT PRIMARY KEY,
    id_apresentacao TEXT NOT NULL,
    nota_metodologia REAL,
    nota_exposicao REAL,
    feedback TEXT,
    FOREIGN KEY(id_apresentacao) REFERENCES apresentacoes(id_apresentacao)
  )`
];

export const seedGrupos = [
  { id: "grupo_1", nome: "Grupo 1", tema: "" },
  { id: "grupo_2", nome: "Grupo 2", tema: "" },
  { id: "grupo_3", nome: "Grupo 3", tema: "" },
  { id: "grupo_4", nome: "Grupo 4", tema: "" },
  { id: "grupo_5", nome: "Grupo 5", tema: "" },
  { id: "grupo_6", nome: "Grupo 6", tema: "" },
  { id: "grupo_7", nome: "Grupo 7", tema: "" },
  { id: "grupo_8", nome: "Grupo 8", tema: "" }
];

export const seedAlunos = [
  // Grupo 1
  { id: "aluno_1", nome: "LEANDRO ROCHA", grupo: "grupo_1" },
  { id: "aluno_2", nome: "MARIA LETICIA", grupo: "grupo_1" },
  { id: "aluno_3", nome: "WILLIAM", grupo: "grupo_1" },
  { id: "aluno_4", nome: "AALIYAH", grupo: "grupo_1" },
  { id: "aluno_5", nome: "CLARA", grupo: "grupo_1" },
  // Grupo 2
  { id: "aluno_6", nome: "JULIA", grupo: "grupo_2" },
  { id: "aluno_7", nome: "VALQUIRIA", grupo: "grupo_2" },
  { id: "aluno_8", nome: "EVILLY", grupo: "grupo_2" },
  { id: "aluno_9", nome: "AQUILLES", grupo: "grupo_2" },
  { id: "aluno_10", nome: "LARYSSA", grupo: "grupo_2" },
  // Grupo 3
  { id: "aluno_11", nome: "LETÍCIA", grupo: "grupo_3" },
  { id: "aluno_12", nome: "EDUARDO", grupo: "grupo_3" },
  { id: "aluno_13", nome: "ESTEVAO", grupo: "grupo_3" },
  { id: "aluno_14", nome: "SARAH", grupo: "grupo_3" },
  { id: "aluno_15", nome: "MARIA EDUARDA", grupo: "grupo_3" },
  // Grupo 4
  { id: "aluno_16", nome: "ANNA", grupo: "grupo_4" },
  { id: "aluno_17", nome: "TIAGO", grupo: "grupo_4" },
  { id: "aluno_18", nome: "ANA", grupo: "grupo_4" },
  { id: "aluno_19", nome: "LEANDRO MARCELLUS", grupo: "grupo_4" },
  { id: "aluno_20", nome: "KENZO", grupo: "grupo_4" },
  // Grupo 5
  { id: "aluno_21", nome: "DANIEL", grupo: "grupo_5" },
  { id: "aluno_22", nome: "SUZANA", grupo: "grupo_5" },
  { id: "aluno_23", nome: "MARIA BEATRIZ", grupo: "grupo_5" },
  { id: "aluno_24", nome: "KAILANE", grupo: "grupo_5" },
  { id: "aluno_25", nome: "GIOVANNA FERREIRA", grupo: "grupo_5" },
  // Grupo 6
  { id: "aluno_26", nome: "ARTUR", grupo: "grupo_6" },
  { id: "aluno_27", nome: "NATIEL", grupo: "grupo_6" },
  { id: "aluno_28", nome: "SAMARA", grupo: "grupo_6" },
  { id: "aluno_29", nome: "WESLLEY", grupo: "grupo_6" },
  { id: "aluno_30", nome: "ÁBDA", grupo: "grupo_6" },
  { id: "aluno_31", nome: "ANA BEATRIZ", grupo: "grupo_6" },
  // Grupo 7
  { id: "aluno_32", nome: "SAMUEL", grupo: "grupo_7" },
  { id: "aluno_33", nome: "FERNANDA", grupo: "grupo_7" },
  { id: "aluno_34", nome: "GIOVANA QUEIROZ", grupo: "grupo_7" },
  { id: "aluno_35", nome: "JULIANO", grupo: "grupo_7" },
  { id: "aluno_36", nome: "LEONARDO", grupo: "grupo_7" },
  // Grupo 8
  { id: "aluno_37", nome: "MIRELLA", grupo: "grupo_8" },
  { id: "aluno_38", nome: "CAMILLY", grupo: "grupo_8" },
  { id: "aluno_39", nome: "HELOISA RAFAELA", grupo: "grupo_8" },
  { id: "aluno_40", nome: "NATHALIA", grupo: "grupo_8" },
  { id: "aluno_41", nome: "MICKAEL", grupo: "grupo_8" }
];

export const seedApresentacoes = [
  { id: "ap_1", grupo: "grupo_1", data: "2026-05-25T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_2", grupo: "grupo_2", data: "2026-05-26T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_3", grupo: "grupo_3", data: "2026-05-27T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_4", grupo: "grupo_4", data: "2026-05-28T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_5", grupo: "grupo_5", data: "2026-05-29T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_6", grupo: "grupo_6", data: "2026-06-01T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_7", grupo: "grupo_7", data: "2026-06-02T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" },
  { id: "ap_8", grupo: "grupo_8", data: "2026-06-03T14:00:00.000Z", titulo: "", link_artigo: "", link_slides: "", status: "Parado" }
];

export const seedAvaliacoes = [];
