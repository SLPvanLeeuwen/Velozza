import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAj7nzvflTuXerUQ9LzOnn7TRojw4ZHlkc",
    authDomain: "velozza-events.firebaseapp.com",
    projectId: "velozza-events",
    storageBucket: "velozza-events.firebasestorage.app",
    messagingSenderId: "125892769650",
    appId: "1:125892769650:web:81deb40d2b0a7e7bb58feb",
    measurementId: "G-HS8GCH4040"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Element refs
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const authStatus = document.getElementById('authStatus');
const logoutBtn = document.getElementById('logoutBtn');

const mailInput = document.getElementById('mailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const eyeOffIcon = document.getElementById('eyeOffIcon');

const prodName = document.getElementById('prodName');
const prodDesc = document.getElementById('prodDesc');
const prodPrice = document.getElementById('prodPrice');
const prodStock = document.getElementById('prodStock');
const prodImage = document.getElementById('prodImage');
const prodStripeId = document.getElementById('prodStripeId');
const saveProduct = document.getElementById('saveProduct');
const prodMsg = document.getElementById('prodMsg');
const productList = document.getElementById('productList');

const eventDate = document.getElementById('eventDate');
const eventName = document.getElementById('eventName');
const eventLocation = document.getElementById('eventLocation');
const eventCity = document.getElementById('eventCity');
const eventCountry = document.getElementById('eventCountry');
const eventTime = document.getElementById('eventTime');
const eventLink = document.getElementById('eventLink');
const eventPosterInput = document.getElementById('eventPoster');
const saveEvent = document.getElementById('saveEvent');
const saveMsg = document.getElementById('saveMsg');

const eventList = document.getElementById('eventList');

const editModal = document.getElementById('editModal');
const editCard = document.getElementById('editCard');
const editDate = document.getElementById('editDate');
const editName = document.getElementById('editName');
const editLocation = document.getElementById('editLocation');
const editCity = document.getElementById('editCity');
const editCountry = document.getElementById('editCountry');
const editTime = document.getElementById('editTime');
const editLink = document.getElementById('editLink');
const editPosterInput = document.getElementById('editPoster');
const cancelEdit = document.getElementById('cancelEdit');
const saveEdit = document.getElementById('saveEdit');
const deleteEdit = document.getElementById('deleteEdit');

let currentEditPoster = '';
let currentEditId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        setupProductList();
        setupRealtimeList();
    } else {
        loginForm.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        eventList.innerHTML = '';
    }
});

togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    //toggle
    eyeIcon.classList.toggle('hidden', isPassword);
    eyeOffIcon.classList.toggle('hidden', !isPassword);
});

//Authenticate
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = mailInput.value.trim();
    const pwd = passwordInput.value.trim();

    if (!email || !pwd) {
        authStatus.textContent = "⚠️ Enter email and password.";
        return;
    }

    authStatus.textContent = "⏳ Logging in...";
    try {
        await signInWithEmailAndPassword(auth, email, pwd);
    } catch (error) {
        authStatus.textContent = `❌ ${error.message}`;
    }
});

// The Logout Action
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        authStatus.textContent = "Logged out successfully.";
    }).catch((error) => {
        console.error("Sign out error", error);
    });
});

saveProduct.addEventListener('click', async () => {
    const name = prodName.value.trim();
    const desc = prodDesc.value.trim();
    const price = parseFloat(prodPrice.value);
    const stock = parseInt(prodStock.value);
    const stripeId = prodStripeId.value.trim();
    const imageFile = prodImage.files[0];

    if (!name || !price || !stripeId) {
        prodMsg.textContent = 'Name, Price, and Stripe ID are required.';
        return;
    }

    if (!auth.currentUser) {
        prodMsg.textContent = 'Error: You must be logged in to upload images.';
        return;
    }

    saveProduct.disabled = true;
    prodMsg.textContent = imageFile ? 'Uploading product image...' : 'Saving product...';

    try {
        // Correctly await the upload function
        const image = imageFile ? await uploadPoster(imageFile) : '';

        await addDoc(collection(db, 'products'), {
            name, desc, price, stock, image, stripeId,
            createdAt: Date.now()
        });

        prodMsg.textContent = 'Product added to store!';
        setTimeout(() => prodMsg.textContent = '', 2500);

        prodName.value = prodDesc.value = prodPrice.value = prodStock.value = prodStripeId.value = '';
        prodImage.value = '';
    } catch (err) {
        console.error('Add product error', err);
        prodMsg.textContent = 'Error saving product. Check console.';
    } finally {
        saveProduct.disabled = false;
    }
}); P

saveEvent.addEventListener('click', async () => {
    const date = eventDate.value;
    const name = eventName.value.trim();
    const location = eventLocation.value.trim();
    const city = eventCity.value.trim();
    const country = eventCountry.value.trim();
    const time = eventTime.value.trim();
    const link = eventLink.value.trim();
    const posterFile = eventPosterInput.files[0];

    if (!date || !name || !location) {
        saveMsg.textContent = 'Missing required fields.';
        return;
    }

    saveEvent.disabled = true;
    saveMsg.textContent = posterFile ? 'Uploading poster...' : 'Saving...';

    try {
        const poster = posterFile ? await uploadPoster(posterFile) : '';

        await addDoc(collection(db, 'events'), {
            date, name, location, city, country, time, link, poster,
            createdAt: Date.now()
        });
        saveMsg.textContent = 'Event saved!';
        setTimeout(() => saveMsg.textContent = '', 2500);
        eventDate.value = eventName.value = eventLocation.value = eventCity.value = eventCountry.value = eventTime.value = eventLink.value = '';
        eventPosterInput.value = '';
    } catch (err) {
        console.error('Add doc error', err);
        saveMsg.textContent = 'Could not save event.';
    } finally {
        saveEvent.disabled = false;
    }
});

async function uploadPoster(file) {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch('https://velozza-poster-upload.stijntjevanleeuwen.workers.dev', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': file.type },
        body: file,
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.url;
}

function setupProductList() {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(q, snap => {
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

        snap.forEach(docSnap => {
            const p = { id: docSnap.id, ...docSnap.data() };
            const row = document.createElement('div');
            row.className = 'p-4 border border-zinc-700 rounded bg-zinc-900 flex justify-between items-center';

            row.innerHTML = `
        <div>
          <div class="font-semibold text-white">${p.name}</div>
          <div class="text-zinc-400 text-sm">€${p.price} — Stock: ${p.stock}</div>
        </div>
        <div class="flex gap-2">
          <button onclick="deleteProduct('${p.id}')" class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-xs text-white">Delete</button>
        </div>
      `;
            productList.appendChild(row);
        });
    });
}

async function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        await deleteDoc(doc(db, 'products', id));
    }
}
// Make functions global so 'onclick' works
window.deleteProduct = deleteProduct;

function setupRealtimeList() {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    onSnapshot(q, snap => {
        eventList.innerHTML = '';
        if (snap.empty) {
            eventList.innerHTML = '<div class="text-zinc-500">No events yet.</div>';
            return;
        }

        snap.forEach(docSnap => {
            const e = { id: docSnap.id, ...docSnap.data() };
            const row = document.createElement('div');
            row.className = 'p-4 border border-zinc-700 rounded bg-zinc-900 flex justify-between items-center';

            const left = document.createElement('div');
            left.innerHTML = `<div class="font-semibold">${escapeHtml(e.name)}</div><div class="text-zinc-400 text-sm">${escapeHtml(e.date)} — ${escapeHtml(e.city || '')}${e.city && e.country ? ', ' : ''}${escapeHtml(e.country || '')}</div>`;

            const right = document.createElement('div');
            right.className = 'flex items-center gap-2';
            const editBtn = document.createElement('button');
            editBtn.className = 'px-3 py-1 bg-zinc-700 rounded hover:bg-zinc-600';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => openEditModal(e.id));

            const delBtn = document.createElement('button');
            delBtn.className = 'px-3 py-1 bg-red-600 rounded hover:bg-red-700';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => deleteEvent(e.id));

            right.appendChild(editBtn);
            right.appendChild(delBtn);

            row.appendChild(left);
            row.appendChild(right);

            eventList.appendChild(row);
        });
    }, err => {
        console.error('Snapshot error', err);
        eventList.innerHTML = '<div class="text-red-400">Could not load events.</div>';
    });
}

async function openEditModal(id) {
    currentEditId = id;
    try {
        const ref = doc(db, 'events', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            alert('Event not found.');
            return;
        }
        const e = snap.data();

        editDate.value = e.date || '';
        editName.value = e.name || '';
        editLocation.value = e.location || '';
        editCity.value = e.city || '';
        editCountry.value = e.country || '';
        editTime.value = e.time || '';
        editLink.value = e.link || '';
        currentEditPoster = e.poster || '';
        editPosterInput.value = '';

        editModal.classList.remove('hidden');
    } catch (err) {
        console.error('Open edit error', err);
        alert('Could not open event for editing.');
    }
}

function closeEditModal() {
    currentEditId = null;
    editModal.classList.add('hidden');
}

cancelEdit.addEventListener('click', closeEditModal);

async function deleteEvent(id) {
    const ok = confirm('Are you sure you want to delete this event?');
    if (!ok) return;
    try {
        await deleteDoc(doc(db, 'events', id));

        if (currentEditId === id) closeEditModal();
    } catch (err) {
        console.error('Delete error', err);
        alert('Could not delete event.');
    }
}

deleteEdit.addEventListener('click', () => {
    if (!currentEditId) return;
    deleteEvent(currentEditId);
});

saveEdit.addEventListener('click', async () => {
    if (!currentEditId) return;

    const posterFile = editPosterInput.files[0];
    const poster = posterFile ? await uploadPoster(posterFile) : currentEditPoster;

    const payload = {
        date: editDate.value,
        name: editName.value.trim(),
        location: editLocation.value.trim(),
        city: editCity.value.trim(),
        country: editCountry.value.trim(),
        time: editTime.value.trim(),
        link: editLink.value.trim(),
        poster
    };

    if (!payload.date || !payload.name || !payload.location) {
        alert('Date, name and location are required.');
        return;
    }

    try {
        await updateDoc(doc(db, 'events', currentEditId), payload);
        closeEditModal();
    } catch (err) {
        console.error('Update error', err);
        alert('Could not save changes.');
    }
});

editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}