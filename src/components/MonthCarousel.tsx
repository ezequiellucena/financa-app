import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface MonthCarouselProps {
  pageTitle: string;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthCarousel({ pageTitle }: MonthCarouselProps) {
  const {
    mesAtualSelecionado,
    setMesAtualSelecionado,
    despesasFixas,
    cartoes,
    gastosVariaveis,
    metas,
    salario,
  } = useFinance();

  const [ano, mesNum] = mesAtualSelecionado.split('-').map(Number);
  const monthName = monthNames[mesNum - 1];

  const totalDespesas =
    despesasFixas.reduce((s, d) => s + d.valor, 0) +
    cartoes.reduce((s, c) => s + c.valor, 0) +
    gastosVariaveis.reduce((s, g) => s + g.valor, 0) +
    metas.reduce((s, m) => s + m.valorMensal, 0);
  const saldo = salario - totalDespesas;

  const goToPreviousMonth = () => {
    const newMonth = mesNum === 1 ? 12 : mesNum - 1;
    const newYear = mesNum === 1 ? ano - 1 : ano;
    setMesAtualSelecionado(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const newMonth = mesNum === 12 ? 1 : mesNum + 1;
    const newYear = mesNum === 12 ? ano + 1 : ano;
    setMesAtualSelecionado(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div
      className="relative px-4 pt-6 pb-10 text-white rounded-b-[2.5rem] overflow-hidden"
      style={{ background: 'var(--gradient-header)' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-xs text-white/80 mt-1">
            {monthName} de {ano}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-full text-white/80 hover:bg-white/10 transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-white/80">
              Saldo Disponível
            </p>
            <p className="text-2xl font-bold mt-0.5">
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-full text-white/80 hover:bg-white/10 transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
