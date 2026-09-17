let medicines = JSON.parse(
  localStorage.getItem("clinikMedicines")
) || [];

let cart = JSON.parse(
  localStorage.getItem("clinikCart")
) || [];

let currentCategory = "All";


function saveMedicines() {
  localStorage.setItem(
    "clinikMedicines",
    JSON.stringify(medicines)
  );
}


function renderMedicines(list = medicines) {

  const grid = document.getElementById("medicineGrid");
  const count = document.getElementById("medicineCount");

  count.textContent = `${list.length} products`;

  if (list.length === 0) {

    grid.innerHTML = `
      <div class="empty">
        <h3>No medicines found</h3>
        <p>Try another search or category.</p>
      </div>
    `;

    return;
  }

  grid.innerHTML = list.map(medicine => `

    <article class="medicine-card">

      <img
        class="medicine-image"
        src="${medicine.image || 'https://via.placeholder.com/500x400?text=Medicine'}"
        alt="${escapeHTML(medicine.name)}"
      >

      <div class="medicine-info">

        <div class="medicine-category">
          ${escapeHTML(medicine.category)}
        </div>

        <h3 class="medicine-name">
          ${escapeHTML(medicine.name)}
        </h3>

        <p class="medicine-description">
          ${escapeHTML(medicine.description || "Healthcare product")}
        </p>

        <div class="medicine-bottom">

          <div class="price">
            ₹${Number(medicine.price).toLocaleString("en-IN")}
          </div>

          <button
            class="add-btn"
            onclick="addToCart('${medicine.id}')"
          >
            + Add
          </button>

        </div>

        <div class="stock">
          ${medicine.stock > 0
            ? `${medicine.stock} in stock`
            : "Out of stock"}
        </div>

      </div>

    </article>

  `).join("");
}


function escapeHTML(text) {

  const div = document.createElement("div");
  div.textContent = text ?? "";

  return div.innerHTML;
}


function searchMedicines() {

  const query =
    document.getElementById("searchInput")
    .value
    .toLowerCase()
    .trim();

  let filtered = medicines.filter(medicine => {

    const searchable = `
      ${medicine.name}
      ${medicine.category}
      ${medicine.description}
    `.toLowerCase();

    return searchable.includes(query);
  });

  if (currentCategory !== "All") {

    filtered = filtered.filter(
      medicine => medicine.category === currentCategory
    );

  }

  renderMedicines(filtered);
}


function filterCategory(category) {

  currentCategory = category;

  searchMedicines();

  document
    .getElementById("medicines")
    .scrollIntoView({
      behavior: "smooth"
    });
}


function addToCart(id) {

  const medicine = medicines.find(
    item => item.id === id
  );

  if (!medicine) return;

  if (Number(medicine.stock) <= 0) {

    alert("This medicine is currently out of stock.");
    return;

  }

  const existing = cart.find(
    item => item.id === id
  );

  if (existing) {
    existing.quantity++;
  } else {

    cart.push({
      id: medicine.id,
      name: medicine.name,
      price: Number(medicine.price),
      image: medicine.image,
      quantity: 1
    });

  }

  saveCart();

  updateCart();

  openCart();
}


function removeFromCart(id) {

  cart = cart.filter(
    item => item.id !== id
  );

  saveCart();

  updateCart();
}


function saveCart() {

  localStorage.setItem(
    "clinikCart",
    JSON.stringify(cart)
  );

}


function updateCart() {

  const container =
    document.getElementById("cartItems");

  const count =
    document.getElementById("cartCount");

  const total =
    document.getElementById("cartTotal");

  const totalItems =
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  count.textContent = totalItems;

  if (cart.length === 0) {

    container.innerHTML = `
      <div class="empty">
        <h3>Your cart is empty</h3>
        <p>Add some medicines to continue.</p>
      </div>
    `;

    total.textContent = "0";

    return;
  }

  container.innerHTML = cart.map(item => `

    <div class="cart-item">

      <img
        src="${item.image || 'https://via.placeholder.com/100?text=Medicine'}"
        alt="${escapeHTML(item.name)}"
      >

      <div class="cart-item-info">

        <h4>
          ${escapeHTML(item.name)}
        </h4>

        <p>
          ₹${item.price.toLocaleString("en-IN")}
          × ${item.quantity}
        </p>

      </div>

      <button
        class="remove-item"
        onclick="removeFromCart('${item.id}')"
      >
        ✕
      </button>

    </div>

  `).join("");

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  total.textContent =
    cartTotal.toLocaleString("en-IN");
}


function openCart() {

  document
    .getElementById("cart")
    .classList.add("show");

  document
    .getElementById("cartOverlay")
    .classList.add("show");

}


function closeCart() {

  document
    .getElementById("cart")
    .classList.remove("show");

  document
    .getElementById("cartOverlay")
    .classList.remove("show");

}


function checkout() {

  if (cart.length === 0) {

    alert("Your cart is empty.");
    return;

  }

  alert(
    "Order system is ready to connect. " +
    "For now, your cart contains " +
    cart.reduce((sum, item) => sum + item.quantity, 0) +
    " item(s)."
  );

}


window.addEventListener("storage", () => {

  medicines =
    JSON.parse(
      localStorage.getItem("clinikMedicines")
    ) || [];

  renderMedicines();

});


renderMedicines();
updateCart();