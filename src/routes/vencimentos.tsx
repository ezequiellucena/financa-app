import { createFileRoute } from "@tanstack/react-router";
import { useFinance } from '../context/FinanceContext';

export const Route = createFileRoute("/vencimentos")({
  head: () => ({
    meta: [
      { title: "Vencimentos - Finanças" },
      { name: "description", content: "Visualize todos os vencimentos do mês" },
    ],
  }),
  component: Vencimentos,
});

function Vencimentos() {
  const { despesasFixas, cartoes } = useFinance();

  const allVencimentos = [
    ...despesasFixas.map(d => ({ tipo: 'Despesa Fixa', nome: d.nome, valor: d.valor, vencimento: d.vencimento })),
    ...cartoes.map(c => ({ tipo: 'Cartão', nome: c.apelido, valor: c.valor, vencimento: c.vencimento }))
  ].sort((a, b) => parseInt(a.vencimento) - parseInt(b.vencimento));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Todos os Vencimentos</h3>
        {allVencimentos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm">Nenhum vencimento cadastrado</p>
        ) : (
          <div className="space-y-2">
            {allVencimentos.map((item, idx) => (
              <div key={idx} className="p-3 border border-border/40 rounded-xl hover:bg-accent transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground text-sm">{item.nome}</p>
                    <p className="text-xs text-muted-foreground">{item.tipo} • Vence dia {item.vencimento}</p>
                  </div>
                  <p className="font-semibold text-card-foreground text-sm">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
