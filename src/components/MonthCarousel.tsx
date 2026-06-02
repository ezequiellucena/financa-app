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
  const { mesAtualSelecionado, setMesAtualSelecionado, anoSelecionado, setAnoSelecionado } = useFinance();

  const [ano, mesNum] = mesAtualSelecionado.split('-').map(Number);
  const monthName = monthNames[mesNum - 1];

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

  const changeYear = (delta: number) => {
    setAnoSelecionado(anoSelecionado + delta);
    setMesAtualSelecionado(`${anoSelecionado + delta}-01`);
  };

  return (
    <div className="bg-card/50 backdrop-blur-xl border-b border-border/40 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div>
          <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 rounded-xl hover:bg-secondary/60 transition-colors text-muted-foreground"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center min-w-[100px]">
            <p className="text-sm font-medium text-foreground">{monthName}</p>
            <p className="text-xs text-muted-foreground">{ano}</p>
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-xl hover:bg-secondary/60 transition-colors text-muted-foreground"
          >
            <ChevronRight size={18} />
          </button>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => changeYear(-1)}
              className="px-2 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/70 transition-colors text-secondary-foreground"
            >
              &larr; Ano
            </button>
            <button
              onClick={() => changeYear(1)}
              className="px-2 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/70 transition-colors text-secondary-foreground"
            >
              Ano &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
