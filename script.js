const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const currentYear = document.querySelector("#current-year");
const siteHeader = document.querySelector(".site-header");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

// Transparent-to-solid header on scroll
const updateHeaderState = () => {
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 50);
};
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

// ── Sliding nav pill ──────────────────────────────────────────
const navPill = siteHeader.querySelector(".nav-pill");
const navLinks = Array.from(siteHeader.querySelectorAll(".primary-nav a:not(.nav-register)"));
const navEl = siteHeader.querySelector(".primary-nav");
let pillTarget = null; // the link the pill should rest on (active link)

function movePillTo(link) {
  if (!navPill || !link || !navEl) return;
  const navRect = navEl.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const padH = 10, padV = 5;
  navPill.style.left   = (linkRect.left - navRect.left - padH) + "px";
  navPill.style.top    = (linkRect.top  - navRect.top  - padV) + "px";
  navPill.style.width  = (linkRect.width  + padH * 2) + "px";
  navPill.style.height = (linkRect.height + padV * 2) + "px";
}

function setPillResting() {
  const active = navLinks.find(l => l.classList.contains("is-active")) || navLinks[0];
  pillTarget = active;
  movePillTo(active);
}

// Hover: slide to hovered link, return to resting on mouseleave
navLinks.forEach(link => {
  link.addEventListener("mouseenter", () => movePillTo(link));
  link.addEventListener("mouseleave", () => { if (pillTarget) movePillTo(pillTarget); });
  link.addEventListener("focus",      () => movePillTo(link));
  link.addEventListener("blur",       () => { if (pillTarget) movePillTo(pillTarget); });
});

// Update pill when active link changes (called after scroll-spy updates)
function syncPill() {
  setPillResting();
}

// Initial position (no transition yet)
if (navPill) {
  navPill.style.transition = "none";
  setPillResting();
  // Re-enable transition on next frame
  requestAnimationFrame(() => {
    navPill.style.transition = "";
  });
}
// ─────────────────────────────────────────────────────────────

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
  siteHeader.classList.toggle("nav-is-open", !isExpanded);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
    siteHeader.classList.remove("nav-is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
    siteHeader.classList.remove("nav-is-open");
    menuToggle.focus();
  }
});

// Set a confirmed ISO timestamp with timezone here to activate the countdown.
const eventStart = "2027-01-23T09:00:00+05:30";

// ── Countdown boxes ───────────────────────────────────────────
const cdDays  = document.querySelector("#cd-days .countdown-box-num");
const cdHours = document.querySelector("#cd-hours .countdown-box-num");
const cdMins  = document.querySelector("#cd-mins .countdown-box-num");
const cdSecs  = document.querySelector("#cd-secs .countdown-box-num");
const cdNote  = document.querySelector("#countdown-unset-note");

// Populate these values when the organising team confirms its public contact details and venue.
const organiserPhone = "";
const organiserEmail = "";
const venueMapEmbedUrl = "https://www.google.com/maps?q=18.555847,73.913453&z=16&output=embed";
const venueDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=18.555847,73.913453";

const parseEventStart = (value) => {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(
      value,
    );

  if (!match) {
    return Number.NaN;
  }

  const [, year, month, day, hour, minute, second, fraction, timezone, offsetSign, offsetHour, offsetMinute] =
    match;
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  date.setUTCHours(Number(hour), Number(minute), Number(second), Number((fraction ?? "").padEnd(3, "0").slice(0, 3)));

  const hasValidDate =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    Number(hour) <= 23 &&
    Number(minute) <= 59 &&
    Number(second) <= 59;
  const hasValidOffset =
    timezone === "Z" || (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59);

  return hasValidDate && hasValidOffset ? Date.parse(value) : Number.NaN;
};

(function initCountdown() {
  const pad = (n) => String(n).padStart(2, "0");

  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  if (typeof eventStart !== "string" || !eventStart.trim()) {
    // No eventStart set — show dashes and note
    if (cdNote) cdNote.hidden = false;
    return;
  }

  const target = parseEventStart(eventStart);

  if (!Number.isFinite(target)) {
    // Unparseable value — show dashes and note
    if (cdNote) cdNote.hidden = false;
    return;
  }

  // eventStart is valid — hide the note
  if (cdNote) cdNote.hidden = true;

  let countdownInterval;

  const updateCountdown = () => {
    const remaining = target - Date.now();
    if (remaining <= 0) {
      cdDays.textContent = "00";
      cdHours.textContent = "00";
      cdMins.textContent = "00";
      cdSecs.textContent = "00";
      window.clearInterval(countdownInterval);
      return false;
    }
    cdDays.textContent  = pad(Math.floor(remaining / 86_400_000));
    cdHours.textContent = pad(Math.floor((remaining % 86_400_000) / 3_600_000));
    cdMins.textContent  = pad(Math.floor((remaining % 3_600_000) / 60_000));
    cdSecs.textContent  = pad(Math.floor((remaining % 60_000) / 1_000));
    return true;
  };

  if (updateCountdown()) {
    countdownInterval = window.setInterval(updateCountdown, 1_000);
  }
}());

const sectionLinks = Array.from(
  document.querySelectorAll('.primary-nav a[href^="#"]:not(.nav-register)'),
)
  .map((link) => ({
    link,
    section: document.getElementById(link.getAttribute("href").slice(1)),
  }))
  .filter(({ section }) => section);

if ("IntersectionObserver" in window && sectionLinks.length > 0) {
  const visibleSections = new Set();
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target);
        } else {
          visibleSections.delete(entry.target);
        }
      });

      const activeSection = Array.from(visibleSections).sort((first, second) => {
        const activationLine = window.innerHeight * 0.35;
        const firstDistance = Math.abs(
          first.getBoundingClientRect().top + first.getBoundingClientRect().height / 2 - activationLine,
        );
        const secondDistance = Math.abs(
          second.getBoundingClientRect().top + second.getBoundingClientRect().height / 2 - activationLine,
        );
        return firstDistance - secondDistance;
      })[0];

      if (activeSection) {
        sectionLinks.forEach(({ link, section }) => {
          const isActive = section === activeSection;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
        syncPill(); // keep pill in sync with scroll-spy
      }
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
  );

  sectionLinks.forEach(({ section }) => sectionObserver.observe(section));
}

const revealElements = document.querySelectorAll(
  ".three-pillars > div, .agenda-item, .programme-quote, .speaker-card, .wall-card, .voice-card, .value-tiles > div",
);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => {
    element.classList.add("reveal", "is-visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -30px 0px" },
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}

const pendingContact = document.querySelector("#contact-pending");
const phoneLink = document.querySelector("#contact-phone");
const emailLink = document.querySelector("#contact-email");
const footerPhoneLink = document.querySelector("#footer-contact-phone");
const footerEmailLink = document.querySelector("#footer-contact-email");
const configuredValue = (value) => (typeof value === "string" ? value.trim() : "");
const phone = configuredValue(organiserPhone);
const email = configuredValue(organiserEmail);
const mapEmbedUrl = configuredValue(venueMapEmbedUrl);
const directionsUrl = configuredValue(venueDirectionsUrl);

const showContactLink = (link, href, label) => {
  if (!link) {
    return;
  }
  link.href = href;
  link.textContent = label;
  link.hidden = false;
};

if (phone) {
  showContactLink(phoneLink, `tel:${phone}`, phone);
  showContactLink(footerPhoneLink, `tel:${phone}`, phone);
}

if (email) {
  showContactLink(emailLink, `mailto:${email}`, email);
  showContactLink(footerEmailLink, `mailto:${email}`, email);
}

if ((phone || email) && pendingContact) {
  pendingContact.hidden = true;
}

const campusImage = document.querySelector(".campus-photo-image");
if (campusImage) {
  const testImage = new Image();
  testImage.onload = () => {
    campusImage.hidden = false;
  };
  testImage.onerror = () => {
    campusImage.hidden = true;
    const campusPhoto = campusImage.closest(".campus-photo");
    if (campusPhoto) {
      campusPhoto.classList.add("is-empty");
    }
  };
  testImage.src = campusImage.getAttribute("src");
}

const venueMap = document.querySelector("#venue-map");
const venueMapFrame = venueMap?.querySelector("iframe");
const venueNote = document.querySelector(".venue-note");

if (mapEmbedUrl && venueMap && venueMapFrame) {
  venueMapFrame.src = mapEmbedUrl;
  venueMap.hidden = false;
  if (venueNote) {
    venueNote.hidden = true;
  }
}

const directionsLink = document.querySelector("#get-directions");
if (directionsUrl && directionsLink) {
  directionsLink.href = directionsUrl;
  directionsLink.hidden = false;
}

const backToTopLink = document.querySelector(".back-to-top");
if (backToTopLink) {
  const updateBackToTopVisibility = () => {
    const visible = window.scrollY > 120;
    backToTopLink.hidden = !visible;
    backToTopLink.setAttribute("aria-hidden", String(!visible));
    backToTopLink.tabIndex = visible ? 0 : -1;
  };
  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  updateBackToTopVisibility();
  backToTopLink.addEventListener("click", (event) => {
    event.preventDefault();
    const root = document.documentElement;
    const previousBehavior = root.style.getPropertyValue("scroll-behavior");
    const previousPriority = root.style.getPropertyPriority("scroll-behavior");
    const startY = window.scrollY;
    const startTime = performance.now();
    const duration = 900;
    root.style.setProperty("scroll-behavior", "auto", "important");

    const animateToTop = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      window.scrollTo(0, Math.round(startY * (1 - progress)));

      if (progress < 1) {
        requestAnimationFrame(animateToTop);
      } else if (previousBehavior) {
        root.style.setProperty("scroll-behavior", previousBehavior, previousPriority);
      } else {
        root.style.removeProperty("scroll-behavior");
      }
    };

    requestAnimationFrame(animateToTop);
  });
}



/* ═══════════════════════════════════════════════════════════════
   PREMIUM ANIMATIONS  –  vanilla JS, no libraries
   ═══════════════════════════════════════════════════════════════ */
(function premiumAnimations() {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll-progress bar ── */
  const bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  document.body.prepend(bar);
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive: true });

  /* ── 2. Confetti burst on Register button click ── */
  var CONFETTI_COLORS = ['#d98600','#f2c46d','#0b1f3a','#fff','#c0392b','#2ecc71'];
  function spawnConfetti(cx, cy) {
    if (reduced) return;
    for (var i = 0; i < 28; i++) {
      var dot = document.createElement('div');
      dot.className = 'confetti-dot';
      dot.style.cssText = [
        'left:' + cx + 'px',
        'top:'  + cy + 'px',
        'background:' + CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        'margin-left:' + (Math.random() * 80 - 40) + 'px',
        'animation-duration:' + (0.7 + Math.random() * 0.5) + 's',
        'animation-delay:'    + (Math.random() * 0.2) + 's'
      ].join(';');
      document.body.appendChild(dot);
      dot.addEventListener('animationend', function () { this.remove(); }, { once: true });
    }
  }
  document.querySelectorAll(
    '.button-gold, .nav-register, .mobile-register, .footer-action.footer-register'
  ).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      spawnConfetti(e.clientX, e.clientY);
      /* link still navigates — no preventDefault() */
    });
  });

  /* ── 3. Staggered slide-in on Recognise / Appreciate / Connect cards ── */
  var cards = document.querySelectorAll('.intro-principle');
  if ('IntersectionObserver' in window) {
    var cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          cardObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    cards.forEach(function (c) { cardObs.observe(c); });
  } else {
    cards.forEach(function (c) { c.classList.add('is-visible'); });
  }

  /* ── 4. Timeline line draws on scroll ── */
  if (!reduced) {
    var agendaList = document.querySelector('.agenda-list');
    if (agendaList) {
      function updateTimeline() {
        var rect = agendaList.getBoundingClientRect();
        var prog = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height));
        agendaList.style.setProperty('--tl-progress', prog);
      }
      window.addEventListener('scroll', updateTimeline, { passive: true });
      updateTimeline();
    }
  }

  /* ── 4b. LIVE NOW badge — active only during the event on 23 Jan 2027 ──
     Times are in IST (UTC+05:30). Invisible every other day. */
  var SESSIONS = [
    { sel: '.agenda-item:nth-child(1)',  s: '2027-01-23T09:00:00+05:30', e: '2027-01-23T09:30:00+05:30' },
    { sel: '.agenda-item:nth-child(2)',  s: '2027-01-23T09:30:00+05:30', e: '2027-01-23T09:40:00+05:30' },
    { sel: '.agenda-item:nth-child(3)',  s: '2027-01-23T09:40:00+05:30', e: '2027-01-23T09:50:00+05:30' },
    { sel: '.agenda-item:nth-child(4)',  s: '2027-01-23T09:50:00+05:30', e: '2027-01-23T10:10:00+05:30' },
    { sel: '.agenda-item:nth-child(5)',  s: '2027-01-23T10:10:00+05:30', e: '2027-01-23T10:35:00+05:30' },
    { sel: '.agenda-item:nth-child(6)',  s: '2027-01-23T10:35:00+05:30', e: '2027-01-23T11:15:00+05:30' },
    { sel: '.agenda-item:nth-child(7)',  s: '2027-01-23T11:15:00+05:30', e: '2027-01-23T11:30:00+05:30' },
    { sel: '.agenda-item:nth-child(8)',  s: '2027-01-23T11:30:00+05:30', e: '2027-01-23T12:15:00+05:30' },
    { sel: '.agenda-item:nth-child(9)',  s: '2027-01-23T12:15:00+05:30', e: '2027-01-23T12:45:00+05:30' },
    { sel: '.agenda-item:nth-child(10)', s: '2027-01-23T12:45:00+05:30', e: '2027-01-23T13:00:00+05:30' },
    { sel: '.agenda-item:nth-child(11)', s: '2027-01-23T13:00:00+05:30', e: '2027-01-23T13:15:00+05:30' },
    { sel: '.agenda-item:nth-child(12)', s: '2027-01-23T13:15:00+05:30', e: '2027-01-23T14:00:00+05:30' }
  ];
  function checkLiveSession() {
    var now = Date.now();
    SESSIONS.forEach(function (s) {
      var el = document.querySelector(s.sel);
      if (!el) return;
      var live = now >= new Date(s.s).getTime() && now < new Date(s.e).getTime();
      el.classList.toggle('agenda-item--live-now', live);
    });
  }
  checkLiveSession();
  setInterval(checkLiveSession, 30000);

  /* ── 5. QR code scanning line ── */
  var qrCard = document.querySelector('.qr-card');
  if (qrCard) {
    var scanLine = document.createElement('div');
    scanLine.className = 'qr-scan-line';
    qrCard.appendChild(scanLine);
  }

  /* ── 6. Campus photo wipe-in + zoom-out ── */
  var campusPhoto = document.querySelector('.campus-photo');
  if (campusPhoto) {
    if ('IntersectionObserver' in window) {
      var photoObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          campusPhoto.classList.add('photo-revealed');
          photoObs.disconnect();
        }
      }, { threshold: 0.15 });
      photoObs.observe(campusPhoto);
    } else {
      campusPhoto.classList.add('photo-revealed');
    }
  }

}());

