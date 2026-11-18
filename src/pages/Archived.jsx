import { Archive } from "lucide-react";
import { useProjects } from "../store/ProjectsContext";
import PageBanner from "../components/PageBanner";
import StatusBadge from "../components/StatusBadge";

export default function Archived() {
  const { arquivados, loading, error, reload } = useProjects();

  return (
    <>
      <PageBanner
        eyebrow="Neo Demanda · Arquivo"
        title="Projetos Arquivados"
        subtitle="Projetos finalizados ou removidos da listagem ativa"
      />

      <div className="mx-auto max-w-shell px-5 py-8 sm:px-8">
        <section className="card overflow-hidden">
          <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="eyebrow text-ink-faint">Arquivo</h2>
            <span className="font-mono text-[12px] text-ink-faint">
              {arquivados.length} projeto(s)
            </span>
          </header>

          {loading ? <p className="p-8 text-sm text-ink-soft">Carregando arquivo...</p> : error ? <div className="p-6"><p className="text-sm text-bad">{error}</p><button onClick={reload} className="btn-ghost mt-3">Tentar novamente</button></div> : arquivados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Archive size={24} className="text-ink-faint" />
              <p className="font-display text-[15px] font-bold text-ink">O arquivo está vazio</p>
              <p className="text-[13px] text-ink-soft">
                Projetos arquivados no dashboard aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-line">
                    {["Projeto", "Tipo", "Carga instalada", "Status"].map((coluna, i) => (
                      <th
                        key={coluna || i}
                        scope="col"
                        className="eyebrow px-5 py-3 text-ink-faint"
                      >
                        {coluna}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {arquivados.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-[#FAFCFB]">
                      <td className="px-5 py-4"><p className="font-display text-[14px] font-bold text-ink">{p.nome}</p><p className="mt-0.5 text-[12.5px] text-ink-faint">{p.responsavelTecnico}</p></td>
                      <td className="px-5 py-4 text-[13.5px] text-ink-soft">{p.tipoEdificacao || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4"><span className="font-mono text-[14px] font-bold text-ink">{p.demandaContratada} kVA</span></td>
                      <td className="px-5 py-4"><StatusBadge status="arquivado" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
