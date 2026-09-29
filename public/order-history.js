const historyPanel = document.querySelector('#history-panel');

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

async function loadOrderHistory() {
  try {
    const response = await fetch('/orders');
    if (!response.ok) {
      throw new Error('Erro ao carregar histórico');
    }

    const orders = await response.json();

    if (!orders.length) {
      historyPanel.innerHTML = '<div class="empty-history">Nenhum pedido registrado ainda.</div>';
      return;
    }

    historyPanel.innerHTML = orders
      .slice()
      .reverse()
      .map(
        (order) => `
          <article class="history-order">
            <div class="history-order-top">
              <h3>Pedido ${order.id.slice(0, 8)}</h3>
              <span class="status-pill">${order.status}</span>
            </div>

            <div class="history-meta">
              <span><strong>Cliente:</strong> ${order.customerName}</span>
              <span><strong>Mesa:</strong> ${order.tableNumber}</span>
              <span><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-BR')}</span>
            </div>

            <ul class="history-items">
              ${order.items
                .map(
                  (item) => `
                    <li>
                      <span>${item.quantity}x ${item.name}${item.options?.length ? ` <small>(${item.options.join(', ')})</small>` : ''}</span>
                      <strong>${formatCurrency(item.subtotal)}</strong>
                    </li>
                  `
                )
                .join('')}
            </ul>

            <div class="history-total">
              <span>Total</span>
              <span>${formatCurrency(order.total)}</span>
            </div>
          </article>
        `
      )
      .join('');
  } catch (error) {
    historyPanel.innerHTML = `<div class="empty-history">${error.message}</div>`;
  }
}

loadOrderHistory();
