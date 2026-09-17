const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// ===============================
// LOAD MEDICINES
// ===============================

async function loadMedicines() {

  const grid = document.getElementById("medicineGrid");

  grid.innerHTML = `
    <div class="loading">
      Loading medicines...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("medicines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {

    console.error(error);

    grid.innerHTML = `
      <div class="loading">
        Unable to load medicines.
      </div>
    `;

    return;
  }

  displayMedicines(data);
}


// ===============================
// DISPLAY MEDICINES
// ===============================

function displayMedicines(medicines) {

  const grid = document.getElementById("medicineGrid");

  if (!medicines || medicines.length === 0) {

    grid.innerHTML = `
      <div class="loading">
        No medicines available.
      </div>
    `;

    return;
  }

  grid.innerHTML = medicines.map(medicine => `

    <article
      class="medicine-card"
      data-name="${medicine.name.toLowerCase()}"
      data-category="${medicine.category}"
    >

      <img
        class="medicine-image"
        src="${medicine.image_url || "https://placehold.co/600x400?text=Medicine"}"
        alt="${medicine.name}"
      >

      <div class="medicine-info">

        <span class="medicine-category">
          ${medicine.category || "Healthcare"}
        </span>

        <h3>
          ${medicine.name}
        </h3>

        <p class="medicine-description">
          ${medicine.description || "Quality healthcare product."}
        </p>

        <div class="medicine-bottom">

          <span class="price">
            ₹${Number(medicine.price).toFixed(2)}
          </span>

          <span class="stock">
            ${medicine.stock > 0
              ? `${medicine.stock} available`
              : "Out of stock"}
          </span>

        </div>

      </div>

    </article>

  `).join("");
}


// ===============================
// SEARCH
// ===============================

const searchInput =
  document.getElementById("medicineSearch");

const categoryFilter =
  document.getElementById("categoryFilter");


function filterMedicines() {

  const search =
    searchInput.value.toLowerCase();

  const category =
    categoryFilter.value;

  const cards =
    document.querySelectorAll(".medicine-card");

  cards.forEach(card => {

    const name =
      card.dataset.name;

    const cardCategory =
      card.dataset.category;

    const matchesSearch =
      name.includes(search);

    const matchesCategory =
      category === "all" ||
      cardCategory === category;

    card.style.display =
      matchesSearch && matchesCategory
        ? ""
        : "none";

  });
}


searchInput.addEventListener(
  "input",
  filterMedicines
);

categoryFilter.addEventListener(
  "change",
  filterMedicines
);


// ===============================
// APPOINTMENT
// ===============================

const appointmentForm =
  document.getElementById("appointmentForm");


appointmentForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const status =
      document.getElementById("appointmentStatus");

    status.textContent =
      "Booking appointment...";


    const appointment = {

      patient_name:
        document.getElementById("patientName").value,

      phone:
        document.getElementById("patientPhone").value,

      email:
        document.getElementById("patientEmail").value,

      doctor:
        document.getElementById("doctorName").value,

      appointment_date:
        document.getElementById("appointmentDate").value,

      appointment_time:
        document.getElementById("appointmentTime").value,

      message:
        document.getElementById("appointmentMessage").value

    };


    const { error } =
      await supabaseClient
        .from("appointments")
        .insert([appointment]);


    if (error) {

      console.error(error);

      status.textContent =
        "Unable to book appointment. Please try again.";

      return;
    }


    status.textContent =
      "✓ Appointment booked successfully!";

    appointmentForm.reset();

  }
);


// ===============================
// DOCTOR BOOKING
// ===============================

function bookDoctor(doctor) {

  document.getElementById("doctorName").value =
    doctor;

  document.getElementById("appointment")
    .scrollIntoView({
      behavior: "smooth"
    });
}


// ===============================
// INITIAL LOAD
// ===============================

loadMedicines();