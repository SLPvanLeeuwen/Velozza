import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    orderBy,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAj7nzvflTuXerUQ9LzOnn7TRojw4ZHlkc",
    authDomain: "velozza-events.firebaseapp.com",
    projectId: "velozza-events",
    storageBucket: "velozza-events.firebasestorage.app",
    messagingSenderId: "125892769650",
    appId: "1:125892769650:web:81deb40d2b0a7e7bb58feb",
    measurementId: "G-HS8GCH4040",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const merchGrid = document.getElementById('merchGrid');

    if (!merchGrid) return;

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    onSnapshot(q, (snap) => {
        merchGrid.innerHTML = '';

        if (snap.empty) {
            merchGrid.innerHTML = '<div class="text-zinc-500">No merchandise currently available. Check back soon!</div>';
            return;
        }

        snap.forEach(docSnap => {
            const p = docSnap.data();
            const productId = docSnap.id;
            const isOutOfStock = p.stock <= 0;

            merchGrid.innerHTML += `
                <div class="merch-card bg-zinc-900 border border-white/5 rounded-lg overflow-hidden flex flex-col transition hover:border-red-500/60 shadow-xl">
                    <img src="${p.image || 'materiaal/placeholder.webp'}" class="w-full aspect-square object-cover">    
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-white">${p.name}</h3>
                        <p class="text-sm text-gray-400 mt-2 flex-grow">${p.description || ''}</p>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-xl font-semibold text-red-500">€${p.price}</span>
                            <span class="text-xs uppercase font-bold ${isOutOfStock ? 'text-zinc-500' : 'text-green-500'}">
                                ${isOutOfStock ? 'Sold Out' : 'In Stock'}
                            </span>
                        </div>
                        <a href="${p.stripeId}" 
                        ${isOutOfStock ? 'disabled style="pointer-events: none;"' : ''}
                        class="w-full mt-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition flex items-center justify-center text-center ${isOutOfStock ? 'bg-zinc-800 text-zinc-600' : ''}">
                        ${isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                        </a>
                    </div>
                </div>
            `;
        });
    });
});