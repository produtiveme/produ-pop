import Link from "next/link";
import { notFound } from "next/navigation";
import { ProcessEditor } from "@/components/process-editor";
import { getProcessById, getStatusLabel } from "@/lib/processes";

export const dynamic = "force-dynamic";

export default async function ProcessEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const process = await getProcessById(id);

  if (!process) {
    notFound();
  }

  return (
    <main className="editor-page-stitch">
      <div className="editor-page-meta">
        <Link href="/processos">Biblioteca</Link>
        <span>/</span>
        <span>{process.name}</span>
        <span>/</span>
        <span>{getStatusLabel(process.status)}</span>
      </div>
      <ProcessEditor process={process} />
    </main>
  );
}
