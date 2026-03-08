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
import { useEffect, useMemo, useState } from "react";
import { createOutcome, type ProcessRecord, type WorkflowNode, type WorkflowNodeType, type WorkflowOutcome } from "@/lib/workflow";
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

type FlowNodeData = WorkflowNode["data"] & {
  outcomeConnections?: Record<string, number>;
};
type FlowNode = Node<FlowNodeData, WorkflowNodeType>;

function StartNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-start">
      <Handle type="source" position={Position.Right} />
      <span>{data.title}</span>
    </div>
  );
}

function TaskNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-task">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
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
  const outcomes = data.outcomes ?? [];
  const connectionCounts = data.outcomeConnections ?? {};

  return (
    <div className="stitch-node-decision-wrap">
      <Handle type="target" position={Position.Left} />
      {outcomes.map((outcome, index) => (
        <div className="decision-handle-row" key={outcome.id} style={{ top: 28 + index * 22 }}>
          <span className={`decision-handle-label ${connectionCounts[outcome.id] ? "decision-handle-label-connected" : ""}`}>
            {outcome.label}
          </span>
          <Handle
            type="source"
            id={outcome.id}
            position={Position.Right}
            style={{ top: 8 }}
          />
        </div>
      ))}
      <div className="stitch-node-decision">
        <span>{data.title}</span>
      </div>
    </div>
  );
}

function EndNode({ data }: NodeProps<FlowNode>) {
  return (
    <div className="stitch-node stitch-node-end">
      <Handle type="target" position={Position.Left} />
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
  const outcomeConnectionCounts = process.graph.edges.reduce<Record<string, number>>((accumulator, edge) => {
    if (edge.sourceHandle) {
      accumulator[edge.sourceHandle] = (accumulator[edge.sourceHandle] || 0) + 1;
    }
    return accumulator;
  }, {});

  return process.graph.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      outcomeConnections:
        node.type === "decision"
          ? Object.fromEntries((node.data.outcomes ?? []).map((outcome) => [outcome.id, outcomeConnectionCounts[outcome.id] || 0]))
          : undefined,
    },
  })) as FlowNode[];
}

function toEditorEdges(process: ProcessRecord): Edge[] {
  return process.graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    label: edge.label,
    type: "straight",
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
        outcomes: [createOutcome("Sim", `decision-${Date.now()}-sim`), createOutcome("Não", `decision-${Date.now()}-nao`)],
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
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [processName, setProcessName] = useState(process.name);
  const [processDescription, setProcessDescription] = useState(process.description);
  const [owner, setOwner] = useState(process.owner);
  const [status, setStatus] = useState<ProcessRecord["status"]>(process.status);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activeTab, setActiveTab] = useState<"content" | "checklist" | "flow" | "owners">("content");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((edge) => edge.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
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
    setSaveState("idle");
  }

  function syncDecisionConnectionCounts(nextNodes: FlowNode[], nextEdges: Edge[]) {
    const counts = nextEdges.reduce<Record<string, number>>((accumulator, edge) => {
      if (edge.sourceHandle) {
        accumulator[edge.sourceHandle] = (accumulator[edge.sourceHandle] || 0) + 1;
      }
      return accumulator;
    }, {});

    return nextNodes.map((node) =>
      node.type === "decision"
        ? {
            ...node,
            data: {
              ...node.data,
              outcomeConnections: Object.fromEntries(
                (node.data.outcomes ?? []).map((outcome) => [outcome.id, counts[outcome.id] || 0]),
              ),
            },
          }
        : node,
    );
  }

  function updateNodesWithSync(updater: (current: FlowNode[]) => FlowNode[]) {
    setNodes((current) => syncDecisionConnectionCounts(updater(current), edges));
  }

  function updateEdgesWithSync(updater: (current: Edge[]) => Edge[]) {
    setEdges((currentEdges) => {
      const nextEdges = updater(currentEdges);
      setNodes((currentNodes) => syncDecisionConnectionCounts(currentNodes, nextEdges));
      return nextEdges;
    });
  }

  function handleConnect(connection: Connection) {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const outcomeLabel =
      sourceNode?.type === "decision"
        ? sourceNode.data.outcomes?.find((outcome) => outcome.id === connection.sourceHandle)?.label
        : undefined;

    updateEdgesWithSync((current) =>
      addEdge(
        {
          ...connection,
          id: `edge-${Date.now()}`,
          type: "straight",
          label: outcomeLabel,
          style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        },
        current,
      ),
    );
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSaveState("idle");
  }

  function addNewNode(type: Exclude<WorkflowNodeType, "start">) {
    const newNode = createNode(type, nodes.length);
    updateNodesWithSync((current) => [...current, newNode]);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    setSaveState("idle");
  }

  function deleteSelectedNode() {
    if (!selectedNode || selectedNode.type === "start" || selectedNode.type === "end") {
      return;
    }

    updateNodesWithSync((current) => current.filter((node) => node.id !== selectedNode.id));
    updateEdgesWithSync((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId(null);
    setValidationErrors([]);
    setSaveState("idle");
  }

  function deleteSelectedEdge() {
    if (!selectedEdge) return;
    updateEdgesWithSync((current) => current.filter((edge) => edge.id !== selectedEdge.id));
    setSelectedEdgeId(null);
    setValidationErrors([]);
    setSaveState("idle");
  }

  function updateSelectedEdgeLabel(label: string) {
    if (!selectedEdge) return;

    const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
    if (sourceNode?.type === "decision" && selectedEdge.sourceHandle) {
      updateSelectedNodeOutcome(sourceNode.id, selectedEdge.sourceHandle, label);
      return;
    }

    updateEdgesWithSync((current) =>
      current.map((edge) =>
        edge.id === selectedEdge.id
          ? {
              ...edge,
              label,
            }
          : edge,
      ),
    );
    setSaveState("idle");
  }

  function updateSelectedNodeOutcome(nodeId: string, outcomeId: string, label: string) {
    updateNodesWithSync((current) =>
      current.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                outcomes: node.data.outcomes?.map((outcome) =>
                  outcome.id === outcomeId
                    ? {
                        ...outcome,
                        label,
                      }
                    : outcome,
                ),
              },
            }
          : node,
      ),
    );

    updateEdgesWithSync((current) =>
      current.map((edge) =>
        edge.source === nodeId && edge.sourceHandle === outcomeId
          ? {
              ...edge,
              label,
            }
          : edge,
      ),
    );
    setSaveState("idle");
  }

  function addDecisionOutcome() {
    if (!decisionNode) return;
    let nextIndex = outcomes.length + 1;
    while (outcomes.some((outcome) => outcome.id === `${decisionNode.id}-outcome-${nextIndex}`)) {
      nextIndex += 1;
    }
    const nextOutcome = createOutcome(`Nova saída ${nextIndex}`, `${decisionNode.id}-outcome-${nextIndex}`);
    updateNodesWithSync((current) =>
      current.map((node) =>
        node.id === decisionNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                outcomes: [...outcomes, nextOutcome],
              },
            }
          : node,
      ),
    );
    setSaveState("idle");
  }

  function removeDecisionOutcome(outcomeId: string) {
    if (!decisionNode) return;
    updateNodesWithSync((current) =>
      current.map((node) =>
        node.id === decisionNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                outcomes: outcomes.filter((outcome) => outcome.id !== outcomeId),
              },
            }
          : node,
      ),
    );
    updateEdgesWithSync((current) => current.filter((edge) => !(edge.source === decisionNode.id && edge.sourceHandle === outcomeId)));
    setSaveState("idle");
  }

  function addChecklistItem() {
    updateSelectedNode({
      checklist: [...checklist, "Novo item"],
    });
  }

  function updateChecklistItem(index: number, value: string) {
    const next = [...checklist];
    next[index] = value;
    updateSelectedNode({ checklist: next });
  }

  function removeChecklistItem(index: number) {
    updateSelectedNode({
      checklist: checklist.filter((_, currentIndex) => currentIndex !== index),
    });
  }

  function moveChecklistItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= checklist.length) return;
    const next = [...checklist];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateSelectedNode({ checklist: next });
  }

  async function saveProcess() {
    setSaveState("saving");
    setValidationErrors([]);

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
            sourceHandle: edge.sourceHandle ?? undefined,
            label: typeof edge.label === "string" ? edge.label : undefined,
          })),
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      setSaveState("saved");
      return;
    }

    setSaveState("error");
    if (Array.isArray(data?.details)) {
      setValidationErrors(data.details as string[]);
    }
  }

  const checklist = selectedNode?.data.checklist ?? [];
  const outcomes: WorkflowOutcome[] = selectedNode?.data.outcomes ?? [];
  const taskNode = selectedNode?.type === "task" ? selectedNode : null;
  const decisionNode = selectedNode?.type === "decision" ? selectedNode : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Backspace" && event.key !== "Delete") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (selectedEdgeId) {
        event.preventDefault();
        setEdges((currentEdges) => {
          const nextEdges = currentEdges.filter((edge) => edge.id !== selectedEdgeId);
          setNodes((currentNodes) => syncDecisionConnectionCounts(currentNodes, nextEdges));
          return nextEdges;
        });
        setSelectedEdgeId(null);
        setValidationErrors([]);
        setSaveState("idle");
        return;
      }

      if (selectedNode && selectedNode.type !== "start" && selectedNode.type !== "end") {
        event.preventDefault();
        setNodes((currentNodes) => syncDecisionConnectionCounts(currentNodes.filter((node) => node.id !== selectedNode.id), edges));
        setEdges((currentEdges) => {
          const nextEdges = currentEdges.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id);
          setNodes((currentNodes) => syncDecisionConnectionCounts(currentNodes, nextEdges));
          return nextEdges;
        });
        setSelectedNodeId(null);
        setValidationErrors([]);
        setSaveState("idle");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedEdgeId, selectedNode, edges, setEdges, setNodes]);

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
          {validationErrors.length > 0 && (
            <div className="editor-validation-banner">
              <strong>Corrija o fluxo antes de salvar:</strong>
              <ul>
                {validationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
            }}
            onEdgeClick={(_, edge) => {
              setSelectedEdgeId(edge.id);
              setSelectedNodeId(null);
            }}
            onPaneClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            fitView
          >
            <Controls showInteractive={false} />
            <Background gap={20} size={1} color="#d1d5db" />
          </ReactFlow>

        </div>

        {selectedEdge && (
          <div className="edge-inspector">
            <div className="edge-inspector-head">
              <strong>Conexão selecionada</strong>
              <button type="button" className="button-link-muted" onClick={deleteSelectedEdge}>
                Remover
              </button>
            </div>
            <label htmlFor="edge-label">Rótulo da conexão</label>
            <input
              id="edge-label"
              value={typeof selectedEdge.label === "string" ? selectedEdge.label : ""}
              onChange={(event) => updateSelectedEdgeLabel(event.target.value)}
              placeholder="Ex: Sim, Não, Aprovado"
            />
          </div>
        )}

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
                          onClick={addChecklistItem}
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
                              onChange={(event) => updateChecklistItem(index, event.target.value)}
                            />
                            <div className="checklist-actions">
                              <button type="button" onClick={() => moveChecklistItem(index, -1)} disabled={index === 0}>
                                ↑
                              </button>
                              <button type="button" onClick={() => moveChecklistItem(index, 1)} disabled={index === checklist.length - 1}>
                                ↓
                              </button>
                              <button type="button" onClick={() => removeChecklistItem(index)}>
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="flow-placeholder">
                      <SplitIcon width={30} height={30} />
                      <h4>Caminhos de Saída (Decisões)</h4>
                      <p>Esta etapa possui {outcomes.length || 2} fluxos de saída. Clique para nomear as decisões que levam ao próximo passo.</p>

                      <div className="decision-pills">
                        {(decisionNode?.data.outcomes || [createOutcome("Sim"), createOutcome("Não")]).map((outcome, index) => (
                          <div className={`decision-pill ${index === 0 ? "decision-pill-primary" : ""}`} key={outcome.id}>
                            <span>{outcome.label}</span>
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
                          onClick={addChecklistItem}
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
                              onChange={(event) => updateChecklistItem(index, event.target.value)}
                            />
                            <div className="checklist-actions">
                              <button type="button" onClick={() => moveChecklistItem(index, -1)} disabled={index === 0}>
                                ↑
                              </button>
                              <button type="button" onClick={() => moveChecklistItem(index, 1)} disabled={index === checklist.length - 1}>
                                ↓
                              </button>
                              <button type="button" onClick={() => removeChecklistItem(index)}>
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {activeTab === "flow" && (
                  <section className="modal-section">
                    <div className="modal-section-head">
                      <h3>
                        <SplitIcon width={16} height={16} />
                        Decisões e Conexões
                      </h3>
                      <button type="button" className="link-button" onClick={addDecisionOutcome}>
                        + Adicionar Saída
                      </button>
                    </div>

                    {decisionNode ? (
                      <div className="outcome-stack">
                        {outcomes.map((outcome, index) => {
                          const linkedEdge = edges.find(
                            (edge) => edge.source === decisionNode.id && edge.sourceHandle === outcome.id,
                          );

                          return (
                            <div className="outcome-row" key={outcome.id}>
                              <div className={`decision-pill ${index === 0 ? "decision-pill-primary" : ""}`}>
                                <span>{outcome.label}</span>
                                <ArrowRightIcon width={14} height={14} />
                                <strong>{linkedEdge ? "Conectado" : "Sem conexão"}</strong>
                              </div>
                              <input
                                value={outcome.label}
                                onChange={(event) => updateSelectedNodeOutcome(decisionNode.id, outcome.id, event.target.value)}
                                placeholder="Nome da saída"
                              />
                              <button type="button" className="button-danger-subtle" onClick={() => removeDecisionOutcome(outcome.id)}>
                                Remover
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <section className="flow-placeholder flow-placeholder-expanded">
                        <SplitIcon width={34} height={34} />
                        <h4>Caminhos de Saída (Decisões)</h4>
                        <p>Selecione um nó de decisão para editar e conectar cada saída individualmente.</p>
                      </section>
                    )}
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
                {selectedNode.type !== "start" && selectedNode.type !== "end" && (
                  <button type="button" className="button-danger-subtle" onClick={deleteSelectedNode}>
                    Excluir Etapa
                  </button>
                )}
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
