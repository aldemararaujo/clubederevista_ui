import { createClient } from "@libsql/client/web";
import { schemaQueries, seedGrupos, seedAlunos, seedApresentacoes, seedAvaliacoes } from "./mockData.js";

// Inicializa o cliente do banco de dados Turso.
// Usamos o cliente web puro que é compatível com ambientes serverless (Netlify Functions/esbuild).
const client = createClient({
  url: process.env.TURSO_URL || "https://placeholder-db.turso.io",
  authToken: process.env.TURSO_TOKEN || "",
});

/**
 * Garante que a estrutura do banco e dados mock iniciais estejam criados.
 */
async function ensureDatabaseInitialized() {
  try {
    // Verifica se a tabela 'grupos' já existe
    const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='grupos'");
    if (res.rows.length === 0) {
      console.log("Banco de dados vazio. Inicializando tabelas...");
      
      // Criação das tabelas do esquema
      const schemaOps = schemaQueries.map(q => ({ sql: q, args: [] }));
      await client.batch(schemaOps, "write");
      
      console.log("Tabelas criadas. Inserindo dados mock iniciais...");
      
      // Inserção dos dados iniciais
      const seedOps = [];
      
      seedGrupos.forEach(g => {
        seedOps.push({
          sql: "INSERT INTO grupos (id_grupo, nome, tema_foco) VALUES (?, ?, ?)",
          args: [g.id, g.nome, g.tema]
        });
      });
      
      seedAlunos.forEach(a => {
        seedOps.push({
          sql: "INSERT INTO alunos (id_aluno, nome, email, id_grupo) VALUES (?, ?, ?, ?)",
          args: [a.id, a.nome, a.email, a.grupo]
        });
      });
      
      seedApresentacoes.forEach(ap => {
        seedOps.push({
          sql: "INSERT INTO apresentacoes (id_apresentacao, id_grupo, data_agendada, titulo_artigo, link_artigo, link_slides, status_atividade) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [ap.id, ap.grupo, ap.data, ap.titulo, ap.link_artigo, ap.link_slides, ap.status]
        });
      });
      
      seedAvaliacoes.forEach(av => {
        seedOps.push({
          sql: "INSERT INTO avaliacoes (id_avaliacao, id_apresentacao, nota_metodologia, nota_exposicao, feedback) VALUES (?, ?, ?, ?, ?)",
          args: [av.id, av.apresentacao, av.nota_metodologia, av.nota_exposicao, av.feedback]
        });
      });
      
      await client.batch(seedOps, "write");
      console.log("Banco de dados inicializado e sementes inseridas.");
    }
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error);
    throw error;
  }
}

/**
 * Handler principal da Netlify Function
 */
export async function handler(event, context) {
  // Configuração básica do CORS para evitar bloqueios no ambiente de desenvolvimento
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Responde requisições OPTIONS prévias (preflight)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Inicializa o banco de dados de maneira sob demanda na primeira chamada
  try {
    await ensureDatabaseInitialized();
  } catch (dbError) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erro de conexão/inicialização do banco de dados.", details: dbError.message })
    };
  }

  // Roteamento baseado no final da URL
  const path = event.path || "";
  const method = event.httpMethod;

  try {
    // 1. GET /api/data -> Retorna todos os dados para popular a SPA
    if (path.endsWith("/data") && method === "GET") {
      const grupos = await client.execute("SELECT * FROM grupos");
      const alunos = await client.execute("SELECT * FROM alunos");
      const apresentacoes = await client.execute("SELECT * FROM apresentacoes");
      const avaliacoes = await client.execute("SELECT * FROM avaliacoes");

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          grupos: grupos.rows,
          alunos: alunos.rows,
          apresentacoes: apresentacoes.rows,
          avaliacoes: avaliacoes.rows
        })
      };
    }

    // 2. POST /api/update-status -> Atualiza o status de uma apresentação
    if (path.endsWith("/update-status") && method === "POST") {
      const { id_apresentacao, status_atividade } = JSON.parse(event.body || "{}");

      if (!id_apresentacao || !status_atividade) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Parâmetros id_apresentacao e status_atividade são obrigatórios." })
        };
      }

      await client.execute({
        sql: "UPDATE apresentacoes SET status_atividade = ? WHERE id_apresentacao = ?",
        args: [status_atividade, id_apresentacao]
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Status de atividade atualizado com sucesso." })
      };
    }

    // 3. POST /api/save-evaluation -> Salva ou atualiza a avaliação e muda o status da apresentação para 'Finalizado'
    if (path.endsWith("/save-evaluation") && method === "POST") {
      const { id_apresentacao, nota_metodologia, nota_exposicao, feedback } = JSON.parse(event.body || "{}");

      if (!id_apresentacao) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "O parâmetro id_apresentacao é obrigatório." })
        };
      }

      // Converte notas para número flutuante
      const nMetodologia = parseFloat(nota_metodologia) || 0;
      const nExposicao = parseFloat(nota_exposicao) || 0;
      const fback = feedback || "";

      // Verifica se já existe uma avaliação
      const checkRes = await client.execute({
        sql: "SELECT id_avaliacao FROM avaliacoes WHERE id_apresentacao = ?",
        args: [id_apresentacao]
      });

      if (checkRes.rows.length > 0) {
        // Atualiza a avaliação existente
        const id_avaliacao = checkRes.rows[0].id_avaliacao;
        await client.execute({
          sql: "UPDATE avaliacoes SET nota_metodologia = ?, nota_exposicao = ?, feedback = ? WHERE id_avaliacao = ?",
          args: [nMetodologia, nExposicao, fback, id_avaliacao]
        });
      } else {
        // Cria uma nova avaliação com ID único
        const id_avaliacao = "av_" + Math.random().toString(36).substr(2, 9);
        await client.execute({
          sql: "INSERT INTO avaliacoes (id_avaliacao, id_apresentacao, nota_metodologia, nota_exposicao, feedback) VALUES (?, ?, ?, ?, ?)",
          args: [id_avaliacao, id_apresentacao, nMetodologia, nExposicao, fback]
        });
      }

      // Força a atualização do status da apresentação correspondente para 'Finalizado'
      await client.execute({
        sql: "UPDATE apresentacoes SET status_atividade = 'Finalizado' WHERE id_apresentacao = ?",
        args: [id_apresentacao]
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Avaliação registrada com sucesso e status atualizado para 'Finalizado'." })
      };
    }

    // 4. POST /api/reset -> Reseta o banco de dados e repopula (útil para testes do professor)
    if (path.endsWith("/reset") && method === "POST") {
      await client.execute("DROP TABLE IF EXISTS avaliacoes");
      await client.execute("DROP TABLE IF EXISTS apresentacoes");
      await client.execute("DROP TABLE IF EXISTS alunos");
      await client.execute("DROP TABLE IF EXISTS grupos");

      await ensureDatabaseInitialized();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Banco de dados reinicializado com sucesso." })
      };
    }

    // Retorna erro se a rota não se adequar
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Rota de API não suportada: ${path}` })
    };

  } catch (err) {
    console.error("Erro interno no handler da API:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erro interno do servidor backend.", details: err.message })
    };
  }
}
