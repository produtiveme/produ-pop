import Link from "next/link";
import { getProcesses } from "@/lib/processes";
import {
  AlertIcon,
  EyeIcon,
  GridIcon,
  LibraryIcon,
  LogoMark,
  LogoutIcon,
  PlayIcon,
  SettingsIcon,
  UsersIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Home() {
  const processes = await getProcesses();
  const total = processes.length;
  const inconsistent = processes.filter((process) => process.status === "REVIEW").length;
  const published = processes.filter((process) => process.status === "PUBLISHED").length;
  const recent = processes.slice(0, 3);

  return (
    <main className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <LogoMark width={24} height={24} />
          </div>
          <div>
            <h1>ProduPop</h1>
            <p>SaaS de Processos</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-link sidebar-link-active">
            <GridIcon width={18} height={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/processos" className="sidebar-link">
            <LibraryIcon width={18} height={18} />
            <span>Biblioteca de Processos</span>
          </Link>
          <a href="#" className="sidebar-link">
            <PlayIcon width={18} height={18} />
            <span>Minhas Execuções</span>
          </a>
          <a href="#" className="sidebar-link sidebar-link-between">
            <span className="sidebar-link-row">
              <AlertIcon width={18} height={18} />
              <span>Inconsistências</span>
            </span>
            <span className="sidebar-badge">{inconsistent}</span>
          </a>
          <a href="#" className="sidebar-link">
            <UsersIcon width={18} height={18} />
            <span>Usuários</span>
          </a>
          <a href="#" className="sidebar-link">
            <SettingsIcon width={18} height={18} />
            <span>Configurações</span>
          </a>
        </nav>

        <div className="sidebar-user">
          <div className="avatar avatar-sm">D</div>
          <div>
            <strong>Daniel Silva</strong>
            <p>daniel@produpop.com</p>
          </div>
          <button type="button" className="icon-button">
            <LogoutIcon width={18} height={18} />
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <h2>Olá, Daniel!</h2>
          <p>Bem-vindo ao seu painel de controle de processos.</p>
        </header>

        <section className="stats-grid">
          <article className="stat-panel">
            <div className="stat-head">
              <LibraryIcon width={16} height={16} />
              <span>Processos cadastrados</span>
            </div>
            <strong>{total}</strong>
            <p>Base ativa para desenho e acompanhamento.</p>
          </article>

          <article className="stat-panel stat-panel-warning">
            <div className="stat-head">
              <AlertIcon width={16} height={16} />
              <span>Processos em revisão</span>
            </div>
            <strong>{inconsistent}</strong>
            <p>Requer atenção imediata</p>
          </article>

          <article className="stat-panel">
            <div className="stat-head">
              <PlayIcon width={16} height={16} />
              <span>Processos publicados</span>
            </div>
            <strong>{published}</strong>
            <p>Prontos para execução operacional</p>
          </article>
        </section>

        <section className="quick-action">
          <Link href="/processos" className="quick-action-link">
            <PlayIcon width={22} height={22} />
            <span>
              Continuar na Biblioteca: <em>gerenciar processos e abrir fluxogramas</em>
            </span>
          </Link>
        </section>

        <section className="data-panel">
          <div className="data-panel-head">
            <h3>Processos Recentes</h3>
            <Link href="/processos">Ver todos</Link>
          </div>

          <div className="table-shell">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Processo</th>
                  <th>Data</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((process) => (
                  <tr key={process.id}>
                    <td>{process.name}</td>
                    <td>{new Date(process.lastUpdated).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <span className="table-owner">
                        <span className="avatar avatar-xs">{process.owner.charAt(0)}</span>
                        {process.owner}
                      </span>
                    </td>
                    <td>
                      <span className={`table-status table-status-${process.status.toLowerCase()}`}>
                        {process.status === "REVIEW" ? "Em andamento" : process.status === "PUBLISHED" ? "Concluído" : "Rascunho"}
                      </span>
                    </td>
                    <td className="table-action">
                      <Link href={`/processos/${process.id}/editor`} className="icon-button icon-button-link">
                        <EyeIcon width={18} height={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
