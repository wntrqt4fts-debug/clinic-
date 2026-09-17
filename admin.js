/* =========================
   CLINIK ADMIN
========================= */


/* CHANGE THESE IF YOU WANT */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";


let medicines =
  JSON.parse(
    localStorage.getItem("clinikMedicines")
  ) || [];


let editingId = null;
let selectedImage = "";


/* =========================
   LOGIN
========================= */

const loginForm =
  document.getElementById("loginForm");


loginForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;

  const error =
    document.getElementById("loginError");


  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {

    sessionStorage.setItem(
      "clinikAdminLoggedIn",
      "true"
    );

    showDashboard();

  } else {

    error.textContent =
      "Incorrect username or password.";

  }

});


function showDashboard() {

  document
    .getElementById("loginScreen")
    .classList.add("hidden");

  document
    .getElementById("dashboard")
    .classList.remove("hidden");

  renderAdminMedicines();

  updateStats();

}


function logout() {

  sessionStorage.removeItem(
    "clinikAdminLoggedIn"
  );

  location.reload();

}


/* =========================
   IMAGE UPLOAD
========================= */

document
  .getElementById("medicineImage")
  .addEventListener("change", function(e) {

    const file = e.target.files[0];

    if (!file) return;


    if (file.size > 1500000) {

      alert(
        "Please choose an image smaller than 1.5 MB."
      );

      e.target.value = "";

      return;

    }


    const reader =
      new FileReader();


    reader.onload = function(event) {

      selectedImage =
        event.target.result;

      const preview =
        document.getElementById("imagePreview");

      preview.src = selectedImage;

      preview.style.display = "block";

      document
        .getElementById("uploadText")
        .style.display = "none";

    };


    reader.readAsDataURL(file);

  });


/* =========================
   SAVE MEDICINES
========================= */

function saveMedicines() {

  localStorage.setItem(
    "clinikMedicines",
    JSON.stringify(medicines)
  );

}


/* =========================
   ADD / EDIT
========================= */

document
  .getElementById("medicineForm")
  .addEventListener("submit", function(e) {

    e.preventDefault();


    const name =
      document
        .getElementById("medicineName")
        .value
        .trim();


    const category =
      document
        .getElementById("medicineCategory")
        .value;


    const price =
      Number(
        document
          .getElementById("medicinePrice")
          .value
      );


    const stock =
      Number(
        document
          .getElementById("medicineStock")
          .value
      );


    const description =
      document
        .getElementById("medicineDescription")
        .value
        .trim();


    if (!name || price < 0 || stock < 0) {

      alert("Please enter valid product details.");

      return;

    }


    /* EDIT */

    if (editingId) {

      const medicine =
        medicines.find(
          item => item.id === editingId
        );


      if (!medicine) return;


      medicine.name = name;
      medicine.category = category;
      medicine.price = price;
      medicine.stock = stock;
      medicine.description = description;


      if (selectedImage) {
        medicine.image = selectedImage;
      }


      alert("Medicine updated.");

    }


    /* NEW */

    else {

      const medicine = {

        id:
          Date.now().toString(),

        name: name,

        category: category,

        price: price,

        stock: stock,

        description: description,

        image:
          selectedImage ||
          "https://via.placeholder.com/500x400?text=Medicine"

      };


      medicines.unshift(medicine);

      alert("Medicine added.");

    }


    saveMedicines();

    resetForm();

    renderAdminMedicines();

    updateStats();

  });


/* =========================
   RENDER ADMIN PRODUCTS
========================= */

function renderAdminMedicines() {

  const container =
    document.getElementById(
      "adminMedicineList"
    );


  const search =
    (
      document
        .getElementById("adminSearch")
        ?.value || ""
    )
      .toLowerCase()
      .trim();


  const filtered =
    medicines.filter(item => {

      return `
        ${item.name}
        ${item.category}
        ${item.description}
      `
        .toLowerCase()
        .includes(search);

    });


  if (filtered.length === 0) {

    container.innerHTML = `
      <div class="empty-admin">
        No medicines found.
      </div>
    `;

    return;

  }


  container.innerHTML =
    filtered.map(item => `

      <div class="admin-product">

        <img
          src="${item.image}"
          alt="${escapeHTML(item.name)}"
        >

        <div class="product-details">

          <h3>
            ${escapeHTML(item.name)}
          </h3>

          <p>
            ${escapeHTML(item.category)}
            · Stock: ${item.stock}
          </p>

        </div>

        <div>

          <div class="product-price">
            ₹${Number(item.price).toLocaleString("en-IN")}
          </div>

          <div class="product-actions">

            <button
              onclick="editMedicine('${item.id}')"
            >
              Edit
            </button>

            <button
              class="delete"
              onclick="deleteMedicine('${item.id}')"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    `).join("");

}


/* =========================
   EDIT
========================= */

function editMedicine(id) {

  const medicine =
    medicines.find(
      item => item.id === id
    );

  if (!medicine) return;


  editingId = id;

  selectedImage = medicine.image;


  document.getElementById("medicineName").value =
    medicine.name;

  document.getElementById("medicineCategory").value =
    medicine.category;

  document.getElementById("medicinePrice").value =
    medicine.price;

  document.getElementById("medicineStock").value =
    medicine.stock;

  document.getElementById("medicineDescription").value =
    medicine.description || "";


  const preview =
    document.getElementById("imagePreview");

  preview.src = medicine.image;

  preview.style.display = "block";


  document
    .getElementById("uploadText")
    .style.display = "none";


  document
    .getElementById("formTitle")
    .textContent = "Edit Medicine";


  document
    .getElementById("saveButtonText")
    .textContent = "Save Changes";


  document
    .getElementById("cancelEdit")
    .classList.remove("hidden");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================
   DELETE
========================= */

function deleteMedicine(id) {

  const medicine =
    medicines.find(
      item => item.id === id
    );


  if (!medicine) return;


  const confirmed =
    confirm(
      `Delete "${medicine.name}"?`
    );


  if (!confirmed) return;


  medicines =
    medicines.filter(
      item => item.id !== id
    );


  saveMedicines();

  renderAdminMedicines();

  updateStats();

}


/* =========================
   RESET
========================= */

function resetForm() {

  editingId = null;

  selectedImage = "";


  document
    .getElementById("medicineForm")
    .reset();


  document
    .getElementById("imagePreview")
    .style.display = "none";


  document
    .getElementById("imagePreview")
    .src = "";


  document
    .getElementById("uploadText")
    .style.display = "block";


  document
    .getElementById("formTitle")
    .textContent = "Add Medicine";


  document
    .getElementById("saveButtonText")
    .textContent = "+ Add Medicine";


  document
    .getElementById("cancelEdit")
    .classList.add("hidden");

}


function cancelEdit() {

  resetForm();

}


/* =========================
   STATS
========================= */

function updateStats() {

  document
    .getElementById("totalMedicines")
    .textContent = medicines.length;


  const categories =
    new Set(
      medicines.map(
        item => item.category
      )
    );


  document
    .getElementById("totalCategories")
    .textContent =
      categories.size;


  const stock =
    medicines.reduce(
      (total, item) =>
        total + Number(item.stock || 0),
      0
    );


  document
    .getElementById("totalStock")
    .textContent = stock;

}


/* =========================
   SECURITY DISPLAY HELPER
========================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;

}


/* =========================
   START
========================= */

if (
  sessionStorage.getItem(
    "clinikAdminLoggedIn"
  ) === "true"
) {

  showDashboard();

}