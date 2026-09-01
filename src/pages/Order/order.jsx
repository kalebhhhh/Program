import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './styleORDER.css';

const API_BASE = 'http://localhost:3322';
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function OrderPage({ onNavigateHome }) {
  const [products, setProducts] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [valorRecebido, setValorRecebido] = useState('');
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [isPixViewOpen, setIsPixViewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pedidoCriado, setPedidoCriado] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    categoria: '',
    price: '',
    estoque: '1',
    observacao: ''
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos para pedido:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/clientes`);
      setClientes(response.data.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/pedidos/pendentes`);
      setPendingOrders(response.data.pedidos || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos pendentes:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchClientes();
    fetchPendingOrders();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.categoria).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedClient = clientes.find((cliente) => String(cliente.id) === String(selectedClientId));

  const addExistingItem = (product) => {
    setCart((current) => {
      const index = current.findIndex((item) => item.id === product.id && item.source === 'existente');

      if (index >= 0) {
        return current.map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          quantity: 1,
          categoria: product.categoria || 'Geral',
          image: product.image || '',
          source: 'existente'
        }
      ];
    });
  };

  const addNewItem = () => {
    if (!newItem.name.trim()) {
      alert('Informe o nome do item novo.');
      return;
    }

    if (!newItem.price || Number(newItem.price) <= 0) {
      alert('Informe um preço válido para o item novo.');
      return;
    }

    setCart((current) => [
      ...current,
      {
        id: Date.now(),
        name: newItem.name,
        price: Number(newItem.price),
        quantity: Number(newItem.estoque || 1),
        categoria: newItem.categoria || 'Novo',
        observacao: newItem.observacao || '',
        source: 'novo'
      }
    ]);

    setNewItem({
      name: '',
      categoria: '',
      price: '',
      estoque: '1',
      observacao: ''
    });
  };

  const updateCartQuantity = (id, nextQuantity) => {
    if (nextQuantity <= 0) {
      setCart((current) => current.filter((item) => item.id !== id));
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: nextQuantity } : item
      )
    );
  };

  const removeCartItem = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPedido = subtotal;
  const troco = paymentMethod === 'DINHEIRO' ? Number(valorRecebido || 0) - totalPedido : 0;

  const validateCart = () => {
    if (!cart.length) {
      setErrorMessage('Adicione ao menos um item ao pedido antes de finalizar.');
      return false;
    }

    if (paymentMethod === 'DINHEIRO' && Number(valorRecebido || 0) < totalPedido) {
      setErrorMessage('O valor recebido em dinheiro não pode ser menor que o total da compra.');
      return false;
    }

    return true;
  };

  const handleCreatePedido = async () => {
    if (!validateCart()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload = {
        clienteId: selectedClientId || null,
        nomeCliente: selectedClient ? selectedClient.nome : '',
        cpfCnpj: selectedClient ? selectedClient.cpf || selectedClient.cnpj : '',
        desconto: 0,
        formaPagamento: paymentMethod,
        valorRecebido: paymentMethod === 'DINHEIRO' ? Number(valorRecebido || 0) : 0,
        itens: cart.map((item) => ({
          produtoId: item.id,
          nomeProduto: item.name,
          quantidade: Number(item.quantity || 1),
          valorUnitario: Number(item.price || 0),
          valorTotal: Number(item.price || 0) * Number(item.quantity || 1)
        }))
      };

      const response = await axios.post(`${API_BASE}/pedidos`, payload);
      const pedido = response.data.pedido;
      setPedidoCriado(pedido);
      setSuccessMessage('Pedido criado com sucesso.');
      setCart([]);
      setSelectedClientId('');
      setValorRecebido('');
      setPaymentMethod('PIX');
      if (payload.formaPagamento === 'PIX') {
        setIsPixViewOpen(true);
      }
      await fetchPendingOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Não foi possível criar o pedido.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (pedidoId) => {
    try {
      await axios.patch(`${API_BASE}/pedidos/${pedidoId}/confirmar-pagamento`);
      await fetchPendingOrders();
      setSuccessMessage('Pagamento confirmado com sucesso.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Não foi possível confirmar o pagamento.');
    }
  };

  const handleDownloadRecibo = (pedidoId) => {
    window.open(`${API_BASE}/pedidos/${pedidoId}/pdf/download`, '_blank');
  };

  return (
    <div className="wrapper">
      <div className="menusLeft">
        <div className="backgroundMENU">
          <div className="menuICO" onClick={onNavigateHome}>
            <span className="menu-icon menu-icon--product" aria-hidden="true" />
            <span className="menu-text">Produtos</span>
          </div>
          <div className="menuICO active-item">
            <span className="menu-icon menu-icon--order" aria-hidden="true" />
            <span className="menu-text">Vendas</span>
          </div>
          <div className="menuICO">
            <span className="menu-icon menu-icon--user" aria-hidden="true" />
            <span className="menu-text">Usuários</span>
          </div>
          <div className="menuICO">
            <span className="menu-icon menu-icon--config" aria-hidden="true" />
            <span className="menu-text">Configurações</span>
          </div>
        </div>
      </div>

      <main className="order-page">
        <header className="order-header">
          <div>
            <p className="eyebrow">Operação</p>
            <h1>Novo pedido</h1>
          </div>
          <button type="button" className="primary-button" onClick={() => setIsFinalizeOpen(true)}>
            Finalizar pedido
          </button>
        </header>

        {errorMessage && <div className="alert-box alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert-box alert-success">{successMessage}</div>}

        <div className="order-layout">
          <section className="order-main">
            <div className="order-card">
              <div className="card-header">
                <h2>Adicionar novo item</h2>
                <span>Pedido personalizado</span>
              </div>

              <div className="new-item-form">
                <label>
                  Nome do item
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(event) => setNewItem({ ...newItem, name: event.target.value })}
                    placeholder="Ex: Lanche especial"
                  />
                </label>

                <label>
                  Categoria
                  <input
                    type="text"
                    value={newItem.categoria}
                    onChange={(event) => setNewItem({ ...newItem, categoria: event.target.value })}
                    placeholder="Ex: Bebidas"
                  />
                </label>

                <label>
                  Quantidade
                  <input
                    type="number"
                    min="1"
                    value={newItem.estoque}
                    onChange={(event) => setNewItem({ ...newItem, estoque: event.target.value })}
                  />
                </label>

                <label>
                  Valor unitário
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={(event) => setNewItem({ ...newItem, price: event.target.value })}
                    placeholder="0,00"
                  />
                </label>

                <label className="full-width">
                  Observação
                  <textarea
                    rows="3"
                    value={newItem.observacao}
                    onChange={(event) => setNewItem({ ...newItem, observacao: event.target.value })}
                    placeholder="Observações do pedido..."
                  />
                </label>

                <button type="button" className="secondary-button" onClick={addNewItem}>Adicionar ao pedido</button>
              </div>
            </div>

            <div className="order-card">
              <div className="card-header">
                <h2>Adicionar item existente</h2>
                <span>{filteredProducts.length} itens</span>
              </div>

              <div className="filters-row">
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="product-list">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div className="product-item" key={product.id}>
                      <div className="product-image-wrap">
                        {product.image ? (
                          <img src={`${API_BASE}/uploads/imgProducts/${product.image}`} alt={product.name} />
                        ) : (
                          <span>IMG</span>
                        )}
                      </div>

                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <span>{product.categoria || 'Sem categoria'}</span>
                        <small>{product.estoque ? `${product.estoque} em estoque` : 'Sem estoque'}</small>
                      </div>

                      <div className="product-meta">
                        <b>{currency.format(Number(product.price || 0))}</b>
                        <button type="button" onClick={() => addExistingItem(product)}>Adicionar</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Nenhum produto encontrado.</div>
                )}
              </div>
            </div>
          </section>

          <aside className="order-summary">
            <div className="summary-header">
              <h2>Resumo</h2>
              <span>{totalItems} itens</span>
            </div>

            <div className="summary-list">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.categoria}</small>
                    </div>

                    <div className="summary-item-control">
                      <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>

                    <b>{currency.format(item.price * item.quantity)}</b>
                  </div>
                ))
              ) : (
                <div className="empty-state empty-state--summary">Seu pedido ainda está vazio.</div>
              )}
            </div>

            <div className="summary-values">
              <div>
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <div>
                <span>Entrega</span>
                <strong>R$ 0,00</strong>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>{currency.format(totalPedido)}</strong>
              </div>
            </div>

            <button type="button" className="primary-button full-width" onClick={() => setIsFinalizeOpen(true)}>
              Confirmar pedido
            </button>
            <section className="orders-section">
          <div className="card-header orders-header">
            <h2>PEDIDOS</h2>
            <span>{pendingOrders.length} pendentes</span>
          </div>

          <div className="orders-list">
            {pendingOrders.length ? (
              pendingOrders.map((pedido) => (
                <div className="order-card pending-order" key={pedido.id}>
                  <div className="pending-order-header">
                    <div>
                      <strong>Pedido #{pedido.numeroPedido}</strong>
                      <p>
                        Cliente: {pedido.nomeCliente || 'Sem cliente'}
                      </p>
                    </div>
                    <label className="payment-checkbox">
                      <input
                        type="checkbox"
                        checked={pedido.status === 'CONCLUIDO'}
                        onChange={() => handleConfirmPayment(pedido.id)}
                      />
                      Pagamento Confirmado
                    </label>
                  </div>

                  <div className="pending-order-body">
                    <span>Data: {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>Hora: {new Date(pedido.createdAt).toLocaleTimeString('pt-BR')}</span>
                    <span>Valor: {currency.format(Number(pedido.total || 0))}</span>
                    <span>Pagamento: {pedido.formaPagamento}</span>
                    <span>Status: {pedido.status}</span>
                  </div>

                  <div className="pending-order-actions">
                    <button type="button" onClick={() => handleDownloadRecibo(pedido.id)}>
                      Baixar recibo
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">Nenhum pedido pendente.</div>
            )}
          </div>
        </section>
          </aside>
        </div>
      </main>

      {isPixViewOpen && pedidoCriado?.pixQrCode && (
        <div className="pix-screen-backdrop" onClick={() => setIsPixViewOpen(false)}>
          <div className="pix-screen" onClick={(event) => event.stopPropagation()}>
            <div className="pix-screen-header">
              <div>
                <p className="eyebrow">Pagamento</p>
                <h2>QR Code PIX</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setIsPixViewOpen(false)}>
                ×
              </button>
            </div>

            <div className="pix-screen-content">
              <div className="pix-qr-card">
                <img src={pedidoCriado.pixQrCode} alt="QR Code PIX" className="pix-qr" />
              </div>

              <div className="pix-copy-card">
                <span>Código PIX copia e cola</span>
                <textarea value={pedidoCriado.pixCopiaCola || ''} readOnly rows="8" />
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigator.clipboard?.writeText(pedidoCriado.pixCopiaCola || '')}
                >
                  Copiar código
                </button>
              </div>
            </div>

            <div className="pix-screen-footer">
              <span>Valor total</span>
              <strong>{currency.format(Number(pedidoCriado.total || 0))}</strong>
            </div>
          </div>
        </div>
      )}

      {isFinalizeOpen && (
        <div className="modal-backdrop" onClick={() => setIsFinalizeOpen(false)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Finalizar Venda</h2>
              <button type="button" className="close-button" onClick={() => setIsFinalizeOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="finalize-order-card">
                <div className="finalize-header">
                  <div>
                    <strong>Pedido temporário</strong>
                    <span>{new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</span>
                  </div>
                  <span className="total-box">Total: {currency.format(totalPedido)}</span>
                </div>

                <div className="finalize-items">
                  {cart.map((item) => (
                    <div className="finalize-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          {item.quantity} x {currency.format(item.price)}
                        </small>
                      </div>
                      <span>{currency.format(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>

                <div className="finalize-totals">
                  <div><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
                  <div><span>Descontos</span><strong>R$ 0,00</strong></div>
                  <div className="grand-total"><span>Total</span><strong>{currency.format(totalPedido)}</strong></div>
                </div>
              </div>

              <div className="customer-box">
                <label>
                  Cliente (opcional)
                  <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}>
                    <option value="">Sem cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.cpf || cliente.cnpj || 'Sem documento'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="payment-options">
                <h3>Formas de pagamento</h3>
                <div className="payment-grid">
                  {['PIX', 'DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={paymentMethod === method ? 'payment-option active' : 'payment-option'}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method === 'PIX' ? 'PIX' : method === 'DINHEIRO' ? 'Dinheiro' : method === 'CARTAO_CREDITO' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'PIX' && (
                <div className="pix-box">
                  <div className="pix-box-header">
                    <h4>Pagamento PIX</h4>
                    {pedidoCriado?.pixQrCode && (
                      <button type="button" className="secondary-button" onClick={() => setIsPixViewOpen(true)}>
                        Abrir QR Code
                      </button>
                    )}
                  </div>

                  {pedidoCriado?.pixQrCode ? (
                    <p>Pedido gerado com sucesso. Abra o QR Code para visualizar o pagamento Pix.</p>
                  ) : (
                    <p>Ao confirmar, o sistema gerará o QR Code PIX e o código copia e cola com o valor total.</p>
                  )}
                </div>
              )}

              {paymentMethod === 'DINHEIRO' && (
                <div className="money-box">
                  <label>
                    Valor Total
                    <input type="text" value={currency.format(totalPedido)} readOnly />
                  </label>
                  <label>
                    Valor Recebido
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={valorRecebido}
                      onChange={(event) => setValorRecebido(event.target.value)}
                    />
                  </label>
                  <div className="troco-box">
                    <span>Troco</span>
                    <strong>{currency.format(troco > 0 ? troco : 0)}</strong>
                  </div>
                </div>
              )}

              {(paymentMethod === 'CARTAO_CREDITO' || paymentMethod === 'CARTAO_DEBITO') && (
                <div className="terminal-box">
                  <strong>Continue a operação na maquininha.</strong>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setIsFinalizeOpen(false)}>
                Voltar
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleCreatePedido}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Continuar para Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderPage;