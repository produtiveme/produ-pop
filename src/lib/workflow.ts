import { z } from "zod";

export const workflowNodeTypeSchema = z.enum(["start", "task", "decision", "end"]);

export const workflowOutcomeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const workflowOutcomeInputSchema = z.union([z.string(), workflowOutcomeSchema]);

export const workflowNodeSchema = z.object({
  id: z.string(),
  type: workflowNodeTypeSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    title: z.string(),
    description: z.string().optional(),
    owner: z.string().optional(),
    checklist: z.array(z.string()).optional(),
    outcomes: z.array(workflowOutcomeInputSchema).optional(),
  }),
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  label: z.string().optional(),
});

export const workflowGraphSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export type WorkflowNodeType = z.infer<typeof workflowNodeTypeSchema>;
export type WorkflowOutcome = z.infer<typeof workflowOutcomeSchema>;
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  position: {
    x: number;
    y: number;
  };
  data: {
    title: string;
    description?: string;
    owner?: string;
    checklist?: string[];
    outcomes?: WorkflowOutcome[];
  };
};

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type ProcessRecord = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED";
  owner: string;
  description: string;
  lastUpdated: string;
  metrics: {
    nodes: number;
    decisionPoints: number;
    completionRate: number;
  };
  graph: WorkflowGraph;
};

function slugifyOutcomeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "saida";
}

export function createOutcome(label: string, id?: string): WorkflowOutcome {
  return {
    id: id ?? `outcome-${slugifyOutcomeLabel(label)}`,
    label,
  };
}

export function normalizeWorkflowGraph(input: z.infer<typeof workflowGraphSchema>): WorkflowGraph {
  const nodes: WorkflowNode[] = input.nodes.map((node) => {
    const normalizedNode: WorkflowNode = {
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        title: node.data.title,
        description: node.data.description,
        owner: node.data.owner,
        checklist: node.data.checklist,
      },
    };

    if (node.type === "decision") {
      normalizedNode.data.outcomes =
        node.data.outcomes?.map((item, index) =>
          typeof item === "string" ? createOutcome(item, `outcome-${slugifyOutcomeLabel(item)}-${index + 1}`) : item,
        ) ?? [];
    } else if (node.data.outcomes) {
      normalizedNode.data.outcomes = node.data.outcomes.map((item, index) =>
        typeof item === "string" ? createOutcome(item, `outcome-${slugifyOutcomeLabel(item)}-${index + 1}`) : item,
      );
    }

    return normalizedNode;
  });

  const decisionNodeMap = new Map(
    nodes.filter((node) => node.type === "decision").map((node) => [node.id, node]),
  );

  const edges: WorkflowEdge[] = input.edges.map((edge, index) => {
    const decisionNode = decisionNodeMap.get(edge.source);
    const sourceHandle =
      edge.sourceHandle ??
      (decisionNode?.data.outcomes?.find((outcome) => outcome.label === edge.label)?.id ??
        decisionNode?.data.outcomes?.[index]?.id);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      label:
        edge.label ??
        (sourceHandle && decisionNode?.data.outcomes?.find((outcome) => outcome.id === sourceHandle)?.label) ??
        undefined,
    };
  });

  return { nodes, edges };
}

export const mockProcesses: ProcessRecord[] = [
  {
    id: "proc-onboarding-cliente",
    name: "Onboarding de cliente enterprise",
    slug: "onboarding-cliente-enterprise",
    status: "REVIEW",
    owner: "Operações",
    description: "Fluxo para ativar novos clientes com validação comercial, kickoff e handoff para CS.",
    lastUpdated: "2026-03-07T18:40:00.000Z",
    metrics: {
      nodes: 5,
      decisionPoints: 1,
      completionRate: 82,
    },
    graph: {
      nodes: [
        { id: "start", type: "start", position: { x: 60, y: 220 }, data: { title: "Entrada", description: "Contrato assinado" } },
        { id: "task-briefing", type: "task", position: { x: 260, y: 220 }, data: { title: "Revisar briefing", owner: "Sales Ops", checklist: ["Conferir plano", "Conferir escopo"] } },
        {
          id: "decision-kickoff",
          type: "decision",
          position: { x: 520, y: 210 },
          data: { title: "Kickoff pronto?", outcomes: [createOutcome("Sim", "decision-kickoff-sim"), createOutcome("Não", "decision-kickoff-nao")] },
        },
        { id: "task-kickoff", type: "task", position: { x: 790, y: 140 }, data: { title: "Agendar kickoff", owner: "CS" } },
        { id: "end", type: "end", position: { x: 1040, y: 220 }, data: { title: "Conta ativada" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-briefing" },
        { id: "e2", source: "task-briefing", target: "decision-kickoff" },
        { id: "e3", source: "decision-kickoff", sourceHandle: "decision-kickoff-sim", target: "task-kickoff", label: "Sim" },
        { id: "e4", source: "task-kickoff", target: "end" },
      ],
    },
  },
  {
    id: "proc-suporte-prioritario",
    name: "Tratativa de chamados prioritários",
    slug: "tratativa-chamados-prioritarios",
    status: "PUBLISHED",
    owner: "Suporte",
    description: "Roteiro para triagem, contenção e atualização do cliente em incidentes prioritários.",
    lastUpdated: "2026-03-06T14:15:00.000Z",
    metrics: {
      nodes: 6,
      decisionPoints: 2,
      completionRate: 91,
    },
    graph: {
      nodes: [
        { id: "start", type: "start", position: { x: 60, y: 220 }, data: { title: "Alerta recebido" } },
        { id: "task-triage", type: "task", position: { x: 250, y: 220 }, data: { title: "Triagem técnica", owner: "N1" } },
        {
          id: "decision-impact",
          type: "decision",
          position: { x: 480, y: 210 },
          data: { title: "Impacto amplo?", outcomes: [createOutcome("Sim", "decision-impact-sim"), createOutcome("Não", "decision-impact-nao")] },
        },
        { id: "task-war-room", type: "task", position: { x: 720, y: 120 }, data: { title: "Abrir war room", owner: "Coordenação" } },
        { id: "task-client-update", type: "task", position: { x: 720, y: 320 }, data: { title: "Atualizar cliente", owner: "CS" } },
        { id: "end", type: "end", position: { x: 970, y: 220 }, data: { title: "Incidente estabilizado" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-triage" },
        { id: "e2", source: "task-triage", target: "decision-impact" },
        { id: "e3", source: "decision-impact", sourceHandle: "decision-impact-sim", target: "task-war-room", label: "Sim" },
        { id: "e4", source: "decision-impact", sourceHandle: "decision-impact-nao", target: "task-client-update", label: "Não" },
        { id: "e5", source: "task-war-room", target: "end" },
        { id: "e6", source: "task-client-update", target: "end" },
      ],
    },
  },
  {
    id: "proc-pagamento-fornecedor",
    name: "Aprovação de pagamento de fornecedor",
    slug: "aprovacao-pagamento-fornecedor",
    status: "DRAFT",
    owner: "Financeiro",
    description: "Fluxo inicial para conferência fiscal, alçadas e liberação do pagamento.",
    lastUpdated: "2026-03-05T10:05:00.000Z",
    metrics: {
      nodes: 4,
      decisionPoints: 1,
      completionRate: 37,
    },
    graph: {
      nodes: [
        { id: "start", type: "start", position: { x: 60, y: 220 }, data: { title: "Nota recebida" } },
        { id: "task-audit", type: "task", position: { x: 270, y: 220 }, data: { title: "Conferir documento fiscal", owner: "Financeiro" } },
        {
          id: "decision-budget",
          type: "decision",
          position: { x: 520, y: 210 },
          data: { title: "Valor dentro da alçada?", outcomes: [createOutcome("Sim", "decision-budget-sim"), createOutcome("Escalar", "decision-budget-escalar")] },
        },
        { id: "end", type: "end", position: { x: 810, y: 220 }, data: { title: "Pagamento liberado" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-audit" },
        { id: "e2", source: "task-audit", target: "decision-budget" },
        { id: "e3", source: "decision-budget", sourceHandle: "decision-budget-sim", target: "end", label: "Sim" },
      ],
    },
  },
];

export function createEmptyWorkflowGraph(): WorkflowGraph {
  return {
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 60, y: 220 },
        data: {
          title: "Início",
          description: "Evento que dispara o processo",
        },
      },
      {
        id: "end",
        type: "end",
        position: { x: 420, y: 220 },
        data: {
          title: "Fim",
          description: "Resultado esperado do processo",
        },
      },
    ],
    edges: [
      {
        id: "edge-start-end",
        source: "start",
        target: "end",
      },
    ],
  };
}

export function validateWorkflowGraph(graph: WorkflowGraph) {
  const errors: string[] = [];
  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();

  for (const node of graph.nodes) {
    incomingCount.set(node.id, 0);
    outgoingCount.set(node.id, 0);
  }

  for (const edge of graph.edges) {
    if (!nodeMap.has(edge.source)) {
      errors.push(`A conexão "${edge.id}" aponta para uma origem inexistente.`);
      continue;
    }

    if (!nodeMap.has(edge.target)) {
      errors.push(`A conexão "${edge.id}" aponta para um destino inexistente.`);
      continue;
    }

    if (edge.source === edge.target) {
      errors.push(`A conexão "${edge.id}" não pode ligar o nó a ele mesmo.`);
    }

    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) || 0) + 1);
    incomingCount.set(edge.target, (incomingCount.get(edge.target) || 0) + 1);
  }

  const startNodes = graph.nodes.filter((node) => node.type === "start");
  const endNodes = graph.nodes.filter((node) => node.type === "end");

  if (startNodes.length !== 1) {
    errors.push("O fluxo precisa ter exatamente 1 nó de início.");
  }

  if (endNodes.length < 1) {
    errors.push("O fluxo precisa ter pelo menos 1 nó de fim.");
  }

  for (const node of graph.nodes) {
    const title = node.data.title?.trim() || node.id;
    const incoming = incomingCount.get(node.id) || 0;
    const outgoing = outgoingCount.get(node.id) || 0;

    if (!node.data.title?.trim()) {
      errors.push(`O nó "${node.id}" está sem título.`);
    }

    if (node.type === "start") {
      if (incoming > 0) {
        errors.push(`O início "${title}" não pode receber conexões.`);
      }

      if (outgoing < 1) {
        errors.push(`O início "${title}" precisa apontar para pelo menos uma etapa.`);
      }
    }

    if (node.type === "end") {
      if (incoming < 1) {
        errors.push(`O fim "${title}" precisa receber pelo menos uma conexão.`);
      }

      if (outgoing > 0) {
        errors.push(`O fim "${title}" não pode ter saídas.`);
      }
    }

    if (node.type === "task") {
      if (incoming < 1) {
        errors.push(`A etapa "${title}" precisa ter uma entrada.`);
      }

      if (outgoing < 1) {
        errors.push(`A etapa "${title}" precisa ter uma saída.`);
      }
    }

    if (node.type === "decision") {
      const outcomes = node.data.outcomes?.filter((item) => item.label.trim()) ?? [];
      const outgoingEdges = graph.edges.filter((edge) => edge.source === node.id);
      const outcomeIds = new Set(outcomes.map((outcome) => outcome.id));

      if (incoming < 1) {
        errors.push(`A decisão "${title}" precisa ter uma entrada.`);
      }

      if (outcomes.length < 2) {
        errors.push(`A decisão "${title}" precisa ter pelo menos dois caminhos nomeados.`);
      }

      if (outgoingEdges.length < 2) {
        errors.push(`A decisão "${title}" precisa ter pelo menos duas saídas conectadas.`);
      }

      for (const edge of outgoingEdges) {
        if (!edge.sourceHandle) {
          errors.push(`A conexão "${edge.id}" da decisão "${title}" precisa estar ligada a uma saída específica.`);
          continue;
        }

        if (!outcomeIds.has(edge.sourceHandle)) {
          errors.push(`A conexão "${edge.id}" da decisão "${title}" usa uma saída inexistente.`);
        }
      }

      for (const outcome of outcomes) {
        const connectedEdges = outgoingEdges.filter((edge) => edge.sourceHandle === outcome.id);

        if (connectedEdges.length === 0) {
          errors.push(`A saída "${outcome.label}" da decisão "${title}" não está conectada.`);
        }

        if (connectedEdges.length > 1) {
          errors.push(`A saída "${outcome.label}" da decisão "${title}" está conectada mais de uma vez.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getStatusLabel(status: ProcessRecord["status"]) {
  return {
    DRAFT: "Rascunho",
    REVIEW: "Em revisão",
    PUBLISHED: "Publicado",
  }[status];
}
