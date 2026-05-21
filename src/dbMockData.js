// Dados de exemplo (Mock Data) para o Clube de Revista UNCISAL
// Contém temas médicos reais e estrutura alinhada com as tabelas do banco de dados.

export const mockGrupos = [
  {
    id_grupo: "grupo_1",
    nome: "Grupo 1",
    tema_foco: "Cardiologia & Terapia Antitrombótica"
  },
  {
    id_grupo: "grupo_2",
    nome: "Grupo 2",
    tema_foco: "Neurologia & AVC Isquêmico"
  },
  {
    id_grupo: "grupo_3",
    nome: "Grupo 3",
    tema_foco: "Oncologia & Imunoterapia"
  },
  {
    id_grupo: "grupo_4",
    nome: "Grupo 4",
    tema_foco: "Endocrinologia & Controle de Obesidade"
  },
  {
    id_grupo: "grupo_5",
    nome: "Grupo 5",
    tema_foco: "Pediatria & Epidemiologia de Vacinas"
  }
];

export const mockAlunos = [
  // Alunos Grupo 1
  {
    id_aluno: "aluno_1",
    nome: "Ana Carolina Santos",
    email: "ana.santos@uncisal.edu.br",
    id_grupo: "grupo_1"
  },
  {
    id_aluno: "aluno_2",
    nome: "Bruno Oliveira Melo",
    email: "bruno.melo@uncisal.edu.br",
    id_grupo: "grupo_1"
  },
  // Alunos Grupo 2
  {
    id_aluno: "aluno_3",
    nome: "Camila Ferreira Lima",
    email: "camila.lima@uncisal.edu.br",
    id_grupo: "grupo_2"
  },
  {
    id_aluno: "aluno_4",
    nome: "Daniel Silva Costa",
    email: "daniel.costa@uncisal.edu.br",
    id_grupo: "grupo_2"
  },
  // Alunos Grupo 3
  {
    id_aluno: "aluno_5",
    nome: "Eduardo Sousa Rocha",
    email: "eduardo.rocha@uncisal.edu.br",
    id_grupo: "grupo_3"
  },
  {
    id_aluno: "aluno_6",
    nome: "Fernanda Alencar Cruz",
    email: "fernanda.cruz@uncisal.edu.br",
    id_grupo: "grupo_3"
  },
  // Alunos Grupo 4
  {
    id_aluno: "aluno_7",
    nome: "Gabriel Mendes Souza",
    email: "gabriel.souza@uncisal.edu.br",
    id_grupo: "grupo_4"
  },
  {
    id_aluno: "aluno_8",
    nome: "Helena Cavalcante Reis",
    email: "helena.reis@uncisal.edu.br",
    id_grupo: "grupo_4"
  },
  // Alunos Grupo 5
  {
    id_aluno: "aluno_9",
    nome: "Igor Ramos Nogueira",
    email: "igor.nogueira@uncisal.edu.br",
    id_grupo: "grupo_5"
  },
  {
    id_aluno: "aluno_10",
    nome: "Julia Farias Costa",
    email: "julia.costa@uncisal.edu.br",
    id_grupo: "grupo_5"
  }
];

export const mockApresentacoes = [
  {
    id_apresentacao: "ap_1",
    id_grupo: "grupo_1",
    data_agendada: "2026-05-18T14:00:00.000Z",
    titulo_artigo: "Terapia Antitrombótica em Pacientes com Fibrilação Atrial e Infarto do Miocárdio: Uma Metanálise Integrada",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa1908436",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQCardio/pub",
    status_atividade: "Finalizado"
  },
  {
    id_apresentacao: "ap_2",
    id_grupo: "grupo_2",
    data_agendada: "2026-05-21T10:00:00.000Z",
    titulo_artigo: "Eficácia da Trombectomia Mecânica em Acidente Vascular Cerebral Isquêmico Agudo com Grande Área de Infarto",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa2214403",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQNeuro/pub",
    status_atividade: "Em andamento"
  },
  {
    id_apresentacao: "ap_3",
    id_grupo: "grupo_3",
    data_agendada: "2026-05-28T09:30:00.000Z",
    titulo_artigo: "Imunoterapia Combinada com Quimioterapia no Tratamento de Primeira Linha do Câncer de Pulmão de Células Não Pequenas",
    link_artigo: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00123-X/fulltext",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQOnco/pub",
    status_atividade: "Parado"
  },
  {
    id_apresentacao: "ap_4",
    id_grupo: "grupo_4",
    data_agendada: "2026-06-04T11:00:00.000Z",
    titulo_artigo: "Semaglutida Semanal vs. Placebo no Controle do Peso e Risco Cardiovascular em Adultos com Obesidade (Estudo STEP)",
    link_artigo: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQEndo/pub",
    status_atividade: "Parado"
  },
  {
    id_apresentacao: "ap_5",
    id_grupo: "grupo_5",
    data_agendada: "2026-06-11T14:00:00.000Z",
    titulo_artigo: "Vacinação contra Rotavírus e Redução das Internações por Gastroenterite Aguda na População Pediátrica do Nordeste",
    link_artigo: "https://www.who.int/publications/i/item/WHO-IVB-19.01",
    link_slides: "https://docs.google.com/presentation/d/e/2PACX-1vQPedia/pub",
    status_atividade: "Parado"
  }
];

export const mockAvaliacoes = [
  {
    id_avaliacao: "av_1",
    id_apresentacao: "ap_1",
    nota_metodologia: 9.5,
    nota_exposicao: 9.0,
    feedback: "Excelente apresentação. O grupo dominou a metodologia de metanálise e soube detalhar os critérios de exclusão dos artigos incluídos. Como ponto de melhoria, poderiam ter aprofundado a discussão sobre o risco de viés de publicação, mas a postura científica e a clareza didática foram exemplares."
  }
];
