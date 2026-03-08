import { z } from "zod";

export const workflowNodeTypeSchema = z.enum(["start", "task", "decision", "end"]);

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
    outcomes: z.array(z.string()).optional(),
  }),
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const workflowGraphSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export type WorkflowNodeType = z.infer<typeof workflowNodeTypeSchema>;
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;
export type WorkflowGraph = z.infer<typeof workflowGraphSchema>;

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
        { id: "decision-kickoff", type: "decision", position: { x: 520, y: 210 }, data: { title: "Kickoff pronto?", outcomes: ["Sim", "Não"] } },
        { id: "task-kickoff", type: "task", position: { x: 790, y: 140 }, data: { title: "Agendar kickoff", owner: "CS" } },
        { id: "end", type: "end", position: { x: 1040, y: 220 }, data: { title: "Conta ativada" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-briefing" },
        { id: "e2", source: "task-briefing", target: "decision-kickoff" },
        { id: "e3", source: "decision-kickoff", target: "task-kickoff", label: "Sim" },
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
        { id: "decision-impact", type: "decision", position: { x: 480, y: 210 }, data: { title: "Impacto amplo?", outcomes: ["Sim", "Não"] } },
        { id: "task-war-room", type: "task", position: { x: 720, y: 120 }, data: { title: "Abrir war room", owner: "Coordenação" } },
        { id: "task-client-update", type: "task", position: { x: 720, y: 320 }, data: { title: "Atualizar cliente", owner: "CS" } },
        { id: "end", type: "end", position: { x: 970, y: 220 }, data: { title: "Incidente estabilizado" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-triage" },
        { id: "e2", source: "task-triage", target: "decision-impact" },
        { id: "e3", source: "decision-impact", target: "task-war-room", label: "Sim" },
        { id: "e4", source: "decision-impact", target: "task-client-update", label: "Não" },
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
        { id: "decision-budget", type: "decision", position: { x: 520, y: 210 }, data: { title: "Valor dentro da alçada?", outcomes: ["Sim", "Escalar"] } },
        { id: "end", type: "end", position: { x: 810, y: 220 }, data: { title: "Pagamento liberado" } },
      ],
      edges: [
        { id: "e1", source: "start", target: "task-audit" },
        { id: "e2", source: "task-audit", target: "decision-budget" },
        { id: "e3", source: "decision-budget", target: "end", label: "Sim" },
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

export function getStatusLabel(status: ProcessRecord["status"]) {
  return {
    DRAFT: "Rascunho",
    REVIEW: "Em revisão",
    PUBLISHED: "Publicado",
  }[status];
}
