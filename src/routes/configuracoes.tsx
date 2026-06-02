import { createFileRoute } from "@tanstack/react-router";
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { toast } from 'sonner';
import { CurrencyInput } from '../components/CurrencyInput';

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações - Finanças" },
      { name: "description", content: "Configure seu controle financeiro" },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { salario, updateSalario, anoSelecionado, setAnoSelecionado } = useFinance();
  const [novoSalario, setNovoSalario] = useState(salario.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalario(parseFloat(novoSalario));
    toast.success('Salário atualizado');
  };

  const handleAnoChange = (novoAno: number) => {
    setAnoSelecionado(novoAno);
    toast.success(`Ano alterado para ${novoAno}`);
  };

  const anoAtual = new Date().getFullYear();
  const anos = [];
  for (let i = anoAtual - 5; i <= anoAtual + 2; i++) {
    anos.push(i);
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Ano de Referência</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Selecione o Ano</label>
            <select
              value={anoSelecionado}
              onChange={(e) => handleAnoChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            Altere o ano para visualizar e gerenciar dados de diferentes períodos. Os dados históricos são preservados.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Salário Mensal</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Valor do Salário</label>
            <CurrencyInput
              value={novoSalario}
              onChange={(value) => setNovoSalario(value)}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
          >
            Atualizar Salário
          </button>
        </form>
      </div>
    </div>
  );
}
