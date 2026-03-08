import { ProcessStatus } from "@prisma/client";
import { db } from "@/lib/db";
import {
  createEmptyWorkflowGraph,
  getStatusLabel,
  mockProcesses,
  type ProcessRecord,
  workflowGraphSchema,
} from "@/lib/workflow";

export type ProcessListItem = ProcessRecord;

function cloneGraph<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toProcessRecord(process: {
  id: string;
  name: string;
  slug: string;
  status: ProcessStatus;
  owner: string | null;
  description: string | null;
  updatedAt: Date;
  flowData: unknown;
}): ProcessRecord {
  const parsedGraph = workflowGraphSchema.safeParse(process.flowData);
  const graph = parsedGraph.success ? parsedGraph.data : createEmptyWorkflowGraph();
  const decisionPoints = graph.nodes.filter((node) => node.type === "decision").length;

  return {
    id: process.id,
    name: process.name,
    slug: process.slug,
    status: process.status,
    owner: process.owner ?? "Sem responsável",
    description: process.description ?? "Processo sem descrição operacional definida.",
    lastUpdated: process.updatedAt.toISOString(),
    metrics: {
      nodes: graph.nodes.length,
      decisionPoints,
      completionRate: process.status === "PUBLISHED" ? 100 : process.status === "REVIEW" ? 72 : 28,
    },
    graph,
  };
}

export async function getProcesses() {
  const processes = await db.process.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return processes.map(toProcessRecord);
}

export async function getProcessById(id: string) {
  const process = await db.process.findUnique({
    where: { id },
  });

  return process ? toProcessRecord(process) : null;
}

export async function createInitialProcess() {
  const template = mockProcesses[0];
  const slugBase = template.slug;
  const existing = await db.process.count({
    where: {
      slug: {
        startsWith: slugBase,
      },
    },
  });

  return db.process.create({
    data: {
      name: existing === 0 ? template.name : `${template.name} ${existing + 1}`,
      slug: existing === 0 ? slugBase : `${slugBase}-${existing + 1}`,
      description: template.description,
      owner: template.owner,
      status: ProcessStatus.DRAFT,
      flowData: cloneGraph(template.graph),
    },
  });
}

export async function updateProcess(input: {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: ProcessStatus;
  flowData: unknown;
}) {
  const parsedGraph = workflowGraphSchema.parse(input.flowData);

  return db.process.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      owner: input.owner,
      status: input.status,
      flowData: parsedGraph,
    },
  });
}

export { getStatusLabel };
