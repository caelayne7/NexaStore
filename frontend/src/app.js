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

let cart = JSON.parse(localStorage.getItem("nexastore-cart")) || [];

function renderProducts(filter = "todos") {
    const filteredProducts = products.filter(product => {
        return filter === "todos" || product.category === filter;
    });

    productsGrid.innerHTML = filteredProducts.map(product => {
        return `
            <article class="product-card">
                <div class="product-image ${product.color}">
                    ${
                        product.badge
                            ? `<span class="product-badge">${product.badge}</span>`
                            : ""
                    }

                    <button class="favorite-button" title="Adicionar aos favoritos">
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

                    <button
                        class="add-cart-button"
                        data-product-id="${product.id}"
                    >
                        Adicionar ao carrinho
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
            showToast();
        });
    });
}

function addToCart(productId) {
    const selectedProduct = products.find(product => {
        return product.id === productId;
    });

    if (!selectedProduct) {
        return;
    }

    const existingProduct = cart.find(product => {
        return product.id === productId;
    });

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            ...selectedProduct,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(product => {
        return product.id !== productId;
    });

    saveCart();
    updateCartCount();
    renderCart();
}

function increaseQuantity(productId) {
    const product = cart.find(item => {
        return item.id === productId;
    });

    if (product) {
        product.quantity++;
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function decreaseQuantity(productId) {
    const product = cart.find(item => {
        return item.id === productId;
    });

    if (!product) {
        return;
    }

    if (product.quantity > 1) {
        product.quantity--;
    } else {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const totalItems = cart.reduce((total, product) => {
        return total + product.quantity;
    }, 0);

    cartCount.textContent = totalItems;
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Seu carrinho está vazio</h3>
                <p>
                    Adicione produtos para começar sua compra.
                </p>

                <button class="continue-shopping" id="continueShopping">
                    Continuar comprando
                </button>
            </div>
        `;

        cartTotal.textContent = "R$ 0,00";
        checkoutButton.disabled = true;

        const continueShopping = document.getElementById("continueShopping");

        if (continueShopping) {
            continueShopping.addEventListener("click", closeCartDrawer);
        }

        return;
    }

    cartItemsContainer.innerHTML = cart.map(product => {
        return `
            <div class="cart-item">
                <div class="cart-item-image ${product.color}">
                    ${product.icon}
                </div>

                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <span>${product.categoryName}</span>
                    <strong>${product.price}</strong>

                    <div class="quantity-control">
                        <button
                            data-action="decrease"
                            data-product-id="${product.id}"
                        >
                            −
                        </button>

                        <span>${product.quantity}</span>

                        <button
                            data-action="increase"
                            data-product-id="${product.id}"
                        >
                            +
                        </button>
                    </div>
                </div>

                <button
                    class="remove-item"
                    data-action="remove"
                    data-product-id="${product.id}"
                    title="Remover produto"
                >
                    ×
                </button>
            </div>
        `;
    }).join("");

    const total = cart.reduce((sum, product) => {
        return sum + convertPrice(product.price) * product.quantity;
    }, 0);

    cartTotal.textContent = formatCurrency(total);
    checkoutButton.disabled = false;
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

function saveCart() {
    localStorage.setItem("nexastore-cart", JSON.stringify(cart));
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

function showToast() {
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
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

    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            return;
        }

        alert(
            "Checkout preparado! Na próxima etapa vamos criar a página de pagamento."
        );
    });
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