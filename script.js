const TEST_PASSWORD = "abubulovesabibi";

const passwordScreen = document.getElementById("password-screen");
const passwordInput = document.getElementById("password-input");
const unlockButton = document.getElementById("unlock-button");
const passwordError = document.getElementById("password-error");
const desktop = document.getElementById("desktop");
const notification = document.getElementById("notification");
const hintButton = document.getElementById("hint-button");
const hintPopup = document.getElementById("hint-popup");
const hintClose = document.getElementById("hint-close");
const hintOk = document.getElementById("hint-ok");

/* Small click sound using the browser's built-in Web Audio API.
   No sound file is needed yet. */
let audioContext;

function clickSound() {
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 420;

    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.055
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.055);
  } catch (error) {
    // Sound is optional. The website still works if audio is unavailable.
  }
}


/* Password hint */
function openHint() {
  clickSound();
  hintPopup.classList.add("open");
  hintPopup.setAttribute("aria-hidden", "false");
}

function closeHint() {
  clickSound();
  hintPopup.classList.remove("open");
  hintPopup.setAttribute("aria-hidden", "true");
}

hintButton.addEventListener("click", openHint);
hintClose.addEventListener("click", closeHint);
hintOk.addEventListener("click", closeHint);

function unlock() {
  const entered = passwordInput.value.trim();

  if (entered === TEST_PASSWORD) {
    clickSound();
    passwordError.textContent = "";

    passwordScreen.classList.remove("active");

    setTimeout(() => {
      desktop.classList.add("unlocked");
    }, 220);

  } else {
    clickSound();
    passwordError.textContent = "That isn't the password. Try again.";
    passwordInput.value = "";
    passwordInput.focus();
  }
}

unlockButton.addEventListener("click", unlock);

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlock();
  }
});

/* Open folder windows */
document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("click", () => {
    clickSound();

    const windowId = icon.dataset.window;
    const targetWindow = document.getElementById(windowId);

    document.querySelectorAll(".window").forEach((win) => {
      win.style.zIndex = 10;
    });

    targetWindow.classList.remove("minimized");
    targetWindow.classList.add("open");
    targetWindow.style.zIndex = 20;

    if (windowId === "window-2") {
      const newspaper = document.getElementById("newspaper-sheet");
      newspaper.classList.remove("unfolded");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => newspaper.classList.add("unfolded"));
      });
    }
  });
});

/* Close/minimize buttons */
document.querySelectorAll(".window").forEach((windowElement) => {

  windowElement.querySelector(".close").addEventListener("click", (event) => {
    event.stopPropagation();
    clickSound();
    windowElement.classList.remove("open");
    if (windowElement.id === "window-2") {
      document.getElementById("newspaper-sheet").classList.remove("unfolded");
    }
  });

  windowElement.querySelector(".minimize").addEventListener("click", (event) => {
    event.stopPropagation();
    clickSound();
    windowElement.classList.add("minimized");
  });

  windowElement.addEventListener("mousedown", () => {
    document.querySelectorAll(".window").forEach((win) => {
      win.style.zIndex = 10;
    });
    windowElement.style.zIndex = 20;
  });
});

/* Notification */
notification.querySelector(".notification-close").addEventListener("click", () => {
  clickSound();
  notification.style.display = "none";
});

/* Every button gets a tiny click */
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    // Individual controls already call clickSound(), so this is intentionally empty.
  });
});


/* ============================================================
   ABHI'S MUSEUM — EXHIBITS
   ============================================================ */

const museumExhibits = {
  1: {
    title: "Exhibit 1 — Childhood",
    image: "museum/exhibit-1.jpeg",
    caption: "The early chapters — before the world got to know him."
  },
  2: {
    title: "Exhibit 2 — School + Early College",
    image: "museum/exhibit-2.jpeg",
    caption: "School days, first chapters of college, and the person taking shape."
  },
  3: {
    title: "Exhibit 3 — Present Day",
    image: "museum/exhibit-3.jpeg",
    caption: "Abhi, as he is now — college, GDG, projects, people, and everything in between."
  },
  4: {
    title: "Exhibit 4 — The People + Moments",
    image: "museum/exhibit-4.jpeg",
    caption: "A little collection of the people and moments that became part of his story."
  }
};

const exhibitViewer = document.getElementById("exhibit-viewer");
const exhibitTitle = document.getElementById("exhibit-title");
const exhibitImage = document.getElementById("exhibit-image");
const exhibitCaption = document.getElementById("exhibit-caption");
const placeholder = document.getElementById("photo-placeholder");
const placeholderPath = document.getElementById("placeholder-path");
const exhibitClose = document.getElementById("exhibit-close");
const fullscreenPhoto = document.getElementById("fullscreen-photo");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");
const lightbox = document.getElementById("photo-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
let currentZoom = 1;
let currentExhibit = null;

function resetZoom() {
  currentZoom = 1;
  exhibitImage.style.transform = "scale(1)";
}

function openExhibit(number) {
  clickSound();
  const exhibit = museumExhibits[number];
  currentExhibit = number;
  currentZoom = 1;

  exhibitTitle.textContent = exhibit.title;
  exhibitCaption.textContent = exhibit.caption;
  exhibitImage.alt = exhibit.title + " collage";
  exhibitImage.style.transform = "scale(1)";
  exhibitImage.classList.remove("loaded");
  placeholder.classList.remove("hidden");
  placeholderPath.textContent = "Looking for " + exhibit.image + " ...";

  exhibitImage.onload = () => {
    exhibitImage.classList.add("loaded");
    placeholder.classList.add("hidden");
  };

  exhibitImage.onerror = () => {
    exhibitImage.classList.remove("loaded");
    placeholder.classList.remove("hidden");
    placeholderPath.textContent =
      "Could not find " + exhibit.image +
      " — check the museum folder sits next to index.html and the file name is exactly " +
      exhibit.image.replace("museum/", "") + " (no extra .jpg or .jpeg at the end).";
  };

  // Set src AFTER the handlers above so a fast load is never missed.
  exhibitImage.src = exhibit.image;

  exhibitViewer.classList.add("open");
  exhibitViewer.setAttribute("aria-hidden", "false");
}

document.querySelectorAll(".exhibit-folder").forEach((folder) => {
  folder.addEventListener("click", () => openExhibit(folder.dataset.exhibit));
});

function closeExhibit() {
  clickSound();
  exhibitViewer.classList.remove("open");
  exhibitViewer.setAttribute("aria-hidden", "true");
}

exhibitClose.addEventListener("click", closeExhibit);

exhibitViewer.addEventListener("click", (event) => {
  if (event.target === exhibitViewer) closeExhibit();
});

zoomIn.addEventListener("click", () => {
  clickSound();
  if (!exhibitImage.classList.contains("loaded")) return;
  currentZoom = Math.min(3, currentZoom + 0.25);
  exhibitImage.style.transform = `scale(${currentZoom})`;
});

zoomOut.addEventListener("click", () => {
  clickSound();
  if (!exhibitImage.classList.contains("loaded")) return;
  currentZoom = Math.max(0.5, currentZoom - 0.25);
  exhibitImage.style.transform = `scale(${currentZoom})`;
});

zoomReset.addEventListener("click", () => {
  clickSound();
  resetZoom();
});

exhibitImage.addEventListener("click", () => {
  if (!exhibitImage.classList.contains("loaded")) return;
  clickSound();
  lightboxImage.src = exhibitImage.src;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
});

fullscreenPhoto.addEventListener("click", () => {
  if (!exhibitImage.classList.contains("loaded")) return;
  clickSound();
  lightboxImage.src = exhibitImage.src;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
});

function closeLightbox() {
  clickSound();
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (lightbox.classList.contains("open")) {
      closeLightbox();
    } else if (exhibitViewer.classList.contains("open")) {
      closeExhibit();
    }
  }
});


/* ============================================================
   MY SKILL TREE — THUMBPRINT SCAN + RESULTS REVEAL
   ============================================================ */
const skillEnterButton = document.getElementById("skill-enter-button");
const skillRescanButton = document.getElementById("skill-rescan-button");
const skillScanScreen = document.getElementById("skill-scan-screen");
const skillLoadingScreen = document.getElementById("skill-loading-screen");
const skillResultsScreen = document.getElementById("skill-results-screen");
const fingerprintPad = document.getElementById("fingerprint-pad");
const scanStatus = document.getElementById("scan-status");

function resetSkillTree() {
  skillResultsScreen.hidden = true;
  skillLoadingScreen.hidden = true;
  skillScanScreen.hidden = false;
  skillResultsScreen.classList.remove("show-bars");
  fingerprintPad.classList.remove("scanning");
  scanStatus.textContent = "AWAITING THUMBPRINT";
  scanStatus.classList.remove("scanned");
  skillEnterButton.disabled = false;
}

function runSkillScan() {
  if (skillEnterButton.disabled) return;
  clickSound();
  skillEnterButton.disabled = true;
  fingerprintPad.classList.add("scanning");
  scanStatus.textContent = "THUMBPRINT DETECTED · SCANNING";
  scanStatus.classList.add("scanned");
  window.setTimeout(() => {
    skillScanScreen.hidden = true;
    skillLoadingScreen.hidden = false;
    const loadingMessages = [
      "Measuring core abilities",
      "Consulting highly questionable data",
      "Accounting for birthday bias"
    ];
    let messageIndex = 0;
    const messageTimer = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      const message = document.getElementById("skill-loading-message");
      if (message) message.textContent = loadingMessages[messageIndex];
    }, 600);
    window.setTimeout(() => {
      window.clearInterval(messageTimer);
      fingerprintPad.classList.remove("scanning");
      skillLoadingScreen.hidden = true;
      skillResultsScreen.hidden = false;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => skillResultsScreen.classList.add("show-bars"));
      });
      clickSound();
    }, 2000);
  }, 180);
}

skillEnterButton.addEventListener("click", runSkillScan);
skillRescanButton.addEventListener("click", () => {
  clickSound();
  resetSkillTree();
});


/* MUSIC FOR ABLAS — load matching cover artwork when available.
   Playback links remain usable even if an artwork service is unavailable. */
const musicArtwork = [
  { title: "Future Days", artist: "Pearl Jam", query: "Future Days Pearl Jam" },
  { title: "Past Won't Leave My Bed", artist: "Joji", query: "Past Won't Leave My Bed Joji" },
  { title: "Deathmetal (Live)", artist: "Panchiko", query: "Deathmetal Panchiko" },
  { title: "The Outside", artist: "Phoebe Bridgers", query: "The Outside Phoebe Bridgers" },
  { title: "Love Me Not", artist: "Olivia Dean's cover", query: "Love Me Not Olivia Dean cover" },
  { title: "Risk", artist: "Gracie Abrams", query: "Risk Gracie Abrams" },
  { title: "Honeybee", artist: "Olivia Rodrigo", query: "Honeybee Olivia Rodrigo" }
];

async function loadMusicArtwork() {
  const cards = document.querySelectorAll("#music-grid .song-card");
  cards.forEach((card, index) => {
    const track = musicArtwork[index];
    if (!track) return;
    const query = encodeURIComponent(track.query);
    fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=8`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error("Artwork unavailable")))
      .then(data => {
        const results = data.results || [];
        const artistNeedle = track.artist.toLowerCase().replace("'s cover", "");
        const titleNeedle = track.title.toLowerCase().replace(" (live)", "");
        const match = results.find(item =>
          (item.trackName || "").toLowerCase().includes(titleNeedle) &&
          (item.artistName || "").toLowerCase().includes(artistNeedle)
        );
        if (!match || !match.artworkUrl100) return;
        const art = card.querySelector(".album-art");
        const image = document.createElement("img");
        image.src = match.artworkUrl100.replace("100x100bb", "400x400bb");
        image.alt = `${track.title} cover artwork`;
        image.loading = "lazy";
        image.onerror = () => image.remove();
        art.replaceChildren(image);
        art.classList.remove("album-fallback");
      })
      .catch(() => { /* The pastel fallback cover remains visible. */ });
  });
}
loadMusicArtwork();
