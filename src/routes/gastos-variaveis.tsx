import { createFileRoute } from "@tanstack/react-router";
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { CurrencyInput } from '../components/CurrencyInput';
import { formatDateTime } from '../utils/dateFormatters';

export const Route = createFileRoute("/gastos-variaveis")({
  head: () => ({
    meta: [
      { title: "Gastos Variáveis - Finanças" },
      { name: "description", content: "Registre gastos esporádicos" },
    ],
  }),
  component: GastosVariaveis,
});

function GastosVariaveis() {
  const { gastosVariaveis, addGastoVariavel, updateGastoVariavel, deleteGastoVariavel, despesasFixas, cartoes, addGastoComCartao } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; nome: string }>({
    isOpen: false,
    id: '',
    nome: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    despesaId: '',
    formaPagamento: '',
    tipoCartao: '',
    cartaoId: '',
    numeroParcelas: '1'
  });

  const mostrarNome = !formData.despesaId;
  const mostrarTipoCartao = formData.formaPagamento === 'cartao';
  const mostrarParcelas = formData.formaPagamento === 'cartao' && formData.tipoCartao === 'credito';
  const mostrarQualCartao = formData.formaPagamento === 'cartao';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let nomeGasto = formData.nome;
    if (formData.despesaId) {
      const despesa = despesasFixas.find(d => d.id === formData.despesaId);
      nomeGasto = despesa?.nome || '';
    }

    if (!nomeGasto || !formData.valor) {
      toast.error('Preencha o nome e o valor do gasto');
      return;
    }

    const valorTotal = parseFloat(formData.valor);

    if (editingId) {
      updateGastoVariavel(editingId, {
        nome: nomeGasto,
        valor: valorTotal,
        createdAt: new Date()
      });
      toast.success('Gasto atualizado');
      setEditingId(null);
      setFormData({ nome: '', valor: '', despesaId: '', formaPagamento: '', tipoCartao: '', cartaoId: '', numeroParcelas: '1' });
    } else {
      const numeroParcelas = parseInt(formData.numeroParcelas) || 1;
      if (formData.despesaId) {
        const despesa = despesasFixas.find(d => d.id === formData.despesaId);
        const valorParcela = valorTotal / numeroParcelas;
        if (despesa && valorParcela > despesa.valor) {
          toast.error(`Valor da parcela (R$ ${valorParcela.toFixed(2)}) excede o saldo disponível em ${despesa.nome}`);
          return;
        }
      }
      if (formData.formaPagamento === 'cartao' && !formData.cartaoId) {
        toast.error('Selecione qual cartão usar');
        return;
      }
      if (formData.despesaId || formData.cartaoId) {
        addGastoComCartao(nomeGasto, valorTotal, formData.despesaId, formData.cartaoId, numeroParcelas);
        if (numeroParcelas > 1) {
          const valorParcela = valorTotal / numeroParcelas;
          toast.success(`Gasto parcelado em ${numeroParcelas}x de R$ ${valorParcela.toFixed(2)}!`);
        } else {
          toast.success('Gasto cadastrado!');
        }
      } else {
        addGastoVariavel({ nome: nomeGasto, valor: valorTotal, createdAt: new Date() });
        toast.success('Gasto cadastrado em "Outros"!');
      }
      setFormData({ nome: '', valor: '', despesaId: '', formaPagamento: '', tipoCartao: '', cartaoId: '', numeroParcelas: '1' });
    }
  };

  const handleEdit = (gasto: any) => {
    setFormData({
      nome: gasto.nome,
      valor: gasto.valor.toString(),
      despesaId: '',
      formaPagamento: '',
      tipoCartao: '',
      cartaoId: '',
      numeroParcelas: '1'
    });
    setEditingId(gasto.id);
  };

  const gastosOrdenados = [...gastosVariaveis].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Cadastrar Novo Gasto</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editingId && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Debitar de qual despesa? (Opcional)</label>
              <p className="text-xs text-muted-foreground mb-1">Se não preencher, o gasto será cadastrado na categoria "Outros"</p>
              <select
                value={formData.despesaId}
                onChange={(e) => { setFormData({ ...formData, despesaId: e.target.value, nome: '' }); }}
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
              >
                <option value="">Não debitar de despesa</option>
                {despesasFixas.map((despesa) => (
                  <option key={despesa.id} value={despesa.id}>
                    {despesa.nome} - R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} disponível
                  </option>
                ))}
              </select>
            </div>
          )}

          {(mostrarNome || editingId) && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nome do Gasto</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Restaurante"
                className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Valor</label>
            <CurrencyInput
              value={formData.valor}
              onChange={(value) => setFormData({ ...formData, valor: value })}
              placeholder="R$ 0,00"
              className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>

          {!editingId && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Forma de Pagamento (Opcional)</label>
                <select
                  value={formData.formaPagamento}
                  onChange={(e) => { setFormData({ ...formData, formaPagamento: e.target.value, tipoCartao: '', cartaoId: '', numeroParcelas: '1' }); }}
                  className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
                >
                  <option value="">Selecione a forma de pagamento</option>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                </select>
              </div>

              {mostrarTipoCartao && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Tipo de Cartão</label>
                  <select
                    value={formData.tipoCartao}
                    onChange={(e) => { setFormData({ ...formData, tipoCartao: e.target.value, numeroParcelas: '1' }); }}
                    className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
              )}

              {mostrarParcelas && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
                  <label className="block text-xs text-foreground mb-1">Número de Parcelas</label>
                  <select
                    value={formData.numeroParcelas}
                    onChange={(e) => setFormData({ ...formData, numeroParcelas: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm mb-1"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <option key={n} value={n}>
                        {n}x {n > 1 && formData.valor ? `de R$ ${(parseFloat(formData.valor) / n).toFixed(2)}` : '(à vista)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {parseInt(formData.numeroParcelas) > 1 ? (
                      <><strong>Parcelamento:</strong> O valor será dividido em {formData.numeroParcelas} meses consecutivos{formData.despesaId && ', debitando da despesa selecionada'}{formData.cartaoId && ', adicionando ao cartão'}.</>
                    ) : (
                      'Pagamento à vista no mês atual'
                    )}
                  </p>
                </div>
              )}

              {mostrarQualCartao && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Pagar com qual cartão?</label>
                  <select
                    value={formData.cartaoId}
                    onChange={(e) => { setFormData({ ...formData, cartaoId: e.target.value }); }}
                    className="w-full px-3 py-2 border border-input rounded-xl bg-background text-foreground text-sm"
                  >
                    <option value="">Selecione o cartão</option>
                    {cartoes.map((cartao) => (
                      <option key={cartao.id} value={cartao.id}>
                        {cartao.apelido} - R$ {cartao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 text-sm font-medium"
            >
              {editingId ? 'Atualizar Gasto' : 'Cadastrar Gasto'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData({ nome: '', valor: '', despesaId: '', formaPagamento: '', tipoCartao: '', cartaoId: '', numeroParcelas: '1' }); }}
                className="w-full mt-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-200 text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <h3 className="font-semibold text-card-foreground mb-3">Gastos Cadastrados</h3>
        <div className="space-y-2">
          {gastosOrdenados.map((gasto) => (
            <div
              key={gasto.id}
              className="p-3 border border-border/40 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="mb-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-card-foreground text-sm flex-1">{gasto.nome}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-card-foreground text-sm">
                      R$ {gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: gasto.id, nome: gasto.nome })}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{formatDateTime(new Date(gasto.createdAt))}</p>
              </div>
              <button
                onClick={() => handleEdit(gasto)}
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
        onConfirm={() => { deleteGastoVariavel(deleteModal.id); toast.success('Gasto excluído'); setDeleteModal({ isOpen: false, id: '', nome: '' }); }}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', nome: '' })}
      />
    </div>
  );
}
