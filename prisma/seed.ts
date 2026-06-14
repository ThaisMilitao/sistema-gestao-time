
import { PrismaClient, TaskStatus, Priority } from "@prisma/client";

import "dotenv/config"; 
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';                    

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const now = new Date();

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

async function main() {
  await prisma.task.deleteMany();
  await prisma.member.deleteMany();

  console.log("Criando membros do time da Ricardo Tech...");

  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: "Ricardo Mendes",
        email: "ricardo@ricardotech.com.br",
        role: "CEO / Fundador",
      },
    }),
    prisma.member.create({
      data: {
        name: "Ana Paula Lima",
        email: "ana@ricardotech.com.br",
        role: "Gerente de Importação e Logística",
      },
    }),
    prisma.member.create({
      data: {
        name: "Bruno Ferreira",
        email: "bruno@ricardotech.com.br",
        role: "Desenvolvedor / Tech Lead",
      },
    }),
    prisma.member.create({
      data: {
        name: "Carla Souza",
        email: "carla@ricardotech.com.br",
        role: "Analista de Marketing e Design",
      },
    }),
    prisma.member.create({
      data: {
        name: "Diego Alves",
        email: "diego@ricardotech.com.br",
        role: "Assistente Operacional de Estoque",
      },
    }),
    prisma.member.create({
      data: {
        name: "Fernanda Castro",
        email: "fernanda@ricardotech.com.br",
        role: "Analista de Compras Internacionais",
      },
    }),
    prisma.member.create({
      data: {
        name: "Gabriel Nunes",
        email: "gabriel@ricardotech.com.br",
        role: "Supervisor de Expedição e Despacho",
      },
    }),
    prisma.member.create({
      data: {
        name: "Helena Ramos",
        email: "helena@ricardotech.com.br",
        role: "Controladora Financeira",
      },
    }),
    prisma.member.create({
      data: {
        name: "Igor Teixeira",
        email: "igor@ricardotech.com.br",
        role: "Comercial / Negociação B2B",
      },
    }),
    prisma.member.create({
      data: {
        name: "Julia Moreira",
        email: "julia@ricardotech.com.br",
        role: "Suporte ao Cliente e Pós-Venda",
      },
    }),
  ]);

  const [ricardo, ana, bruno, carla, diego, fernanda, gabriel, helena, igor, julia] = members;

  const tasks = [
    // Ana Paula — Gerente de Importação (Sobrecarregada)
    {
      title: "Desembaraço aduaneiro do lote de Smartphones",
      description: "Revisar documentação junto ao despachante e ajustar Invoice para liberação na Receita.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: ana.id,
      dueDate: addDays(now, 1),
    },
    {
      title: "Alinhamento urgente com transportadora marítima",
      description: "Resolver atraso no container de componentes de PC vindos de Shenzhen.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      memberId: ana.id,
      dueDate: subDays(now, 1), // atrasada!
    },
    {
      title: "Consolidar relatório mensal de custos de frete (Landed Cost)",
      description: "Agrupar taxas portuárias, impostos e fretes de todas as cargas do mês.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      memberId: ana.id,
      dueDate: addDays(now, 2),
    },
    {
      title: "Revisar contrato de seguro de carga internacional",
      description: "Verificar cláusulas de sinistro para eletrônicos de alto valor.",
      status: TaskStatus.BLOCKED,
      priority: Priority.HIGH,
      memberId: ana.id,
      dueDate: addDays(now, 3),
    },
    {
      title: "Planejar layout da nova área de triagem de eletrônicos",
      description: "Definir espaço físico com foco em evitar estática (ESD) na chegada de placas.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      memberId: ana.id,
      dueDate: addDays(now, 5),
    },

    // Bruno — Tech Lead (Sobrecarregado)
    {
      title: "Ajustar integração da API de cálculo de frete internacional",
      description: "Corrigir bug no checkout do e-commerce que calcula peso cubado errado.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      memberId: bruno.id,
      dueDate: subDays(now, 2), // atrasada!
    },
    {
      title: "Homologar sistema ERP com novos códigos NCM",
      description: "Garantir que a emissão de nota de entrada de importação não rejeite na SEFAZ.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      memberId: bruno.id,
      dueDate: addDays(now, 4),
    },
    {
      title: "Monitorar deploy do novo painel de rastreio de pedidos",
      description: "Acompanhar estabilidade e atualizar banco de dados de tracking para o cliente final.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: bruno.id,
      dueDate: addDays(now, 1),
    },
    {
      title: "Corrigir queda de performance no banco de dados de produtos",
      description: "Identificar gargalo nas buscas da Black Friday antecipada.",
      status: TaskStatus.BLOCKED,
      priority: Priority.URGENT,
      memberId: bruno.id,
      dueDate: subDays(now, 3), // muito atrasada!
    },

    // Carla — Marketing/Design
    {
      title: "Finalizar criativos para lançamento dos novos Smartwatches",
      description: "Revisar artes de redes sociais e banners para a página principal.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: carla.id,
      dueDate: addDays(now, 3),
    },
    {
      title: "Aprovar identidade visual do catálogo B2B",
      description: "Enviar lâmina de produtos de tecnologia para aprovação do time comercial.",
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      memberId: carla.id,
      dueDate: subDays(now, 5),
      completedAt: subDays(now, 6),
    },
    {
      title: "Criar moodboard para campanha de Tech Acessórios",
      description: "Referências estéticas e paleta de cores focadas no público gamer.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      memberId: carla.id,
      dueDate: addDays(now, 7),
    },

    // Diego — Assistente de Estoque (Poucas tarefas)
    {
      title: "Atualizar planilha de estoque físico vs sistema",
      description: "Inserir dados da última contagem de mouses e teclados mecânicos.",
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      memberId: diego.id,
      dueDate: subDays(now, 3),
      completedAt: subDays(now, 4),
    },
    {
      title: "Organizar prateleiras de retorno de garantia (RMA)",
      description: "Separar produtos eletrônicos com defeito de fabricação para devolução ao fabricante.",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      memberId: diego.id,
      dueDate: addDays(now, 10),
    },

    // Fernanda — Compras Internacionais
    {
      title: "Cotação de novos mouses sem fio na China",
      description: "Negociar preço FOB com 3 fornecedores diferentes listados no Alibaba.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: fernanda.id,
      dueDate: addDays(now, 2),
    },
    {
      title: "Confirmar pagamento de sinal de Proforma Invoice",
      description: "Garantir o envio do comprovante Swift para o fornecedor iniciar a produção.",
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      memberId: fernanda.id,
      dueDate: subDays(now, 1),
      completedAt: subDays(now, 1),
    },
    {
      title: "Alinhamento sobre certificação ANATEL",
      description: "Reunir documentos técnicos do novo fone bluetooth para envio ao laboratório homologador.",
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      memberId: fernanda.id,
      dueDate: addDays(now, 6),
    },

    // Gabriel — Expedição
    {
      title: "Escalar equipe para mutirão de empacotamento - Promoção Relâmpago",
      description: "Organizar turnos extras para despachar os mais de 500 pedidos pendentes.",
      status: TaskStatus.DONE,
      priority: Priority.URGENT,
      memberId: gabriel.id,
      dueDate: subDays(now, 2),
      completedAt: subDays(now, 2),
    },
    {
      title: "Resolver divergência com o Mercado Envios / Correios",
      description: "Contestar pesagem errada de lote de fones que travou as etiquetas de postagem.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: gabriel.id,
      dueDate: addDays(now, 1),
    },
    {
      title: "Checklist de conferência de cargas recebidas do porto",
      description: "Bater notas fiscais de importação com o material físico que deu entrada na doca.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      memberId: gabriel.id,
      dueDate: now,
    },

    // Helena — Financeiro
    {
      title: "Fechamento de câmbio para fechamento de lote",
      description: "Analisar taxa do dólar e fechar contrato de câmbio para pagamento da fábrica de telas.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: helena.id,
      dueDate: addDays(now, 2),
    },
    {
      title: "Emitir Notas Fiscais de Entrada de Importação",
      description: "NFs de nacionalização das mercadorias que saíram do porto de Santos.",
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      memberId: helena.id,
      dueDate: subDays(now, 1),
      completedAt: subDays(now, 1),
    },
    {
      title: "Pagar taxa de armazenamento de container atrasado",
      status: TaskStatus.TODO,
      priority: Priority.URGENT,
      memberId: helena.id,
      dueDate: addDays(now, 0),
    },

    // Igor — Comercial / B2B
    {
      title: "Cotar lote corporativo de Notebooks para cliente VIP",
      description: "Preparar proposta de atacado para empresa de tecnologia que quer 50 unidades.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      memberId: igor.id,
      dueDate: addDays(now, 1),
    },
    {
      title: "Ajustar tabela de preços de atacado com base no novo dólar",
      description: "Subir margens de lucro de processadores e memórias RAM devido à alta da moeda.",
      status: TaskStatus.DONE,
      priority: Priority.MEDIUM,
      memberId: igor.id,
      dueDate: subDays(now, 3),
      completedAt: subDays(now, 3),
    },
    {
      title: "Prospectar novos revendedores em marketplaces regionais",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      memberId: igor.id,
      dueDate: addDays(now, 14),
    },

    // Julia — Suporte / Pós-Venda
    {
      title: "Follow-up com cliente corporativo sobre a entrega de tablets",
      description: "Garantir que o lote de 20 tablets chegou sem avarias de transporte.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      memberId: julia.id,
      dueDate: addDays(now, 1),
    },
    {
      title: "Responder contestação de garantia no Reclame Aqui",
      description: "Cliente alega defeito em placa de vídeo importada e quer estorno rápido.",
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      memberId: julia.id,
      dueDate: subDays(now, 1),
    },
    {
      title: "Atualizar central de ajuda do site com FAQ sobre RMA e Devoluções",
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      memberId: julia.id,
      dueDate: addDays(now, 10),
    },

    // Ricardo — CEO (Estratégico)
    {
      title: "Definir metas de faturamento e volume de importação para Q2",
      description: "Alinhar com compras, marketing e comercial os OKRs do próximo trimestre.",
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      memberId: ricardo.id,
      dueDate: addDays(now, 5),
    },
    {
      title: "Reunião de negócios com Banco XP — Financiamento de Comércio Exterior (Finimp)",
      status: TaskStatus.DONE,
      priority: Priority.URGENT,
      memberId: ricardo.id,
      dueDate: subDays(now, 4),
      completedAt: subDays(now, 4),
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log("Banco pronto!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });