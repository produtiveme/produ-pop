import Link from "next/link";
import { createProcessAction } from "@/app/processos/actions";
import { CalendarIcon, LogoMark, PlusIcon, SearchIcon } from "@/components/icons";
import { getProcesses, getStatusLabel } from "@/lib/processes";

export const dynamic = "force-dynamic";

export default async function ProcessosPage() {
  const processes = await getProcesses();

  return (
    <main className="library-page">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark">
            <LogoMark width={24} height={24} />
          </div>
          <span>ProduPop</span>
        </div>

        <div className="topbar-actions">
          <nav className="topbar-nav">
            <Link href="/">Dashboard</Link>
            <Link href="/processos" className="topbar-link-active">
              Biblioteca
            </Link>
            <a href="#">Execuções</a>
            <a href="#">Configurações</a>
          </nav>
          <div className="topbar-divider" />
          <form action={createProcessAction}>
            <button type="submit" className="button-primary button-primary-icon">
              <PlusIcon width={16} height={16} />
              Criar Novo Processo
            </button>
          </form>
          <div className="avatar">D</div>
        </div>
      </header>

      <section className="library-shell">
        <div className="library-heading">
          <h1>Biblioteca de Processos</h1>
          <p>Gerencie e execute os fluxos operacionais da sua empresa.</p>
        </div>

        <section className="filter-bar">
          <div className="search-field">
            <SearchIcon width={18} height={18} />
            <input type="text" placeholder="Pesquisar processos por nome, dono ou categoria..." />
          </div>
          <div className="filter-pills">
            <button type="button" className="filter-pill">
              <span>STATUS:</span>
              <strong>Ativo</strong>
            </button>
            <button type="button" className="filter-pill">
              <strong>Inconsistência</strong>
            </button>
            <button type="button" className="filter-pill">
              <strong>Categoria</strong>
            </button>
          </div>
        </section>

        {processes.length === 0 ? (
          <section className="library-empty">
            <div className="create-process-placeholder">
              <div className="create-process-bubble">
                <PlusIcon width={20} height={20} />
              </div>
              <strong>Seu banco está vazio</strong>
              <p>Crie o primeiro processo para começar a montar a biblioteca operacional.</p>
              <form action={createProcessAction}>
                <button type="submit" className="button-primary">
                  Criar processo inicial
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section className="library-grid">
            {processes.map((process) => {
              const category = process.slug.split("-")[0]?.toUpperCase() || "PROCESSO";
              const isReview = process.status === "REVIEW";
              const isPublished = process.status === "PUBLISHED";

              return (
                <article
                  key={process.id}
                  className={`library-card ${isReview ? "library-card-warning" : ""} ${process.status === "DRAFT" ? "library-card-draft" : ""}`}
                >
                  <div className="library-card-head">
                    <div>
                      <span className="library-card-category">{category}</span>
                      <h3>{process.name}</h3>
                    </div>
                    <span className={`status-badge status-badge-${process.status.toLowerCase()}`}>
                      {getStatusLabel(process.status)}
                    </span>
                  </div>

                  <div className="library-card-owner">
                    <span className="avatar avatar-sm">{process.owner.charAt(0)}</span>
                    <div>
                      <span>Dono/Gestor</span>
                      <strong>{process.owner}</strong>
                    </div>
                  </div>

                  <div className="library-card-meta">
                    <CalendarIcon width={14} height={14} />
                    <span>Última edição: {new Date(process.lastUpdated).toLocaleDateString("pt-BR")}</span>
                  </div>

                  {isReview && (
                    <div className="library-card-alert">
                      <span />
                      <p>Revisar pontos de decisão antes de liberar para execução.</p>
                    </div>
                  )}

                  <div className="library-card-actions">
                    <button type="button" className={`button-primary ${!isPublished ? "button-disabled" : ""}`} disabled={!isPublished}>
                      Iniciar Execução
                    </button>
                    <Link
                      href={`/processos/${process.id}/editor`}
                      className={isReview ? "button-outline-primary" : "button-secondary"}
                    >
                      {isReview ? "Resolver Inconsistência" : process.status === "DRAFT" ? "Continuar Editando" : "Editar Fluxograma"}
                    </Link>
                  </div>
                </article>
              );
            })}

            <form action={createProcessAction} className="create-process-card">
              <button type="submit" className="create-process-placeholder">
                <div className="create-process-bubble">
                  <PlusIcon width={20} height={20} />
                </div>
                <strong>Criar Novo Processo</strong>
              </button>
            </form>
          </section>
        )}
      </section>

      <footer className="simple-footer">
        <p>© 2026 ProduPop - Gestão Eficiente de Processos</p>
        <div>
          <a href="#">Privacidade</a>
          <a href="#">Suporte</a>
        </div>
      </footer>
    </main>
  );
}
