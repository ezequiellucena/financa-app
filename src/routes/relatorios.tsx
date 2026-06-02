import { createFileRoute } from "@tanstack/react-router";
import { useFinance } from '../context/FinanceContext';
import { Download, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { formatDateTime } from '../utils/dateFormatters';

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios - Finanças" },
      { name: "description", content: "Exporte relatórios financeiros" },
    ],
  }),
  component: Relatorios,
});

function Relatorios() {
  const {
    despesasFixas,
    cartoes,
    gastosVariaveis,
    metas,
    salario,
    relatoriosExportados,
    addRelatorioExportado
  } = useFinance();

  const handleExportarExcel = () => {
    const totalDespesasFixas = despesasFixas.reduce((sum, d) => sum + d.valor, 0);
    const totalCartoes = cartoes.reduce((sum, c) => sum + c.valor, 0);
    const totalGastosVariaveis = gastosVariaveis.reduce((sum, g) => sum + g.valor, 0);
    const totalPoupanca = metas.reduce((sum, m) => sum + m.valorMensal, 0);
    const totalDespesas = totalDespesasFixas + totalCartoes + totalGastosVariaveis + totalPoupanca;
    const saldo = salario - totalDespesas;

    const wb = XLSX.utils.book_new();

    const resumoData = [
      ['CONTROLE FINANCEIRO - RESUMO'],
      [''],
      ['Período', new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })],
      ['Data de Exportação', new Date().toLocaleString('pt-BR')],
      [''],
      ['RECEITAS'],
      ['Salário', salario],
      [''],
      ['DESPESAS'],
      ['Despesas Fixas', totalDespesasFixas],
      ['Cartões de Crédito', totalCartoes],
      ['Gastos Variáveis', totalGastosVariaveis],
      ['Poupança (Mensal)', totalPoupanca],
      ['Total de Despesas', totalDespesas],
      [''],
      ['SALDO', saldo],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    const despesasFixasData = [
      ['DESPESAS FIXAS'],
      [''],
      ['Nome', 'Categoria', 'Vencimento', 'Valor'],
      ...despesasFixas.map(d => [d.nome, d.categoria, d.vencimento, d.valor])
    ];
    const wsDespesasFixas = XLSX.utils.aoa_to_sheet(despesasFixasData);
    XLSX.utils.book_append_sheet(wb, wsDespesasFixas, 'Despesas Fixas');

    const cartoesData = [
      ['CARTÕES DE CRÉDITO'],
      [''],
      ['Apelido', 'Bandeira', 'Vencimento', 'Valor'],
      ...cartoes.map(c => [c.apelido, c.bandeira, c.vencimento, c.valor])
    ];
    const wsCartoes = XLSX.utils.aoa_to_sheet(cartoesData);
    XLSX.utils.book_append_sheet(wb, wsCartoes, 'Cartões');

    const gastosData = [
      ['GASTOS VARIÁVEIS (OUTROS)'],
      [''],
      ['Nome', 'Data/Hora', 'Valor'],
      ...gastosVariaveis.map(g => [g.nome, formatDateTime(new Date(g.createdAt)), g.valor])
    ];
    const wsGastos = XLSX.utils.aoa_to_sheet(gastosData);
    XLSX.utils.book_append_sheet(wb, wsGastos, 'Gastos Variáveis');

    if (metas.length > 0) {
      const poupancaData = [
        ['POUPANÇA'],
        [''],
        ['Descrição', 'Valor Total', 'Valor Mensal', 'Meses para Completar'],
        ...metas.map(m => [m.descricao, m.valorTotal, m.valorMensal, Math.ceil(m.valorTotal / m.valorMensal)])
      ];
      const wsPoupanca = XLSX.utils.aoa_to_sheet(poupancaData);
      XLSX.utils.book_append_sheet(wb, wsPoupanca, 'Poupança');
    }

    const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    const periodo = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    addRelatorioExportado({
      dataExportacao: new Date(),
      periodo,
      totalDespesas,
      totalReceitas: salario,
      saldo
    });

    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1">Exportar Relatório</h3>
            <p className="text-sm text-muted-foreground">Gere um relatório completo em Excel com todas as suas finanças</p>
          </div>
          <FileText size={40} className="text-success" />
        </div>
        <button
          onClick={handleExportarExcel}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium"
        >
          <Download size={20} />
          Exportar para Excel
        </button>
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-xs text-foreground">
            <strong>O relatório incluirá:</strong> Resumo financeiro, Despesas Fixas, Cartões, Gastos Variáveis e Poupança do mês atual
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Histórico de Exportações</h3>
        {relatoriosExportados.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum relatório exportado ainda</p>
            <p className="text-muted-foreground text-xs mt-1">Exporte seu primeiro relatório usando o botão acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {relatoriosExportados.map((relatorio) => (
              <div key={relatorio.id} className="p-4 border border-border/40 rounded-xl hover:bg-accent transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-card-foreground text-sm mb-1">Relatório - {relatorio.periodo}</h4>
                    <p className="text-xs text-muted-foreground">{formatDateTime(new Date(relatorio.dataExportacao))}</p>
                  </div>
                  <FileText size={20} className="text-success" />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Receitas</p>
                    <p className="text-sm font-semibold text-success">R$ {relatorio.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Despesas</p>
                    <p className="text-sm font-semibold text-destructive">R$ {relatorio.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className={`text-sm font-semibold ${relatorio.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>R$ {Math.abs(relatorio.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
