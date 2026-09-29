const panel = document.querySelector('#order-status-panel');
const orderId = new URLSearchParams(window.location.search).get('orderId');
let lastRenderedState = null;

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function renderStatusScreen(order) {
  const steps = ['Recebido', 'Preparando', 'Pronto'];
  const currentIndex = order.status === 'Entregue' ? steps.length - 1 : steps.indexOf(order.status);

  panel.innerHTML = `
    <div class="status-top">
      <div>
        <span class="status-pill">Pedido ${order.id.slice(0, 8)}</span>
      </div>
      <div class="status-pill status-${order.status.toLowerCase()}" aria-live="polite">${order.status}</div>
    </div>

    <div class="order-summary">
      <div class="summary-box">
        <label>Cliente</label>
        <strong>${order.customerName}</strong>
      </div>
      <div class="summary-box">
        <label>Mesa</label>
        <strong>${order.tableNumber}</strong>
      </div>
      <div class="summary-box">
        <label>Total</label>
        <strong>${formatCurrency(order.total)}</strong>
      </div>
      <div class="summary-box">
        <label>Pagamento</label>
        <strong>${order.paymentMethod || 'Não informado'} · ${order.paymentStatus || 'Aguardando'}</strong>
      </div>
    </div>

    <p class="payment-note">Pagamento selecionado: ${order.paymentMethod || 'não informado'}. Conclua no caixa.</p>

    <ul class="timeline">
      ${steps
        .map(
          (step, index) => `
            <li class="${index <= currentIndex ? 'active' : ''}">
              <span>${step}</span>
              <strong>${index <= currentIndex ? '✓' : '•'}</strong>
            </li>
          `
        )
        .join('')}
    </ul>
    <p class="status-refresh-note" aria-live="polite">Atualização automática ativada</p>
  `;

  lastRenderedState = `${order.status}:${order.paymentStatus ?? ''}`;
}

async function loadLatestOrder() {
  try {
    const response = await fetch(orderId ? `/orders/${encodeURIComponent(orderId)}` : '/orders');
    if (!response.ok) {
      throw new Error('Erro ao carregar pedido');
    }

    const result = await response.json();
    if (!orderId && !result.length) {
      panel.innerHTML = '<div class="summary-box"><strong>Nenhum pedido registrado.</strong></div>';
      return;
    }

    const selectedOrder = orderId ? result : result[result.length - 1];

    if (!selectedOrder) {
      panel.innerHTML = '<div class="summary-box"><strong>Pedido não encontrado.</strong></div>';
      return;
    }

    const renderedState = `${selectedOrder.status}:${selectedOrder.paymentStatus ?? ''}`;
    if (renderedState !== lastRenderedState) {
      renderStatusScreen(selectedOrder);
    }
  } catch (error) {
    panel.innerHTML = `<div class="summary-box"><strong>${error.message}</strong></div>`;
  }
}

loadLatestOrder();
window.setInterval(loadLatestOrder, 3000);
