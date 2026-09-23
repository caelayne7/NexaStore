const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");

let cartItems = 0;

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

                    <span class="product-symbol">${product.icon}</span>
                </div>

                <div class="product-info">
                    <span class="product-category">${product.categoryName}</span>

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
            cartItems++;
            cartCount.textContent = cartItems;

            showToast();
        });
    });
}

function showToast() {
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-button");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const selectedFilter = button.dataset.filter;

            renderProducts(selectedFilter);
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

        const email = form.querySelector("input").value;

        if (email) {
            alert("Cadastro realizado com sucesso!");
            form.reset();
        }
    });
}

renderProducts();
setupFilters();
setupCategories();
setupMobileMenu();
setupNewsletter();