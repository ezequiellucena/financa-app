import { createFileRoute } from "@tanstack/react-router";
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { CurrencyInput } from '../components/CurrencyInput';

export const Route = createFileRoute("/despesas-fixas")({
  head: () => ({
    meta: [
      { title: "Despesas Fixas - Finanças" },
      { name: "description", content: "Gerencie suas despesas fixas mensais" },
    ],
  }),
  component: DespesasFixas,
});

function DespesasFixas() {
  const { despesasFixas, addDespesaFixa, updateDespesaFixa, deleteDespesaFixa, categorias, addCategoria } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; nome: string }>({
    isOpen: false,
    id: '',
    nome: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    vencimento: '',
    categoria: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor || !formData.vencimento || !formData.categoria) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (editingId) {
      updateDespesaFixa(editingId, {
        nome: formData.nome,
        valor: parseFloat(formData.valor),
        vencimento: formData.vencimento,
        categoria: formData.categoria
      });
      toast.success('Despesa atualizada');
      setEditingId(null);
    } else {
      addDespesaFixa({
        nome: formData.nome,
        valor: parseFloat(formData.valor),
        vencimento: formData.vencimento,
        categoria: formData.categoria
      });
      toast.success('Despesa cadastrada');
    }
    setFormData({ nome: '', valor: '', vencimento: '', categoria: '' });
  };

  const handleAddCategoria = () => {
    if (novaCategoria.trim()) {
      addCategoria(novaCategoria.trim());
      setFormData({ ...formData, categoria: novaCategoria.trim() });
      setNovaCategoria('');
      setShowNovaCategoria(false);
      toast.success('Categoria adicionada');
    }
  };

  const handleEdit = (despesa: any) => {
    setFormData({
      nome: despesa.nome,
      valor: despesa.valor.toString(),
      vencimento: despesa.vencimento,
      categoria: despesa.categoria
    });
    setEditingId(despesa.id);
    setShowNovaCategoria(false);
  };

  const handleDeleteClick = (id: string, nome: string) => {
    setDeleteModal({ isOpen: true, id, nome });
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Cadastrar Nova Despesa</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Nome da Despesa</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Aluguel"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Valor</label>
            <CurrencyInput
              value={formData.valor}
              onChange={(value) => setFormData({ ...formData, valor: value })}
              placeholder="R$ 0,00"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Vencimento (Dia)</label>
            <input
              type="text"
              value={formData.vencimento}
              onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
              placeholder="Ex: 10"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Categoria</label>
            <select
              value={formData.categoria}
              onChange={(e) => {
                if (e.target.value === '__nova__') {
                  setShowNovaCategoria(true);
                  setFormData({ ...formData, categoria: '' });
                } else {
                  setFormData({ ...formData, categoria: e.target.value });
                  setShowNovaCategoria(false);
                }
              }}
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__nova__">+ Nova Categoria</option>
            </select>
          </div>
          {showNovaCategoria && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
              <label className="block text-xs text-foreground mb-2">Nome da Nova Categoria</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Ex: Pets, Vestuário"
                  className="flex-1 px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategoria();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategoria}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
            >
              {editingId ? 'Atualizar Despesa' : 'Cadastrar Despesa'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ nome: '', valor: '', vencimento: '', categoria: '' });
                  setShowNovaCategoria(false);
                }}
                className="w-full mt-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Despesas Cadastradas</h3>
        <div className="space-y-2">
          {despesasFixas.map((despesa) => (
            <div
              key={despesa.id}
              className="p-3 border border-border/40 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground text-sm">{despesa.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {despesa.categoria} • Vence dia {despesa.vencimento}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-card-foreground text-sm">
                    R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleDeleteClick(despesa.id, despesa.nome)}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleEdit(despesa)}
                className="w-full px-3 py-1.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 text-xs"
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        itemName={deleteModal.nome}
        onConfirm={() => { deleteDespesaFixa(deleteModal.id); toast.success('Despesa excluída'); setDeleteModal({ isOpen: false, id: '', nome: '' }); }}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', nome: '' })}
      />
    </div>
  );
}
