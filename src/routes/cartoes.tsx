import { createFileRoute } from "@tanstack/react-router";
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { CurrencyInput } from '../components/CurrencyInput';

export const Route = createFileRoute("/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões - Finanças" },
      { name: "description", content: "Gerencie seus cartões de crédito" },
    ],
  }),
  component: Cartoes,
});

function Cartoes() {
  const { cartoes, addCartao, updateCartao, deleteCartao } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; nome: string }>({
    isOpen: false,
    id: '',
    nome: ''
  });

  const [formData, setFormData] = useState({
    apelido: '',
    bandeira: '',
    valor: '',
    vencimento: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apelido || !formData.bandeira || !formData.valor || !formData.vencimento) {
      toast.error('Preencha todos os campos');
      return;
    }
    const diaVencimento = parseInt(formData.vencimento);
    if (isNaN(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
      toast.error('Vencimento deve ser um dia válido entre 1 e 31');
      return;
    }
    if (editingId) {
      updateCartao(editingId, {
        apelido: formData.apelido,
        bandeira: formData.bandeira,
        valor: parseFloat(formData.valor),
        vencimento: formData.vencimento.padStart(2, '0')
      });
      toast.success('Cartão atualizado');
      setEditingId(null);
    } else {
      addCartao({
        apelido: formData.apelido,
        bandeira: formData.bandeira,
        valor: parseFloat(formData.valor),
        vencimento: formData.vencimento.padStart(2, '0')
      });
      toast.success('Cartão cadastrado');
    }
    setFormData({ apelido: '', bandeira: '', valor: '', vencimento: '' });
  };

  const handleEdit = (cartao: any) => {
    setFormData({
      apelido: cartao.apelido,
      bandeira: cartao.bandeira,
      valor: cartao.valor.toString(),
      vencimento: cartao.vencimento
    });
    setEditingId(cartao.id);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Cadastrar Novo Cartão</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Apelido</label>
            <input
              type="text"
              value={formData.apelido}
              onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
              placeholder="Ex: Meu Nubank"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Bandeira</label>
            <input
              type="text"
              value={formData.bandeira}
              onChange={(e) => setFormData({ ...formData, bandeira: e.target.value })}
              placeholder="Ex: Visa, Mastercard"
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
            <label className="block text-xs text-muted-foreground mb-1">Vencimento (Dia do Mês)</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.vencimento}
              onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
              placeholder="Ex: 10"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
            >
              {editingId ? 'Atualizar Cartão' : 'Cadastrar Cartão'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData({ apelido: '', bandeira: '', valor: '', vencimento: '' }); }}
                className="w-full mt-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Cartões Cadastrados</h3>
        <div className="space-y-2">
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className="p-3 border border-border/40 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground text-sm">{cartao.apelido}</p>
                  <p className="text-xs text-muted-foreground">{cartao.bandeira} • Vence dia {cartao.vencimento}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-card-foreground text-sm">
                    R$ {cartao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: cartao.id, nome: cartao.apelido })}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleEdit(cartao)}
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
        onConfirm={() => { deleteCartao(deleteModal.id); toast.success('Cartão excluído'); setDeleteModal({ isOpen: false, id: '', nome: '' }); }}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', nome: '' })}
      />
    </div>
  );
}
