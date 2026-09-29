const newOrdersPanel = document.querySelector('#new-orders-panel');
const readyOrdersPanel = document.querySelector('#ready-orders-panel');
const newOrdersCount = document.querySelector('#new-orders-count');
const readyOrdersCount = document.querySelector('#ready-orders-count');
let kitchenOrders = [];

async function loadKitchenOrders() {
  try {
    const response = await fetch('/orders/kitchen');
    if (!response.ok) {
      throw new Error('Erro ao carregar pedidos da cozinha');
    }

    kitchenOrders = await response.json();
    renderKitchenOrders();
  } catch (error) {
    newOrdersPanel.innerHTML = `<div class="kitchen-card"><h3>Não foi possível carregar a cozinha</h3><p>${error.message}</p></div>`;
    readyOrdersPanel.innerHTML = '';
  }
}

function renderOrderCard(order) {
  return `
    <article class="kitchen-card">
      <span class="order-status-badge">${order.status}</span>
      <h3>Pedido ${order.id.slice(0, 8)}</h3>
      <p><strong>Cliente:</strong> ${order.customerName}</p>
      <p><strong>Mesa:</strong> ${order.tableNumber}</p>
      <p><strong>Pagamento:</strong> ${order.paymentMethod || 'Não informado'} · ${order.paymentStatus || 'Aguardando'}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
      <ul class="kitchen-items">
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
      <div class="status-actions">
        ${renderStatusActions(order)}
      </div>
    </article>
  `;
}

function attachStatusListeners(container) {
  container.querySelectorAll('[data-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const orderId = button.dataset.orderId;
      const nextStatus = button.dataset.status;

      await fetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      await loadKitchenOrders();
    });
  });
}

function renderKitchenOrders() {
  const newOrders = kitchenOrders.filter((order) => order.status !== 'Pronto');
  const readyOrders = kitchenOrders.filter((order) => order.status === 'Pronto');

  newOrdersCount.textContent = String(newOrders.length);
  readyOrdersCount.textContent = String(readyOrders.length);

  newOrdersPanel.innerHTML = newOrders.length
    ? newOrders.map(renderOrderCard).join('')
    : '<div class="kitchen-empty"><strong>Nenhum pedido novo</strong><br />A cozinha está liberada no momento.</div>';

  readyOrdersPanel.innerHTML = readyOrders.length
    ? readyOrders.map(renderOrderCard).join('')
    : '<div class="kitchen-empty"><strong>Nenhum pedido pronto</strong><br />Os pedidos prontos aparecerão aqui.</div>';

  attachStatusListeners(newOrdersPanel);
  attachStatusListeners(readyOrdersPanel);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function renderStatusActions(order) {
  const nextStatus = {
    Recebido: { label: 'Iniciar preparo', status: 'Preparando', className: 'secondary' },
    Preparando: { label: 'Marcar como pronto', status: 'Pronto', className: 'primary' },
    Pronto: { label: 'Entregar pedido', status: 'Entregue', className: 'primary' }
  }[order.status];

  if (!nextStatus) return '<p class="order-complete">Pedido entregue</p>';

  return `<button class="status-button ${nextStatus.className}" data-order-id="${order.id}" data-status="${nextStatus.status}">${nextStatus.label}</button>`;
}

loadKitchenOrders();
window.setInterval(loadKitchenOrders, 5000);
