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
const eventsColl = collection(db, "events");

function parseDateLocal(dstr) {
    const [y, m, day] = dstr.split("-").map(Number);
    return new Date(y, m - 1, day, 0, 0, 0, 0);
}

function formatDate(dstr) {
    const d = parseDateLocal(dstr);
    return d.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function renderEventsInto(upcoming, past) {
    const upEl = document.getElementById("upcomingList");
    const pastEl = document.getElementById("pastList");
    upEl.innerHTML = "";
    pastEl.innerHTML = "";

    const createEventCard = (ev) => {
        const randomBgIndex = Math.floor(Math.random() * 16) + 1;

        const bgUrl = `materiaal/event-achtergronden/${randomBgIndex}.webp`;

        const card = document.createElement("div");

        card.className = "p-3 border rounded border-white/5 relative overflow-hidden min-h-[120px]";

        card.innerHTML = `
            <div 
            class="absolute inset-0 bg-cover bg-center" 
            style="background-image: url('${bgUrl}');"
            ></div>
            
            <div class="absolute inset-0 bg-black/70 z-[5]"></div>
            
            <div class="relative z-10">
            <div class="text-sm text-gray-400">${formatDate(ev.date)}</div>
            <div class="font-semibold text-white">${ev.name}</div>
            <div class="small text-gray-300">
                ${[ev.location, ev.city, ev.country, ev.time]
                .filter((v) => v && v.trim())
                .join(" — ")
            }
            </div>
            ${ev.link
                ? `<div><a href="${ev.link}" target="_blank" class="text-blue-400 underline hover:text-red-500 transition-colors duration-300">Event Link</a></div>`
                : ""
            }
            </div>
        `;
        return card;
    };

    if (upcoming.length === 0)
        upEl.innerHTML =
            '<div class="text-gray-500">No upcoming shows.</div>';
    upcoming.forEach((ev) => {
        upEl.appendChild(createEventCard(ev));
    });

    if (past.length === 0)
        pastEl.innerHTML = '<div class="text-gray-500">No past shows.</div>';
    past.forEach((ev) => {
        pastEl.appendChild(createEventCard(ev));
    });
}

document.addEventListener('DOMContentLoaded', () => {

    // --- Show Toggle Logic ---
    document.getElementById("upcomingBtn").addEventListener("click", () => {
        document.getElementById("upcomingList").classList.remove("hidden");
        document.getElementById("pastList").classList.add("hidden");
        document
            .getElementById("upcomingBtn")
            .classList.add("bg-[var(--accent)]");
        document
            .getElementById("upcomingBtn")
            .classList.remove("bg-[var(--muted)]");
        document
            .getElementById("pastBtn")
            .classList.remove("bg-[var(--accent)]");
        document
            .getElementById("pastBtn")
            .classList.add("bg-[var(--muted)]");
    });

    document.getElementById("pastBtn").addEventListener("click", () => {
        document.getElementById("pastList").classList.remove("hidden");
        document.getElementById("upcomingList").classList.add("hidden");
        document
            .getElementById("pastBtn")
            .classList.add("bg-[var(--accent)]");
        document
            .getElementById("pastBtn")
            .classList.remove("bg-[var(--muted)]");
        document
            .getElementById("upcomingBtn")
            .classList.remove("bg-[var(--accent)]");
        document
            .getElementById("upcomingBtn")
            .classList.add("bg-[var(--muted)]");
    });

    // --- Learn more button in about section ---
    const btn = document.getElementById('toggle-btn');
    const content = document.getElementById('extra-content');

    if (btn && content) {
        btn.addEventListener('click', () => {
            content.classList.toggle('hidden');

            if (content.classList.contains('hidden')) {
                btn.innerHTML = 'Learn more... ▼';
            } else {
                btn.innerHTML = 'Show less ▲';
            }
        });
    }

    // --- Firestore Data Fetching ---
    const q = query(eventsColl, orderBy("date", "asc"));
    onSnapshot(
        q,
        (snap) => {
            const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = docs.filter((e) => parseDateLocal(e.date) >= today);
            const past = docs
                .filter((e) => parseDateLocal(e.date) < today)
                .reverse();
            renderEventsInto(upcoming, past);
        },
        (err) => {
            console.error("Firestore snapshot error", err);
            document.getElementById("upcomingList").innerHTML =
                '<div class="text-red-400">Could not load shows.</div>';
        }
    );

    // Initial click to show upcoming shows (must be after all show elements exist)
    document.getElementById("upcomingBtn").click();

    // --- Scroll & Header Logic ---
    const header = document.getElementById("mainHeader");
    const backToTopBtn = document.getElementById("backToTopBtn");

    const scrollThreshold = 200;
    const backgroundThreshold = 100;
    const buttonThreshold = 400;

    let lastScrollY = window.scrollY;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > scrollThreshold) {
            if (currentScrollY > lastScrollY) {
                header.classList.add("header-hidden");
            } else if (currentScrollY < lastScrollY) {
                header.classList.remove("header-hidden");
            }
        }

        if (currentScrollY <= scrollThreshold) {
            header.classList.remove("header-hidden");
        }

        if (currentScrollY > backgroundThreshold) {
            header.classList.add("bg-black/80", "shadow-lg");
        } else {
            header.classList.remove("bg-black/80", "shadow-lg");
        }

        if (currentScrollY > buttonThreshold) {
            backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            backToTopBtn.classList.add('opacity-100');
        } else {
            backToTopBtn.classList.remove('opacity-100');
            backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // --- YouTube Embed Logic ---
    const ytThumbs = document.getElementById("yt-thumbs");
    const ytEmbed = document.getElementById("yt-embed");

    if (ytThumbs && ytEmbed) {
        ytThumbs.addEventListener("click", (event) => {
            const button = event.target.closest("button");
            if (button && button.dataset.video) {
                const videoId = button.dataset.video;
                ytEmbed.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
        });
    }

    // --- Bookings Modal Logic ---
    const bookingButtons = document.querySelectorAll(".open-bookings-btn");
    const closeBtn = document.getElementById("closeBookingsModal");
    const modal = document.getElementById("bookingsModal");

    if (bookingButtons && closeBtn && modal) {
        bookingButtons.forEach(button => {
            button.addEventListener("click", () => {
                modal.classList.remove("hidden");
                document.body.style.overflow = 'hidden';
                console.log("Open bookings modal button pressed");
            });
        });

        closeBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
            document.body.style.overflow = '';
        });

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.classList.add("hidden");
                document.body.style.overflow = '';
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !modal.classList.contains("hidden")) {
                modal.classList.add("hidden");
                document.body.style.overflow = '';
            }
        });
    }

}); // End of DOMContentLoaded listener