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
    email TEXT NOT NULL,
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
  { id: "grupo_1", nome: "Grupo 1", tema: "Cardiologia & Terapia Antitrombótica" },
  { id: "grupo_2", nome: "Grupo 2", tema: "Neurologia & AVC Isquêmico" },
  { id: "grupo_3", nome: "Grupo 3", tema: "Oncologia & Imunoterapia" },
  { id: "grupo_4", nome: "Grupo 4", tema: "Endocrinologia & Controle de Obesidade" },
  { id: "grupo_5", nome: "Grupo 5", tema: "Pediatria & Epidemiologia de Vacinas" }
];

export const seedAlunos = [
  { id: "aluno_1", nome: "Ana Carolina Santos", email: "ana.santos@uncisal.edu.br", grupo: "grupo_1" },
  { id: "aluno_2", nome: "Bruno Oliveira Melo", email: "bruno.melo@uncisal.edu.br", grupo: "grupo_1" },
  { id: "aluno_3", nome: "Camila Ferreira Lima", email: "camila.lima@uncisal.edu.br", grupo: "grupo_2" },
  { id: "aluno_4", nome: "Daniel Silva Costa", email: "daniel.costa@uncisal.edu.br", grupo: "grupo_2" },
  { id: "aluno_5", nome: "Eduardo Sousa Rocha", email: "eduardo.rocha@uncisal.edu.br", grupo: "grupo_3" },
  { id: "aluno_6", nome: "Fernanda Alencar Cruz", email: "fernanda.cruz@uncisal.edu.br", grupo: "grupo_3" },
  { id: "aluno_7", nome: "Gabriel Mendes Souza", email: "gabriel.souza@uncisal.edu.br", grupo: "grupo_4" },
  { id: "aluno_8", nome: "Helena Cavalcante Reis", email: "helena.reis@uncisal.edu.br", grupo: "grupo_4" },
  { id: "aluno_9", nome: "Igor Ramos Nogueira", email: "igor.nogueira@uncisal.edu.br", grupo: "grupo_5" },
  { id: "aluno_10", nome: "Julia Farias Costa", email: "julia.costa@uncisal.edu.br", grupo: "grupo_5" }
];

export const seedApresentacoes = [
  {
    id: "ap_1",
    grupo: "grupo_1",
    data: "2026-05-18T14:00:00.000Z",
    titulo: "Terapia Antitrombótica em Pacientes com Fibrilação Atrial e Infarto do Miocárdio: Uma Metanálise Integrada",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa1908436",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQCardio/pub",
    status: "Finalizado"
  },
  {
    id: "ap_2",
    grupo: "grupo_2",
    data: "2026-05-21T10:00:00.000Z",
    titulo: "Eficácia da Trombectomia Mecânica em Acidente Vascular Cerebral Isquêmico Agudo com Grande Área de Infarto",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa2214403",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQNeuro/pub",
    status: "Em andamento"
  },
  {
    id: "ap_3",
    grupo: "grupo_3",
    data: "2026-05-28T09:30:00.000Z",
    titulo: "Imunoterapia Combinada com Quimioterapia no Tratamento de Primeira Linha do Câncer de Pulmão de Células Não Pequenas",
    link_artigo: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00123-X/fulltext",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQOnco/pub",
    status: "Parado"
  },
  {
    id: "ap_4",
    grupo: "grupo_4",
    data: "2026-06-04T11:00:00.000Z",
    titulo: "Semaglutida Semanal vs. Placebo no Controle do Peso e Risco Cardiovascular em Adultos com Obesidade (Estudo STEP)",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQEndo/pub",
    status: "Parado"
  },
  {
    id: "ap_5",
    grupo: "grupo_5",
    data: "2026-06-11T14:00:00.000Z",
    titulo: "Vacinação contra Rotavírus e Redução das Internações por Gastroenterite Aguda na População Pediátrica do Nordeste",
    link_artigo: "https://www.who.int/publications/i/item/WHO-IVB-19.01",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQPedia/pub",
    status: "Parado"
  }
];

export const seedAvaliacoes = [
  {
    id: "av_1",
    apresentacao: "ap_1",
    nota_metodologia: 9.5,
    nota_exposicao: 9.0,
    feedback: "Excelente apresentação. O grupo dominou a metodologia de metanálise e soube detalhar os critérios de exclusão dos artigos incluídos. Como ponto de melhoria, poderiam ter aprofundado a discussão sobre o risco de viés de publicação, mas a postura científica e a clareza didática foram exemplares."
  }
];
