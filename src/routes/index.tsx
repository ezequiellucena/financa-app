import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard - Finanças" },
      { name: "description", content: "Dashboard do controle financeiro" },
      { property: "og:title", content: "Dashboard - Finanças" },
      { property: "og:description", content: "Dashboard do controle financeiro" },
    ],
  }),
  component: Dashboard,
});

import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyInput } from '../components/CurrencyInput';
import { formatDateTime } from '../utils/dateFormatters';

function Dashboard() {
  const { despesasFixas, cartoes, gastosVariaveis, metas, salario, updateSalario } = useFinance();
  const [editingSalario, setEditingSalario] = useState(false);
  const [novoSalario, setNovoSalario] = useState(salario.toString());

  const totalDespesasFixas = despesasFixas.reduce((sum, d) => sum + d.valor, 0);
  const totalCartoes = cartoes.reduce((sum, c) => sum + c.valor, 0);
  const totalGastosVariaveis = gastosVariaveis.reduce((sum, g) => sum + g.valor, 0);
  const totalPoupanca = metas.reduce((sum, m) => sum + m.valorMensal, 0);
  const totalDespesas = totalDespesasFixas + totalCartoes + totalGastosVariaveis + totalPoupanca;
  const saldo = salario - totalDespesas;

  const handleSaveSalario = () => {
    const valor = parseFloat(novoSalario);
    if (isNaN(valor) || valor < 0) {
      toast.error('Digite um valor válido');
      return;
    }
    updateSalario(valor);
    setEditingSalario(false);
    toast.success('Salário atualizado');
  };

  const handleCancelEdit = () => {
    setNovoSalario(salario.toString());
    setEditingSalario(false);
  };

  const despesasPorCategoria = despesasFixas.reduce((acc, despesa) => {
    if (!acc[despesa.categoria]) {
      acc[despesa.categoria] = [];
    }
    acc[despesa.categoria].push(despesa);
    return acc;
  }, {} as Record<string, typeof despesasFixas>);

  return (
    <>
      <div className="space-y-4">
        {/* Summary Cards - Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Salário */}
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Salário</h3>
              {!editingSalario && (
                <button
                  onClick={() => setEditingSalario(true)}
                  className="p-1.5 text-muted-foreground hover:bg-accent rounded-lg transition-all duration-200"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            {editingSalario ? (
              <div className="space-y-2">
                <CurrencyInput
                  value={novoSalario}
                  onChange={(value) => setNovoSalario(value)}
                  className="w-full px-3 py-2 border border-input rounded-xl text-lg font-semibold bg-background"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveSalario();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSalario}
                    className="flex-1 px-3 py-1.5 bg-success text-success-foreground rounded-xl hover:opacity-90 transition-all duration-200 text-xs flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 text-xs flex items-center justify-center gap-1"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-success">
                R$ {salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Poupança */}
          {metas.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Poupança (Mensal)</h3>
              {metas.length === 1 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metas[0].descricao}</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {metas[0].valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metas.length} metas ativas</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalPoupanca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Total de Despesas */}
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total de Despesas</h3>
            <p className="text-2xl font-bold text-destructive">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Saldo */}
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Saldo</h3>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-3">
          {/* Despesas Fixas por Categoria */}
          {Object.entries(despesasPorCategoria).map(([categoria, despesas]) => (
            <div key={categoria} className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wide">{categoria}</h3>
              <div className="space-y-2">
                {despesas.map((despesa) => (
                  <div key={despesa.id} className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm text-card-foreground">{despesa.nome}</p>
                      <p className="text-xs text-muted-foreground">Vence: {despesa.vencimento}</p>
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Cartões de Crédito */}
          {cartoes.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wide">Cartões de Crédito</h3>
              <div className="space-y-2">
                {cartoes.map((cartao) => (
                  <div key={cartao.id} className="flex justify-between items-start py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm text-card-foreground">{cartao.apelido}</p>
                      <p className="text-xs text-muted-foreground">{cartao.bandeira} • Vence dia {cartao.vencimento}</p>
                    </div>
                    <p className="text-sm font-medium text-card-foreground">
                      R$ {cartao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outros (Gastos Variáveis) */}
          {gastosVariaveis.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wide">Outros</h3>
              <div className="space-y-2">
                {[...gastosVariaveis]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((gasto) => (
                  <div key={gasto.id} className="py-2 border-b border-border/40 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-card-foreground flex-1">{gasto.nome}</p>
                      <p className="text-sm font-medium text-card-foreground">
                        R$ {gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(new Date(gasto.createdAt))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Poupança */}
          {metas.length > 0 && (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              <h3 className="font-semibold text-card-foreground mb-3 text-sm uppercase tracking-wide">Poupança (Mensal)</h3>
              <div className="space-y-2">
                {metas.map((meta) => (
                  <div key={meta.id} className="py-2 border-b border-border/40 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-card-foreground flex-1">{meta.descricao}</p>
                      <p className="text-sm font-medium text-success">
                        R$ {meta.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Meta: R$ {meta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t-2 border-border">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-card-foreground">Total Mensal</p>
                    <p className="text-sm font-bold text-success">
                      R$ {totalPoupanca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}
