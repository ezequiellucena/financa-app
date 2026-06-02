import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda - Finanças" },
      { name: "description", content: "Como usar o sistema de controle financeiro" },
    ],
  }),
  component: Ajuda,
});

function Ajuda() {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Como usar o sistema</h3>
        <div className="space-y-3 text-foreground">
          <div>
            <h4 className="font-medium mb-1 text-sm">Dashboard</h4>
            <p className="text-xs text-muted-foreground">Visualize o resumo mensal com total de despesas, salário e saldo disponível.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-sm">Despesas Fixas</h4>
            <p className="text-xs text-muted-foreground">Cadastre despesas recorrentes como aluguel, condomínio, contas de água, luz, etc.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-sm">Cartões</h4>
            <p className="text-xs text-muted-foreground">Gerencie os gastos mensais de seus cartões de crédito.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-sm">Gastos Variáveis</h4>
            <p className="text-xs text-muted-foreground">Registre gastos esporádicos como supermercado, farmácia, restaurantes, etc.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-sm">Poupança</h4>
            <p className="text-xs text-muted-foreground">Defina metas de poupança e acompanhe seu progresso.</p>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-sm">Relatórios</h4>
            <p className="text-xs text-muted-foreground">Exporte seus dados para Excel para análise externa.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
