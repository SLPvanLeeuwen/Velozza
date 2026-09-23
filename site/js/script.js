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
        // Future-proof wallpaper support: checks ev.wallpaper or ev.poster, falls back to random generator
        const randomBgIndex = Math.floor(Math.random() * 16) + 1;
        const bgUrl = ev.wallpaper || ev.poster || `materiaal/event-achtergronden/${randomBgIndex}.webp`;

        const card = document.createElement("div");

        // Responsive classes: Compact line layout on mobile, rich card layout on desktop (PC)
        card.className = "group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl transition hover:border-red-500/60 " +
            "p-4 md:p-6 flex flex-col justify-between min-h-[90px] md:min-h-[260px]";

        card.innerHTML = `
            <div class="absolute inset-0 bg-cover bg-center opacity-40 md:opacity-50 group-hover:scale-105 transition duration-500" 
                 style="background-image: url('${bgUrl}');">
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/50 z-[5]"></div>
            
            <!-- Top Header: Date Badge -->
            <div class="relative z-10 flex justify-between items-start mb-2 md:mb-4">
                <span class="inline-block bg-red-700/20 text-red-400 border border-red-500/30 text-[11px] md:text-xs font-bold px-2.5 py-1 rounded">
                    ${formatDate(ev.date)}
                </span>
                ${ev.time ? `<span class="text-xs text-gray-400 font-medium hidden md:inline-block">${ev.time}</span>` : ''}
            </div>

            <!-- Middle Content: Event Title & Location -->
            <div class="relative z-10 space-y-1 md:space-y-2 mb-3 md:mb-4">
                <h4 class="font-bold text-white text-base md:text-xl leading-tight group-hover:text-red-400 transition-colors">
                    ${ev.name}
                </h4>
                <p class="text-xs md:text-sm text-gray-300 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0 hidden md:inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span class="truncate">${[ev.location, ev.city, ev.country].filter((v) => v && v.trim()).join(" — ")}</span>
                </p>
            </div>

            <!-- Bottom Footer: Event Link / Ticket Button -->
            <div class="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
                <span class="text-[11px] text-gray-400 md:hidden">${ev.time || ''}</span>
                ${ev.link
                ? `<a href="${ev.link}" target="_blank" class="inline-flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition shadow cursor-pointer">
                          <span>Tickets / Info</span>
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                       </a>`
                : `<span class="text-xs text-gray-500 italic">Details soon</span>`
            }
            </div>
        `;
        return card;
    };

    if (upcoming.length === 0)
        upEl.innerHTML = '<div class="text-gray-500 col-span-full py-4 text-center">No upcoming shows scheduled.</div>';
    upcoming.forEach((ev) => {
        upEl.appendChild(createEventCard(ev));
    });

    if (past.length === 0)
        pastEl.innerHTML = '<div class="text-gray-500 col-span-full py-4 text-center">No past shows recorded.</div>';
    past.forEach((ev) => {
        pastEl.appendChild(createEventCard(ev));
    });
}

document.addEventListener('DOMContentLoaded', () => {


    document.getElementById('scroll-left')?.addEventListener('click', () => {
        document.getElementById('spotify-carousel')?.scrollBy({ left: -340, behavior: 'smooth' });
    });
    document.getElementById('scroll-right')?.addEventListener('click', () => {
        document.getElementById('spotify-carousel')?.scrollBy({ left: 340, behavior: 'smooth' });
    });

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