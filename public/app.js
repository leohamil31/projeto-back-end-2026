const state = {
  categories: [],
  products: [],
  selectedCategory: 'all',
  cart: [],
  paymentMethod: 'Cartão',
  customizingProduct: null,
  customizingQuantity: 1
};

const categoryList = document.querySelector('#categories');
const productList = document.querySelector('#products');
const cartItems = document.querySelector('#cart-items');
const subtotalEl = document.querySelector('#subtotal');
const totalEl = document.querySelector('#total');
const orderForm = document.querySelector('#order-form');
const checkoutModal = document.querySelector('#checkout-modal');
const checkoutSummary = document.querySelector('#checkout-summary');
const closeCheckout = document.querySelector('#close-checkout');
const cancelCheckout = document.querySelector('#cancel-checkout');
const confirmCheckout = document.querySelector('#confirm-checkout');
const paymentOptions = document.querySelectorAll('.payment-option');
const customerNameInput = document.querySelector('#customerName');
const tableNumberInput = document.querySelector('#tableNumber');
const customizeModal = document.querySelector('#customize-modal');
const customizeImage = document.querySelector('#customize-image');
const customizeTitle = document.querySelector('#customize-title');
const customizeDescription = document.querySelector('#customize-description');
const customizePrice = document.querySelector('#customize-price');
const customizeOptions = document.querySelector('#customize-options');
const customizeQuantity = document.querySelector('#customize-quantity');
const closeCustomize = document.querySelector('#close-customize');
const addCustomized = document.querySelector('#add-customized');
const customizeDecrease = document.querySelector('#customize-decrease');
const customizeIncrease = document.querySelector('#customize-increase');

const foodCustomizationOptions = [
  { id: 'molho-extra', name: 'Molho extra da casa', price: 4 },
  { id: 'parmesao', name: 'Parmesão ralado na hora', price: 3 },
  { id: 'bacon', name: 'Bacon crocante', price: 5 },
  { id: 'frango', name: 'Frango grelhado', price: 8 },
  { id: 'pimenta', name: 'Pimenta calabresa', price: 2 }
];

const dessertCustomizationOptions = [
  { id: 'calda-chocolate', name: 'Calda de chocolate extra', price: 3 },
  { id: 'chantilly', name: 'Chantilly', price: 3 },
  { id: 'amendoas', name: 'Raspas de amêndoas', price: 4 }
];

const WINE_PRODUCT_NAMES = ['Vinho Toscano', 'Chianti Classico', 'Pinot Grigio delle Venezie', 'Prosecco Veneto', 'Montepulciano d’Abruzzo'];
const SODA_PRODUCT_NAMES = ['Coca-Cola 600ml', 'Guaraná Antarctica 600ml', 'Fanta Laranja 600ml'];

const getCustomizationOptions = (product) => {
  if (WINE_PRODUCT_NAMES.includes(product.name)) {
    return [
      { id: 'taca-vinho', name: 'Taça de vinho', price: 0, replacePrice: 18, inputType: 'radio', group: 'wine-format' },
      { id: 'garrafa-vinho', name: 'Garrafa de vinho', price: 0, replacePrice: product.price, inputType: 'radio', group: 'wine-format' }
    ];
  }

  if (SODA_PRODUCT_NAMES.includes(product.name)) {
    return [
      { id: 'lata', name: 'Lata 350 ml', price: 0, replacePrice: 7.5, inputType: 'radio', group: 'soda-format' },
      { id: 'garrafa-600ml', name: 'Garrafa 600 ml', price: 0, replacePrice: product.price, inputType: 'radio', group: 'soda-format' },
      { id: 'copo-gelo', name: 'Copo com gelo', price: 1.5 },
      { id: 'limao', name: 'Com limão', price: 1 },
      { id: 'laranja', name: 'Com laranja', price: 1 }
    ];
  }

  const category = state.categories.find((item) => item.id === product.categoryId);
  if (category?.name === 'Bebidas') return [];
  if (category?.name === 'Sobremesas') return dessertCustomizationOptions;
  return foodCustomizationOptions;
};

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function getSelectedProducts() {
  if (state.selectedCategory === 'all') {
    return state.products;
  }

  return state.products.filter((product) => product.categoryId === state.selectedCategory);
}

function renderCategories() {
  const categories = [{ id: 'all', name: 'Todos' }, ...state.categories];

  categoryList.innerHTML = categories
    .map(
      (category) => `
        <button
          class="category-button ${state.selectedCategory === category.id ? 'active' : ''}"
          data-category="${category.id}"
          type="button"
        >
          ${category.name}
        </button>
      `
    )
    .join('');

  categoryList.querySelectorAll('.category-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCategory = button.dataset.category;
      renderCategories();
      renderProducts();
    });
  });
}

function renderProducts() {
  const products = getSelectedProducts();

  if (products.length === 0) {
    productList.innerHTML = '<p class="cart-empty">Nenhum produto disponível nesta categoria.</p>';
    return;
  }

  productList.innerHTML = products
    .map(
      (product) => `
        <article class="product-card" data-product-id="${product.id}" tabindex="0">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" data-category="${product.categoryId}" />
          </div>
          <div class="product-content">
            <div class="product-name">
              <h3>${product.name}</h3>
              <span class="product-price">${formatCurrency(product.price)}</span>
            </div>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
              <span class="product-badge ${product.isAvailable ? '' : 'out'}">
                ${product.isAvailable ? 'Disponível' : 'Indisponível'}
              </span>
              <button class="add-button" data-product-id="${product.id}" ${product.isAvailable ? '' : 'disabled'}>
                Personalizar
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  productList.querySelectorAll('.product-image img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-broken');
      image.parentElement.classList.add('image-missing');
      image.parentElement.dataset.label = image.alt;
    }, { once: true });
  });

  productList.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget;
      const product = state.products.find((item) => item.id === target.dataset.productId);

      if (!product) {
        return;
      }

      openCustomizeModal(product);
    });
  });

  productList.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      const product = state.products.find((item) => item.id === card.dataset.productId);
      if (product?.isAvailable) openCustomizeModal(product);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const product = state.products.find((item) => item.id === card.dataset.productId);
      if (product?.isAvailable) openCustomizeModal(product);
    });
  });
}

function addToCart(product, selectedOptions = [], quantity = 1) {
  const replacement = selectedOptions.find((option) => Number.isFinite(option.replacePrice));
  const optionPrice = selectedOptions.reduce((sum, option) => sum + option.price, 0);
  const configuredPrice = replacement ? replacement.replacePrice + optionPrice : product.price + optionPrice;
  const itemId = `${product.id}-${selectedOptions.map((option) => option.id).sort().join('-') || 'original'}`;
  const optionNames = selectedOptions.map((option) => option.name);
  const existingItem = state.cart.find((item) => item.id === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({
      id: itemId,
      productId: product.id,
      name: product.name,
      price: configuredPrice,
      quantity,
      options: optionNames
    });
  }

  renderCart();
}

function openCustomizeModal(product) {
  state.customizingProduct = product;
  state.customizingQuantity = 1;
  customizeImage.src = product.image;
  customizeImage.alt = product.name;
  customizeImage.dataset.category = product.categoryId;
  customizeTitle.textContent = product.name;
  customizeDescription.textContent = product.description;
  const options = getCustomizationOptions(product);
  customizePrice.textContent = formatCurrency(product.price);
  customizeOptions.innerHTML = options.length ? options
    .map((option) => `
      <label class="customize-option">
        <span><input type="${option.inputType || 'checkbox'}" name="${option.group || option.id}" value="${option.id}" ${['garrafa-vinho', 'garrafa-600ml'].includes(option.id) ? 'checked' : ''} /> ${option.name}</span>
        <strong>${Number.isFinite(option.replacePrice) ? 'Selecionar' : `+ ${formatCurrency(option.price)}`}</strong>
      </label>
    `)
    .join('') : '<p class="customize-empty">Este item já está pronto para servir.</p>';
  customizeQuantity.textContent = '1';
  customizeModal.classList.remove('hidden');
  customizeModal.setAttribute('aria-hidden', 'false');
}

function closeCustomizeModal() {
  customizeModal.classList.add('hidden');
  customizeModal.setAttribute('aria-hidden', 'true');
  state.customizingProduct = null;
}

function getSelectedCustomizations() {
  return Array.from(customizeOptions.querySelectorAll('input:checked'))
    .map((input) => {
      const productOptions = getCustomizationOptions(state.customizingProduct);
      return productOptions.find((option) => option.id === input.value);
    })
    .filter(Boolean);
}

function updateCartItem(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);

  if (!item) {
    return;
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }

  renderCart();
}

function renderCart() {
  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio. Escolha um prato para começar.</div>';
    subtotalEl.textContent = formatCurrency(0);
    totalEl.textContent = formatCurrency(0);
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <h4>${item.name}</h4>
            <small>${item.options?.length ? item.options.join(' · ') : 'Receita original'} · ${formatCurrency(item.price)} cada</small>
          </div>
          <div>
            <button type="button" data-action="decrease" data-product-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-action="increase" data-product-id="${item.id}">+</button>
          </div>
          <strong>${formatCurrency(item.price * item.quantity)}</strong>
        </div>
      `
    )
    .join('');

  cartItems.querySelectorAll('button[data-product-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const current = event.currentTarget;
      const productId = current.dataset.productId;
      const action = current.dataset.action;

      if (action === 'increase') {
        updateCartItem(productId, 1);
      }

      if (action === 'decrease') {
        updateCartItem(productId, -1);
      }
    });
  });

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotalEl.textContent = formatCurrency(subtotal);
  totalEl.textContent = formatCurrency(subtotal);
}

function renderCheckoutSummary() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const customerName = customerNameInput.value.trim();
  const tableNumber = tableNumberInput.value.trim();

  checkoutSummary.innerHTML = `
    <div class="checkout-summary-row">
      <span>Cliente</span>
      <strong>${customerName || 'Não informado'}</strong>
    </div>
    <div class="checkout-summary-row">
      <span>Mesa</span>
      <strong>${tableNumber || '-'}</strong>
    </div>
    <div class="checkout-summary-row">
      <span>Pagamento</span>
      <strong>${state.paymentMethod}</strong>
    </div>
    <div class="checkout-summary-list">
      ${state.cart
        .map(
          (item) => `
            <div class="checkout-summary-item">
              <span>${item.quantity}x ${item.name}</span>
              <strong>${formatCurrency(item.price * item.quantity)}</strong>
            </div>
          `
        )
        .join('')}
    </div>
    <div class="checkout-summary-row">
      <span>Total</span>
      <strong>${formatCurrency(subtotal)}</strong>
    </div>
  `;
}

function openCheckoutModal() {
  renderCheckoutSummary();
  checkoutModal.classList.remove('hidden');
  checkoutModal.setAttribute('aria-hidden', 'false');
}

function closeCheckoutModal() {
  checkoutModal.classList.add('hidden');
  checkoutModal.setAttribute('aria-hidden', 'true');
}

function setPaymentMethod(method) {
  state.paymentMethod = method;

  paymentOptions.forEach((option) => {
    const isActive = option.querySelector('input').value === method;
    option.classList.toggle('active', isActive);
    option.querySelector('input').checked = isActive;
  });

  if (!checkoutModal.classList.contains('hidden')) {
    renderCheckoutSummary();
  }
}

async function loadCatalog() {
  try {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch('/categories'),
      fetch('/products')
    ]);

    if (!categoriesResponse.ok || !productsResponse.ok) {
      throw new Error('Não foi possível carregar o cardápio');
    }

    state.categories = await categoriesResponse.json();
    state.products = await productsResponse.json();

    renderCategories();
    renderProducts();
    renderCart();
  } catch (error) {
    productList.innerHTML = `<p class="cart-empty">${error.message}</p>`;
  }
}

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (state.cart.length === 0) {
    alert('Adicione pelo menos um item ao pedido.');
    return;
  }

  const customerName = customerNameInput.value.trim();
  const tableNumber = Number(tableNumberInput.value);

  if (!customerName || !tableNumber) {
    alert('Preencha o nome e a mesa antes de finalizar.');
    return;
  }

  renderCheckoutSummary();
  openCheckoutModal();
});

closeCheckout.addEventListener('click', closeCheckoutModal);
cancelCheckout.addEventListener('click', closeCheckoutModal);

confirmCheckout.addEventListener('click', async () => {
  const customerName = customerNameInput.value.trim();
  const tableNumber = Number(tableNumberInput.value);

  if (!customerName || !tableNumber || state.cart.length === 0) {
    closeCheckoutModal();
    alert('Revise os dados do pedido antes de confirmar.');
    return;
  }

  const payload = {
    customerName,
    tableNumber,
    items: state.cart.map((item) => ({
      productId: item.productId || item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      options: item.options || []
    })),
    paymentMethod: state.paymentMethod
  };

  try {
    const response = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Não foi possível concluir o pedido.');
    }

    const order = await response.json();
    closeCheckoutModal();
    state.cart = [];
    orderForm.reset();
    renderCart();
    alert(`Pedido ${order.id} confirmado! Pagamento: ${state.paymentMethod} no caixa.`);
    window.location.href = `/order-status?orderId=${encodeURIComponent(order.id)}`;
  } catch (error) {
    closeCheckoutModal();
    alert(error.message);
  }
});

paymentOptions.forEach((option) => {
  option.addEventListener('click', () => {
    const selectedValue = option.querySelector('input').value;
    setPaymentMethod(selectedValue);
  });
});

customerNameInput.addEventListener('input', () => {
  if (!checkoutModal.classList.contains('hidden')) {
    renderCheckoutSummary();
  }
});

tableNumberInput.addEventListener('input', () => {
  if (!checkoutModal.classList.contains('hidden')) {
    renderCheckoutSummary();
  }
});

loadCatalog();

closeCustomize.addEventListener('click', closeCustomizeModal);
customizeModal.addEventListener('click', (event) => {
  if (event.target === customizeModal) closeCustomizeModal();
});

customizeDecrease.addEventListener('click', () => {
  state.customizingQuantity = Math.max(1, state.customizingQuantity - 1);
  customizeQuantity.textContent = String(state.customizingQuantity);
});

customizeIncrease.addEventListener('click', () => {
  state.customizingQuantity += 1;
  customizeQuantity.textContent = String(state.customizingQuantity);
});

addCustomized.addEventListener('click', () => {
  if (!state.customizingProduct) return;
  addToCart(state.customizingProduct, getSelectedCustomizations(), state.customizingQuantity);
  closeCustomizeModal();
});

customizeImage.addEventListener('error', () => {
  customizeImage.classList.add('image-broken');
});
