const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");

const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");

let currentFilter = "todos";

function readStorage(key, fallbackValue) {
    try {
        const savedValue = localStorage.getItem(key);
        return savedValue ? JSON.parse(savedValue) : fallbackValue;
    } catch {
        return fallbackValue;
    }
}

// Aplica ao catálogo o estoque salvo no navegador, se houver.
const savedStocks = readStorage("nexastore-stock", {});

products.forEach(product => {
    const savedStock = Number(savedStocks[product.id]);

    if (
        Object.prototype.hasOwnProperty.call(savedStocks, product.id) &&
        Number.isInteger(savedStock) &&
        savedStock >= 0
    ) {
        product.stock = savedStock;
    }

    product.stock = Number(product.stock) || 0;
});

function loadCart() {
    const savedCart = readStorage("nexastore-cart", []);

    if (!Array.isArray(savedCart)) {
        return [];
    }

    return savedCart.map(savedItem => {
        const product = products.find(item => item.id === savedItem.id);

        if (!product) {
            return null;
        }

        const savedQuantity = Math.max(
            0,
            Math.floor(Number(savedItem.quantity) || 0)
        );

        const quantity = Math.min(savedQuantity, product.stock);

        if (quantity === 0) {
            return null;
        }

        return {
            ...product,
            quantity
        };
    }).filter(Boolean);
}

let cart = loadCart();

function renderProducts(filter = currentFilter) {
    currentFilter = filter;

    const filteredProducts = products.filter(product => {
        return filter === "todos" || product.category === filter;
    });

    productsGrid.innerHTML = filteredProducts.map(product => {
        const isOutOfStock = product.stock <= 0;

        return `
            <article class="product-card">
                <div class="product-image ${product.color}">
                    ${
                        product.badge
                            ? `<span class="product-badge">${product.badge}</span>`
                            : ""
                    }

                    <button
                        class="favorite-button"
                        type="button"
                        title="Adicionar aos favoritos"
                    >
                        ♡
                    </button>

                    ${
                        product.image
                            ? `<img class="product-photo" src="${product.image}" alt="${product.name}">`
                          : `<span class="product-symbol">${product.icon}</span>`  
                    }
                </div>

                <div class="product-info">
                    <span class="product-category">
                        ${product.categoryName}
                    </span>

                    <h3>${product.name}</h3>

                    <div class="product-rating">
                        <span>★</span>
                        <strong>${product.rating}</strong>
                        <small>(${product.reviews})</small>
                    </div>

                    <div class="product-pricing">
                        ${
                            product.oldPrice
                                ? `<del>${product.oldPrice}</del>`
                                : ""
                        }

                        <strong>${product.price}</strong>
                        <small>${product.installment}</small>
                    </div>

                    <small class="stock-info">
                        ${
                            isOutOfStock
                                ? "Esgotado"
                                : `Em estoque: ${product.stock}`
                        }
                    </small>

                    <button
                        class="add-cart-button"
                        data-product-id="${product.id}"
                        ${isOutOfStock ? "disabled" : ""}
                    >
                        ${isOutOfStock ? "Produto esgotado" : "Adicionar ao carrinho"}
                        <span>+</span>
                    </button>
                </div>
            </article>
        `;
    }).join("");

    addCartEvents();
}

function addCartEvents() {
    const buttons = document.querySelectorAll(".add-cart-button");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const productId = Number(button.dataset.productId);
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    if (product.stock <= 0) {
        showToast("Este produto está esgotado.");
        return;
    }

    const cartItem = cart.find(item => item.id === productId);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    if (quantityInCart >= product.stock) {
        showToast("Você já adicionou todas as unidades disponíveis.");
        return;
    }

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
    showToast("Produto adicionado ao carrinho!");
}

function increaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(item => item.id === productId);

    if (!cartItem || !product) {
        return;
    }

    if (cartItem.quantity >= product.stock) {
        showToast("Não há mais unidades disponíveis.");
        return;
    }

    cartItem.quantity++;

    saveCart();
    updateCartCount();
    renderCart();
}

function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);

    if (!cartItem) {
        return;
    }

    if (cartItem.quantity > 1) {
        cartItem.quantity--;
    } else {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    cartCount.textContent = totalItems;
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione produtos para começar sua compra.</p>

                <button class="continue-shopping" id="continueShopping">
                    Continuar comprando
                </button>
            </div>
        `;

        cartTotal.textContent = formatCurrency(0);
        checkoutButton.disabled = true;

        const continueShopping =
            document.getElementById("continueShopping");

        if (continueShopping) {
            continueShopping.addEventListener("click", closeCartDrawer);
        }

        return;
    }

    checkoutButton.disabled = false;

    cartItemsContainer.innerHTML = cart.map(cartItem => {
        const product = products.find(item => item.id === cartItem.id);

        if (!product) {
            return "";
        }

        return `
            <div class="cart-item">
                <div class="cart-item-image ${product.color}">
                    ${
                        product.image
                            ? `<img class="cart-product-photo" src="${product.image}" alt="${product.name}">`
                            : product.icon
                    }
                </div>

                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <span>${product.categoryName}</span>
                    <strong>${product.price}</strong>

                    <div class="quantity-control">
                        <button
                            type="button"
                            data-action="decrease"
                            data-product-id="${product.id}"
                        >
                            −
                        </button>

                        <span>${cartItem.quantity}</span>

                        <button
                            type="button"
                            data-action="increase"
                            data-product-id="${product.id}"
                        >
                            +
                        </button>
                    </div>
                </div>

                <button
                    class="remove-item"
                    type="button"
                    data-action="remove"
                    data-product-id="${product.id}"
                    title="Remover produto"
                >
                    ×
                </button>
            </div>
        `;
    }).join("");

    const total = cart.reduce((sum, cartItem) => {
        const product = products.find(item => item.id === cartItem.id);

        if (!product) {
            return sum;
        }

        return sum + convertPrice(product.price) * cartItem.quantity;
    }, 0);

    cartTotal.textContent = formatCurrency(total);
}

function saveCart() {
    const cartToSave = cart.map(item => ({
        id: item.id,
        quantity: item.quantity
    }));

    localStorage.setItem(
        "nexastore-cart",
        JSON.stringify(cartToSave)
    );
}

function saveStocks() {
    const stocksToSave = {};

    products.forEach(product => {
        stocksToSave[product.id] = product.stock;
    });

    localStorage.setItem(
        "nexastore-stock",
        JSON.stringify(stocksToSave)
    );
}

function convertPrice(price) {
    return Number(
        price
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    );
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function openCartDrawer() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("show");
    document.body.classList.add("cart-open");
}

function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("show");
    document.body.classList.remove("cart-open");
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function simulatePurchase() {
    if (cart.length === 0) {
        return;
    }

    const insufficientStock = cart.some(cartItem => {
        const product = products.find(item => item.id === cartItem.id);

        return !product || product.stock < cartItem.quantity;
    });

    if (insufficientStock) {
        showToast("Estoque insuficiente. Confira seu carrinho.");
        return;
    }

    const confirmed = window.confirm(
        "Confirmar compra simulada? Nenhum pagamento real será realizado."
    );

    if (!confirmed) {
        return;
    }

    cart.forEach(cartItem => {
        const product = products.find(item => item.id === cartItem.id);

        if (product) {
            product.stock -= cartItem.quantity;
        }
    });

    cart = [];

    saveStocks();
    saveCart();
    updateCartCount();
    renderCart();
    renderProducts(currentFilter);
    closeCartDrawer();

    alert(
        "Compra simulada concluída. O estoque demonstrativo foi atualizado."
    );
}

function setupCartEvents() {
    cartButton.addEventListener("click", openCartDrawer);
    closeCart.addEventListener("click", closeCartDrawer);
    cartOverlay.addEventListener("click", closeCartDrawer);

    cartItemsContainer.addEventListener("click", event => {
        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const productId = Number(button.dataset.productId);
        const action = button.dataset.action;

        if (action === "increase") {
            increaseQuantity(productId);
        }

        if (action === "decrease") {
            decreaseQuantity(productId);
        }

        if (action === "remove") {
            removeFromCart(productId);
        }
    });

    checkoutButton.addEventListener("click", simulatePurchase);
}

function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            renderProducts(button.dataset.filter);
        });
    });
}

function setupCategories() {
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;

            const filterButton = document.querySelector(
                `[data-filter="${category}"]`
            );

            if (filterButton) {
                filterButton.click();
            }

            document
                .getElementById("produtos")
                .scrollIntoView({ behavior: "smooth" });
        });
    });
}

function setupMobileMenu() {
    menuButton.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

    document.querySelectorAll(".main-nav a").forEach(link => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
        });
    });
}

function setupNewsletter() {
    const form = document.getElementById("newsletterForm");

    form.addEventListener("submit", event => {
        event.preventDefault();
        alert("Cadastro realizado com sucesso!");
        form.reset();
    });
}

renderProducts();
renderCart();
updateCartCount();

setupFilters();
setupCategories();
setupMobileMenu();
setupNewsletter();
setupCartEvents();