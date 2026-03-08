"use client";

import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import type { ProcessRecord, WorkflowNode, WorkflowNodeType } from "@/lib/workflow";
import {
  ArrowRightIcon,
  CheckboxIcon,
  CloseIcon,
  CircleNodeIcon,
  CursorIcon,
  DiamondNodeIcon,
  DescriptionIcon,
  DuplicateIcon,
  ImageIcon,
  LogoMark,
  RectangleNodeIcon,
  SaveIcon,
  SplitIcon,
  TuneIcon,
  UploadIcon,
  VideoIcon,
} from "@/components/icons";

type FlowNodeData = WorkflowNode["data"];
type FlowNode = Node<FlowNodeData, WorkflowNodeType>;

function StartNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-start">
      <Handle type="source" position={Position.Bottom} />
      <span>{data.title}</span>
    </div>
  );
}

function TaskNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-task">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="stitch-node-task-head">
        <div className="stitch-node-tag">Etapa</div>
        <span className="stitch-node-settings">•••</span>
      </div>
      <strong>{data.title}</strong>
      <p>{data.description || "Descreva a ação desta etapa."}</p>
    </div>
  );
}

function DecisionNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node-decision-wrap">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className="stitch-node-decision">
        <span>{data.title}</span>
      </div>
    </div>
  );
}

function EndNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-end">
      <Handle type="target" position={Position.Top} />
      <span>{data.title}</span>
    </div>
  );
}

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  decision: DecisionNode,
  end: EndNode,
};

function toEditorNodes(process: ProcessRecord): FlowNode[] {
  return process.graph.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) as FlowNode[];
}

function toEditorEdges(process: ProcessRecord): Edge[] {
  return process.graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "smoothstep",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    labelStyle: { fill: "#64748b", fontWeight: 700, fontSize: 11 },
  }));
}

function createNode(type: Exclude<WorkflowNodeType, "start">, index: number): FlowNode {
  const base = {
    id: `${type}-${Date.now()}`,
    type,
    position: { x: 420, y: 180 + index * 60 },
  };

  if (type === "task") {
    return {
      ...base,
      data: {
        title: "Nova Etapa",
        description: "Defina a ação a ser executada.",
        owner: "Responsável",
        checklist: ["Validar requisito"],
      },
    } as FlowNode;
  }

  if (type === "decision") {
    return {
      ...base,
      data: {
        title: "Decisão",
        outcomes: ["Sim", "Não"],
      },
    } as FlowNode;
  }

  return {
    ...base,
    data: {
      title: "Fim",
      description: "Saída do fluxo",
    },
  } as FlowNode;
}

function EditorInner({ process }: { process: ProcessRecord }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(toEditorNodes(process));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(toEditorEdges(process));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(process.graph.nodes[1]?.id ?? process.graph.nodes[0]?.id ?? null);
  const [processName, setProcessName] = useState(process.name);
  const [processDescription, setProcessDescription] = useState(process.description);
  const [owner, setOwner] = useState(process.owner);
  const [status, setStatus] = useState<ProcessRecord["status"]>(process.status);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"content" | "checklist" | "flow" | "owners">("content");

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  function updateSelectedNode(patch: Partial<FlowNodeData>) {
    if (!selectedNode) return;

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
              },
            }
          : node,
      ),
    );
  }

  function handleConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `edge-${Date.now()}`,
          type: "smoothstep",
          style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        },
        current,
      ),
    );
  }

  function addNewNode(type: Exclude<WorkflowNodeType, "start">) {
    const newNode = createNode(type, nodes.length);
    setNodes((current) => [...current, newNode]);
    setSelectedNodeId(newNode.id);
  }

  async function saveProcess() {
    setSaveState("saving");

    const response = await fetch(`/api/processes/${process.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: processName,
        description: processDescription,
        owner,
        status,
        flowData: {
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          })),
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: typeof edge.label === "string" ? edge.label : undefined,
          })),
        },
      }),
    });

    setSaveState(response.ok ? "saved" : "error");
  }

  const checklist = selectedNode?.data.checklist ?? [];
  const outcomes = selectedNode?.data.outcomes ?? [];
  const taskNode = selectedNode?.type === "task" ? selectedNode : null;
  const decisionNode = selectedNode?.type === "decision" ? selectedNode : null;

  return (
    <div className="editor-stitch">
      <header className="editor-topbar-stitch">
        <div className="topbar-brand">
          <div className="brand-mark">
            <LogoMark width={24} height={24} />
          </div>
          <div>
            <strong>ProduPop</strong>
            <p>Editor de Processos</p>
          </div>
        </div>

        <div className="editor-topbar-actions">
          <div className="editor-process-pill">
            <TuneIcon width={14} height={14} />
            <span>
              Processo: <strong>{processName}</strong>
            </span>
          </div>
          <div className={`editor-status-pill editor-status-pill-${saveState}`}>
            {saveState === "idle" && "Rascunho"}
            {saveState === "saving" && "Salvando..."}
            {saveState === "saved" && "Salvo"}
            {saveState === "error" && "Erro"}
          </div>
          <button type="button" className="button-secondary button-secondary-icon">
            <DuplicateIcon width={16} height={16} />
            Duplicar
          </button>
          <button type="button" className="button-secondary button-secondary-icon" onClick={saveProcess}>
            <SaveIcon width={16} height={16} />
            {saveState === "saving" ? "Salvando..." : "Salvar Rascunho"}
          </button>
          <button type="button" className="button-primary button-primary-icon" onClick={saveProcess}>
            <UploadIcon width={16} height={16} />
            Publicar
          </button>
        </div>
      </header>

      <section className="editor-stage">
        <aside className="editor-toolrail">
          <button type="button" onClick={() => addNewNode("end")} title="Início/Fim">
            <CircleNodeIcon width={24} height={24} />
          </button>
          <button type="button" className="toolrail-active" onClick={() => addNewNode("task")} title="Etapa">
            <RectangleNodeIcon width={24} height={24} />
          </button>
          <button type="button" onClick={() => addNewNode("decision")} title="Decisão">
            <DiamondNodeIcon width={24} height={24} />
          </button>
          <button type="button" title="Conector">
            <ArrowRightIcon width={24} height={24} />
          </button>
          <div className="toolrail-divider" />
          <button type="button" title="Cursor">
            <CursorIcon width={24} height={24} />
          </button>
        </aside>

        <div className="editor-canvas-stitch">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            fitView
          >
            <Controls showInteractive={false} />
            <Background gap={20} size={1} color="#d1d5db" />
          </ReactFlow>

        </div>

        {selectedNode && (
          <div className="editor-modal-overlay">
            <div className="editor-modal">
              <header className="editor-modal-header">
                <div className="modal-title-block">
                  <div className="modal-title-icon">
                    <TuneIcon width={20} height={20} />
                  </div>
                  <div>
                    <h2>Configurar Etapa</h2>
                    <p>Defina o conteúdo e as regras para esta etapa do processo.</p>
                  </div>
                </div>
                <button type="button" className="icon-button" onClick={() => setSelectedNodeId(null)}>
                  <CloseIcon width={18} height={18} />
                </button>
              </header>

              <div className="editor-modal-tabs">
                <button type="button" className={activeTab === "content" ? "tab-active" : ""} onClick={() => setActiveTab("content")}>
                  Conteúdo Instrucional
                </button>
                <button type="button" className={activeTab === "checklist" ? "tab-active" : ""} onClick={() => setActiveTab("checklist")}>
                  Checklist
                </button>
                <button type="button" className={activeTab === "flow" ? "tab-active" : ""} onClick={() => setActiveTab("flow")}>
                  Decisões & Fluxo
                </button>
                <button type="button" className={activeTab === "owners" ? "tab-active" : ""} onClick={() => setActiveTab("owners")}>
                  Responsáveis
                </button>
              </div>

              <div className="editor-modal-body">
                {activeTab === "content" && (
                  <>
                    <section className="modal-section">
                      <div className="modal-section-head">
                        <h3>
                          <DescriptionIcon width={16} height={16} />
                          Instruções para o Executor
                        </h3>
                        <div className="modal-head-actions">
                          <button type="button" className="button-secondary button-secondary-icon">
                            <ImageIcon width={14} height={14} />
                            Adicionar Imagem
                          </button>
                          <button type="button" className="button-secondary button-secondary-icon">
                            <VideoIcon width={14} height={14} />
                            Vídeo
                          </button>
                        </div>
                      </div>

                      <div className="rich-editor-shell">
                        <div className="rich-editor-toolbar">
                          <button type="button">B</button>
                          <button type="button">I</button>
                          <button type="button">≣</button>
                          <button type="button">↔</button>
                        </div>
                        <textarea
                          rows={6}
                          value={taskNode?.data.description || ""}
                          onChange={(event) => updateSelectedNode({ description: event.target.value })}
                          placeholder="Escreva aqui o passo a passo detalhado para o colaborador..."
                        />
                      </div>
                    </section>

                    <section className="modal-section">
                      <div className="modal-section-head">
                        <h3>
                          <CheckboxIcon width={16} height={16} />
                          Checklist de Verificação
                        </h3>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => updateSelectedNode({ checklist: [...checklist, "Novo item"] })}
                        >
                          + Adicionar Item
                        </button>
                      </div>

                      <div className="checklist-stack">
                        {checklist.map((item, index) => (
                          <div className="checklist-row" key={`${selectedNode.id}-${index}`}>
                            <span className="drag-mark">⋮⋮</span>
                            <input type="checkbox" disabled />
                            <input
                              value={item}
                              onChange={(event) => {
                                const next = [...checklist];
                                next[index] = event.target.value;
                                updateSelectedNode({ checklist: next });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="flow-placeholder">
                      <SplitIcon width={30} height={30} />
                      <h4>Caminhos de Saída (Decisões)</h4>
                      <p>Esta etapa possui {outcomes.length || 2} fluxos de saída. Clique para nomear as decisões que levam ao próximo passo.</p>

                      <div className="decision-pills">
                        {(decisionNode?.data.outcomes || ["Sim", "Não"]).map((outcome, index) => (
                          <div className={`decision-pill ${index === 0 ? "decision-pill-primary" : ""}`} key={`${outcome}-${index}`}>
                            <span>{outcome}</span>
                            <ArrowRightIcon width={14} height={14} />
                            <strong>{index === 0 ? "Aprovar Admissão" : "Solicitar Correção"}</strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {activeTab === "checklist" && (
                  <section className="modal-section">
                    <div className="modal-section-head">
                      <h3>
                        <CheckboxIcon width={16} height={16} />
                        Checklist de Verificação
                      </h3>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => updateSelectedNode({ checklist: [...checklist, "Novo item"] })}
                      >
                        + Adicionar Item
                      </button>
                    </div>

                    <div className="checklist-stack">
                      {checklist.map((item, index) => (
                        <div className="checklist-row" key={`${selectedNode.id}-secondary-${index}`}>
                          <span className="drag-mark">⋮⋮</span>
                          <input type="checkbox" disabled />
                          <input
                            value={item}
                            onChange={(event) => {
                              const next = [...checklist];
                              next[index] = event.target.value;
                              updateSelectedNode({ checklist: next });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "flow" && (
                  <section className="flow-placeholder flow-placeholder-expanded">
                    <SplitIcon width={34} height={34} />
                    <h4>Caminhos de Saída (Decisões)</h4>
                    <p>Organize e nomeie cada caminho que leva este fluxo até a próxima etapa.</p>

                    <div className="decision-pills">
                      {(decisionNode?.data.outcomes || ["Sim", "Não"]).map((outcome, index) => (
                        <div className={`decision-pill ${index === 0 ? "decision-pill-primary" : ""}`} key={`${outcome}-flow-${index}`}>
                          <span>{outcome}</span>
                          <ArrowRightIcon width={14} height={14} />
                          <strong>{index === 0 ? "Aprovar Admissão" : "Solicitar Correção"}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {activeTab === "owners" && (
                  <section className="modal-grid-two">
                    <div className="modal-field modal-field-full">
                      <label htmlFor="process-name">Nome do processo</label>
                      <input id="process-name" value={processName} onChange={(event) => setProcessName(event.target.value)} />
                    </div>
                    <div className="modal-field">
                      <label htmlFor="node-title">Título da etapa</label>
                      <input id="node-title" value={selectedNode.data.title} onChange={(event) => updateSelectedNode({ title: event.target.value })} />
                    </div>
                    <div className="modal-field">
                      <label htmlFor="process-owner">Responsável</label>
                      <input id="process-owner" value={owner} onChange={(event) => setOwner(event.target.value)} />
                    </div>
                    <div className="modal-field">
                      <label htmlFor="process-status">Status</label>
                      <select id="process-status" value={status} onChange={(event) => setStatus(event.target.value as ProcessRecord["status"])}>
                        <option value="DRAFT">Rascunho</option>
                        <option value="REVIEW">Em revisão</option>
                        <option value="PUBLISHED">Publicado</option>
                      </select>
                    </div>
                    <div className="modal-field modal-field-full">
                      <label htmlFor="process-description">Resumo do processo</label>
                      <textarea
                        id="process-description"
                        rows={3}
                        value={processDescription}
                        onChange={(event) => setProcessDescription(event.target.value)}
                      />
                    </div>
                  </section>
                )}
              </div>

              <footer className="editor-modal-footer">
                <button type="button" className="button-link-muted" onClick={() => setSelectedNodeId(null)}>
                  Cancelar
                </button>
                <button type="button" className="button-primary" onClick={saveProcess}>
                  Salvar Alterações
                </button>
              </footer>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function ProcessEditor({ process }: { process: ProcessRecord }) {
  return (
    <ReactFlowProvider>
      <EditorInner process={process} />
    </ReactFlowProvider>
  );
}
