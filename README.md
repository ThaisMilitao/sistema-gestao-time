# Gestão de Atividades do Time

Ferramenta de gestão de atividades construída para dono de PME que precisa enxergar o trabalho do time sem depender de planilha, WhatsApp ou intuição.

---

## Como rodar

### Docker

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) instalado.

```bash
git clone https://github.com/ThaisMilitao/sistema-gestao-time.git

cd sistema-gestao-time

# Sobe banco + app + popula com dados de exemplo
docker compose up --build
```

Aguarde ~1 min no primeiro build. Acesse: **http://localhost:3000**


## Metodologia escolhida: Kanban com alertas proativos

### Por que Kanban?

O dono tem quatro dores concretas

| Dor do dono | Metodologia mais aderente |
|---|---|
| "Não sei o que está em andamento de verdade" | **Kanban** — visibilidade de fluxo|
| "Tem gente afogada e gente ociosa" | **Distribuição de carga** (adaptação de Kanban WIP limits) |
| "Prazo estoura e eu só fico sabendo depois" | **Alertas proativos** |
| "Reunião de segunda sem número nenhum" | **KPIs** (OKR simplificado) |

Kanban resolve bem o primeiro problema — visualizar o que existe e em que estado está. Os outros três são resolvidos com camadas adicionais: um dashboard de KPIs que respondem diretamente às dores, e alertas de prazo que aparecem *antes* de estourar, não depois.

---

## Indicadores (KPIs) e por que cada um existe

### 1. Taxa de sucesso de entregas (%)

> **Decisão que gera:** "Meu time entrega o que promete? Preciso renegociar prazos com clientes ou melhorar estimativas internas?"

Calculado como: Tarefas concluídas dentro do prazo / (Total de tarefas concluídas + Tarefas atrasadas atualmente).

Se estiver abaixo de 70%, é um sinal claro de que o projeto está operando em curto-circuito. Diferente de uma taxa de pontualidade comum que ignora o presente, esta métrica penaliza o indicador imediatamente se houverem tarefas atrasadas acumulando no painel hoje.

Ao olhar para este número, o dono pode agir em três frentes:Revisar o escopo, ajustar estimativas ou investigar se as tarefas estão atrasando sempre na mão da mesma pessoa, no mesmo tipo de serviço, ou por problemas repetitivos (como falta de acessos, ferramentas ruins ou dependência de terceiros).

### 2. Tarefas atrasadas agora (contagem + lista)

> **Decisão que gera:** "Quais tarefas eu preciso intervir *hoje*? Quem está travado e precisa de desbloqueio?"

Mostra a contagem total e destaca as atrasadas. Direto ao ponto: O dono abre o painel segunda de manhã e sabe exatamente onde agir, sem precisar perguntar para ninguém.

### 3. Velocidade semanal (tasks concluídas nos últimos 7 dias)

> **Decisão que gera:** "A semana foi boa ou ruim de verdade? O ritmo do time está acelerando ou caindo?"

Substitui o "acho que foi uma boa semana" da reunião de segunda por um número real.

### 4. Vencem nas próximas 48h (lista)

> **Decisão que gera:** "O que eu preciso cobrar *hoje* para evitar atraso amanhã?"

Alerta preventivo: aparece *antes* de estourar. O dono consegue checar com o responsável se está tudo caminhando, ou redistribuir antes que vire problema. Resolve a raiz da terceira dor.

### 5. Carga por pessoa (gráfico de barras empilhadas)

> **Decisão que gera:** "Quem está sobrecarregado e quem está disponível para receber mais trabalho?"

Mostra, por membro do time, quantas tarefas estão a fazer, em andamento e bloqueadas. O dono consegue ver num relance quem está afogado e quem está ocioso.

---

## O que foi cortado para caber no prazo

**Cortei:**
- Comentários/histórico por tarefa: útil para rastreabilidade, mas não resolve nenhuma das quatro dores do dono
- Filtros avançados no Kanban (por prioridade, por prazo): existe filtro por membro, que é o mais útil

**O que faria com mais tempo:**
- Drag-and-drop real no Kanban (muda status visualmente)
- Histórico de atividade por tarefa ("Bruno moveu para Em andamento ontem às 14h")
- Gráfico de velocidade ao longo do tempo (burndown semanal)
- Filtros compostos no quadro
- Testes automatizados
- Auth básico para que o o dono e o time tenham sessões separadas

---

## Decisões técnicas

**Next.js App Router** — fullstack sem overhead de infra separada.

**Prisma + PostgreSQL** — ORM tipado que elimina queries SQL manuais e garante que o banco e o TypeScript fiquem sincronizados. PostgreSQL é o banco relacional mais robusto para dados de negócio.

**Tailwind CSS** — utility-first sem precisar criar/manter um design system do zero. Consistência visual com velocidade de execução.

**Recharts** — biblioteca de gráficos para React baseada em D3, bem mantida e fácil de integrar com dados do banco.

**TypeScript estrito** 

---

## Estrutura do projeto

```
prisma/
  schema.prisma       # Modelos: Task, Member, enums Status/Priority
  seed.ts             # 10 membros + 31 tarefas com cenários reais
src/
  app/
    api/
      dashboard/      # Cálculo dos KPIs
      members/        # CRUD de membros
      tasks/          # CRUD de tarefas
    board/            # Página do Kanban
    dashboard/        # Página do painel
    members/          # Página do time
  components/
    board/            # BoardClient, TaskModal
    dashboard/        # DashboardClient, MembersClient
    sidebar.tsx           # Sidebar
  lib/
    prisma.ts         # Singleton do Prisma
    utils.ts          # Helpers de formatação e lógica
  types/
    index.ts          # Tipos compartilhados (Task, Member, KPIs...)

```
