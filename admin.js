const SUPABASE_URL = "YOUR_SUPABASE_URL";

const SUPABASE_ANON_KEY =
  "YOUR_SUPABASE_ANON_KEY";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ===============================
// ELEMENTS
// ===============================

const loginScreen =
  document.getElementById("loginScreen");

const dashboard =
  document.getElementById("dashboard");

const loginForm =
  document.getElementById("loginForm");

const logoutButton =
  document.getElementById("logoutButton");


// ===============================
// CHECK LOGIN
// ===============================

async function checkUser() {

  const {
    data: { session }
  } = await supabaseClient
    .auth
    .getSession();


  if (session) {

    showDashboard();

  } else {

    showLogin();

  }

}


// ===============================
// LOGIN
// ===============================

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const email =
      document.getElementById("loginEmail").value;

    const password =
      document.getElementById("loginPassword").value;


    const message =
      document.getElementById("loginMessage");


    message.textContent =
      "Logging in...";


    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });


    if (error) {

      message.textContent =
        "Invalid email or password.";

      console.error(error);

      return;
    }


    message.textContent = "";

    showDashboard();

  }
);


// ===============================
// LOGOUT
// ===============================

logoutButton.addEventListener(
  "click",
  async function() {

    await supabaseClient.auth.signOut();

    showLogin();

  }
);


// ===============================
// SHOW LOGIN
// ===============================

function showLogin() {

  loginScreen.classList.remove("hidden");

  dashboard.classList.add("hidden");

}


// ===============================
// SHOW DASHBOARD
// ===============================

function showDashboard() {

  loginScreen.classList.add("hidden");

  dashboard.classList.remove("hidden");

  loadAdminData();

}


// ===============================
// ADD MEDICINE
// ===============================

const medicineForm =
  document.getElementById("medicineForm");


medicineForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const message =
      document.getElementById("medicineMessage");


    message.textContent =
      "Uploading medicine...";


    const file =
      document.getElementById("medicineImage").files[0];


    if (!file) {

      message.textContent =
        "Please select an image.";

      return;

    }


    const name =
      document.getElementById("medicineName").value;

    const category =
      document.getElementById("medicineCategory").value;

    const price =
      Number(
        document.getElementById("medicinePrice").value
      );

    const stock =
      Number(
        document.getElementById("medicineStock").value
      );

    const description =
      document.getElementById("medicineDescription").value;


    // Create unique file name

    const fileName =
      `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;


    // Upload image

    const {
      error: uploadError
    } = await supabaseClient
      .storage
      .from("medicine-images")
      .upload(
        fileName,
        file
      );


    if (uploadError) {

      console.error(uploadError);

      message.textContent =
        "Image upload failed.";

      return;

    }


    // Get public image URL

    const {
      data: imageData
    } =
      supabaseClient
        .storage
        .from("medicine-images")
        .getPublicUrl(fileName);


    const imageUrl =
      imageData.publicUrl;


    // Save medicine information

    const {
      error: databaseError
    } =
      await supabaseClient
        .from("medicines")
        .insert([{

          name,

          category,

          price,

          stock,

          description,

          image_url: imageUrl

        }]);


    if (databaseError) {

      console.error(databaseError);

      message.textContent =
        "Could not save medicine.";

      return;

    }


    message.textContent =
      "✓ Medicine added successfully!";


    medicineForm.reset();

    document.getElementById(
      "imagePreview"
    ).innerHTML = "";


    loadAdminData();

  }
);


// ===============================
// IMAGE PREVIEW
// ===============================

document
  .getElementById("medicineImage")
  .addEventListener(
    "change",
    function(event) {

      const file =
        event.target.files[0];

      if (!file) return;


      const url =
        URL.createObjectURL(file);


      document.getElementById(
        "imagePreview"
      ).innerHTML = `
        <img src="${url}" alt="Preview">
      `;

    }
  );


// ===============================
// LOAD ADMIN DATA
// ===============================

async function loadAdminData() {

  await loadAdminMedicines();

  await loadAppointments();

}


// ===============================
// MEDICINE LIST
// ===============================

async function loadAdminMedicines() {

  const container =
    document.getElementById(
      "adminMedicineList"
    );


  const { data, error } =
    await supabaseClient
      .from("medicines")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );


  if (error) {

    container.textContent =
      "Unable to load medicines.";

    return;

  }


  document.getElementById(
    "medicineCount"
  ).textContent =
    data.length;


  document.getElementById(
    "productCount"
  ).textContent =
    data.length;


  if (!data.length) {

    container.textContent =
      "No medicines added yet.";

    return;

  }


  container.innerHTML =
    data.map(medicine => `

      <div class="admin-medicine">

        <div class="admin-medicine-info">

          <img
            src="${medicine.image_url || "https://placehold.co/100x100"}"
            alt="${medicine.name}"
          >

          <div>

            <strong>
              ${medicine.name}
            </strong>

            <small>
              ${medicine.category}
              · ₹${medicine.price}
              · Stock: ${medicine.stock}
            </small>

          </div>

        </div>


        <button
          class="delete-btn"
          onclick="deleteMedicine('${medicine.id}')"
        >
          Delete
        </button>

      </div>

    `).join("");

}


// ===============================
// DELETE MEDICINE
// ===============================

async function deleteMedicine(id) {

  const confirmed =
    confirm(
      "Delete this medicine?"
    );


  if (!confirmed) return;


  const { error } =
    await supabaseClient
      .from("medicines")
      .delete()
      .eq("id", id);


  if (error) {

    alert(
      "Could not delete medicine."
    );

    return;

  }


  loadAdminData();

}


// ===============================
// APPOINTMENTS
// ===============================

async function loadAppointments() {

  const container =
    document.getElementById(
      "appointmentList"
    );


  const { data, error } =
    await supabaseClient
      .from("appointments")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );


  if (error) {

    container.textContent =
      "Unable to load appointments.";

    return;

  }


  document.getElementById(
    "appointmentCount"
  ).textContent =
    data.length;


  if (!data.length) {

    container.textContent =
      "No appointments yet.";

    return;

  }


  container.innerHTML =
    data.map(appointment => `

      <div class="appointment-row">

        <strong>
          ${appointment.patient_name}
        </strong>

        <span>
          📞 ${appointment.phone}
        </span>

        <span>
          👨‍⚕️ ${appointment.doctor}
        </span>

        <span>
          📅 ${appointment.appointment_date}
          · ${appointment.appointment_time}
        </span>

        <span>
          ${appointment.message || ""}
        </span>

      </div>

    `).join("");

}


// ===============================
// START
// ===============================

checkUser();