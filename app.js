const products = [
  {
    id: 1,
    name: "Notebook",
    price: 120,
    category: "Stationery",
    emoji: "📓",
    description: "A notebook for your daily ideas.",
  },
  {
    id: 2,
    name: "Pen Pack",
    price: 80,
    category: "Stationery",
    emoji: "🖊️",
    description: "Smooth pens for writing and notes.",
  },
  {
    id: 3,
    name: "Desk Lamp",
    price: 650,
    category: "Home",
    emoji: "💡",
    description: "A stylish lamp for your study desk.",
  },
  {
    id: 4,
    name: "Coffee Mug",
    price: 250,
    category: "Home",
    emoji: "☕",
    description: "A mug for your favourite drink.",
  },
  {
    id: 5,
    name: "Backpack",
    price: 799,
    category: "Accessories",
    emoji: "🎒",
    description: "Carry your everyday essentials.",
  },
  {
    id: 6,
    name: "Wrist Watch",
    price: 999,
    category: "Accessories",
    emoji: "⌚",
    description: "A simple watch for everyday use.",
  },
  {
    id: 7,
    name: "Water Bottle",
    price: 299,
    category: "Lifestyle",
    emoji: "🧴",
    description: "A reusable bottle for daily hydration.",
  },
  {
    id: 8,
    name: "Plant Pot",
    price: 349,
    category: "Lifestyle",
    emoji: "🪴",
    description: "Add a little green to your space.",
  },
];

const productsContainer = document.getElementById("products");
const categorySelect = document.getElementById("category");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotals = document.getElementById("cart-totals");
const cartCount = document.getElementById("cart-count");
const cartSummaryCount = document.getElementById("cart-summary-count");

const checkoutDialog = document.getElementById("checkout-dialog");
const confirmationDialog = document.getElementById("confirmation-dialog");

let cart = loadCart();

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("minimart-cart") || "{}");

    if (
      !savedCart ||
      typeof savedCart !== "object" ||
      Array.isArray(savedCart)
    ) {
      return {};
    }

    const cleanCart = {};

    Object.entries(savedCart).forEach(function ([id, quantity]) {
      const productExists = products.some(function (product) {
        return product.id === Number(id);
      });

      if (
        productExists &&
        Number.isSafeInteger(quantity) &&
        quantity > 0 &&
        quantity <= 999
      ) {
        cleanCart[id] = quantity;
      }
    });

    return cleanCart;
  } catch (error) {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem("minimart-cart", JSON.stringify(cart));
  } catch (error) {
    alert(
      "Your browser could not save the cart. Your changes may not remain after refreshing.",
    );
  }

  renderCart();
}

function formatMoney(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

function renderProducts() {
  productsContainer.replaceChildren();

  const selectedCategory = categorySelect.value;

  const filteredProducts = products.filter(function (product) {
    return selectedCategory === "All" || product.category === selectedCategory;
  });

  filteredProducts.forEach(function (product) {
    const card = document.createElement("article");
    card.className = "product-card";

    const art = document.createElement("div");
    art.className = "product-art";
    art.textContent = product.emoji;
    art.setAttribute("aria-hidden", "true");

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const name = document.createElement("h3");
    name.textContent = product.name;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatMoney(product.price);

    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.textContent = "Add +";
    addButton.type = "button";
    addButton.dataset.id = product.id;
    addButton.setAttribute("aria-label", "Add " + product.name + " to cart");

    bottom.append(price, addButton);
    info.append(category, name, description, bottom);
    card.append(art, info);

    productsContainer.appendChild(card);
  });
}

function addToCart(id) {
  const product = products.find(function (item) {
    return item.id === Number(id);
  });

  if (!product) return;

  if ((cart[id] || 0) >= 999) {
    alert("You have reached the maximum quantity for this item.");
    return;
  }

  cart[id] = (cart[id] || 0) + 1;
  saveCart();
}

function changeQuantity(id, delta) {
  if (!cart[id]) return;

  const nextQuantity = cart[id] + delta;

  if (nextQuantity <= 0) {
    delete cart[id];
  } else if (nextQuantity <= 999) {
    cart[id] = nextQuantity;
  }

  saveCart();
}

function removeItem(id) {
  delete cart[id];
  saveCart();
}

function calculateTotals() {
  const subtotal = Object.entries(cart).reduce(function (sum, entry) {
    const id = Number(entry[0]);
    const quantity = entry[1];

    const product = products.find(function (item) {
      return item.id === id;
    });

    return product ? sum + product.price * quantity : sum;
  }, 0);

  const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;

  return {
    subtotal: subtotal,
    delivery: delivery,
    total: subtotal + delivery,
  };
}

function renderCart() {
  cartItemsContainer.replaceChildren();

  const entries = Object.entries(cart).filter(function ([id, quantity]) {
    return (
      quantity > 0 &&
      products.some(function (product) {
        return product.id === Number(id);
      })
    );
  });

  const totalItems = entries.reduce(function (sum, entry) {
    return sum + entry[1];
  }, 0);

  cartCount.textContent = totalItems;
  cartSummaryCount.textContent =
    totalItems + (totalItems === 1 ? " item" : " items");

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-cart";

    const icon = document.createElement("span");
    icon.textContent = "🛒";

    const message = document.createElement("p");
    message.textContent = "Your cart is empty. Add something you like!";

    empty.append(icon, message);
    cartItemsContainer.appendChild(empty);
    cartTotals.hidden = true;
    return;
  }

  entries.forEach(function ([id, quantity]) {
    const product = products.find(function (item) {
      return item.id === Number(id);
    });

    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-row";

    const productInfo = document.createElement("div");
    productInfo.className = "cart-product";

    const emoji = document.createElement("span");
    emoji.className = "cart-emoji";
    emoji.textContent = product.emoji;
    emoji.setAttribute("aria-hidden", "true");

    const details = document.createElement("div");

    const name = document.createElement("h3");
    name.textContent = product.name;

    const unitPrice = document.createElement("p");
    unitPrice.textContent = formatMoney(product.price) + " each";

    details.append(name, unitPrice);
    productInfo.append(emoji, details);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.dataset.action = "decrease";
    minus.dataset.id = id;
    minus.setAttribute("aria-label", "Decrease " + product.name + " quantity");

    const quantityText = document.createElement("span");
    quantityText.className = "quantity";
    quantityText.textContent = quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.dataset.action = "increase";
    plus.dataset.id = id;
    plus.setAttribute("aria-label", "Increase " + product.name + " quantity");

    controls.append(minus, quantityText, plus);

    const lineTotal = document.createElement("div");
    lineTotal.className = "line-total";
    lineTotal.textContent = formatMoney(product.price * quantity);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Remove";
    remove.dataset.action = "remove";
    remove.dataset.id = id;
    remove.setAttribute("aria-label", "Remove " + product.name);

    lineTotal.appendChild(remove);
    row.append(productInfo, controls, lineTotal);
    cartItemsContainer.appendChild(row);
  });

  const totals = calculateTotals();

  document.getElementById("subtotal").textContent = formatMoney(
    totals.subtotal,
  );

  document.getElementById("delivery").textContent =
    totals.delivery === 0 && totals.subtotal > 0
      ? "FREE"
      : formatMoney(totals.delivery);

  document.getElementById("total").textContent = formatMoney(totals.total);

  cartTotals.hidden = false;
}

productsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-id]");

  if (!button) return;

  addToCart(button.dataset.id);
});

cartItemsContainer.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "increase") {
    changeQuantity(id, 1);
  } else if (action === "decrease") {
    changeQuantity(id, -1);
  } else if (action === "remove") {
    removeItem(id);
  }
});

categorySelect.addEventListener("change", renderProducts);

function showCheckout() {
  if (Object.keys(cart).length === 0) return;

  const summary = document.getElementById("order-summary");
  summary.replaceChildren();

  Object.entries(cart).forEach(function ([id, quantity]) {
    const product = products.find(function (item) {
      return item.id === Number(id);
    });

    if (!product) return;

    const line = document.createElement("div");
    line.className = "order-line";

    const description = document.createElement("span");
    description.textContent = product.name + " × " + quantity;

    const price = document.createElement("strong");
    price.textContent = formatMoney(product.price * quantity);

    line.append(description, price);
    summary.appendChild(line);
  });

  const totals = calculateTotals();
  document.getElementById("order-total").textContent = formatMoney(
    totals.total,
  );

  checkoutDialog.showModal();
}

document
  .getElementById("checkout-button")
  .addEventListener("click", showCheckout);

document.getElementById("close-dialog").addEventListener("click", function () {
  checkoutDialog.close();
});

document.getElementById("place-order").addEventListener("click", function () {
  checkoutDialog.close();
  cart = {};
  saveCart();
  confirmationDialog.showModal();
});

document.getElementById("finish-order").addEventListener("click", function () {
  confirmationDialog.close();
});

renderProducts();
renderCart();
