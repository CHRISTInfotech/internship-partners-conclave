const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
    menuToggle.focus();
  }
});

// Set a confirmed ISO timestamp with timezone here to activate the countdown.
const eventStart = null;
const countdown = document.querySelector("#countdown");

// Populate these values when the organising team confirms its public contact details and venue.
const organiserPhone = "";
const organiserEmail = "";
const venueMapEmbedUrl = "";
const venueDirectionsUrl = "";

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

if (countdown && typeof eventStart === "string") {
  const target = parseEventStart(eventStart);

  if (Number.isFinite(target)) {
    let countdownInterval;

    const updateCountdown = () => {
      const remaining = target - Date.now();
      if (remaining <= 0) {
        countdown.textContent = "The conclave is underway";
        window.clearInterval(countdownInterval);
        return false;
      }

      const days = Math.floor(remaining / 86_400_000);
      const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
      const minutes = Math.floor((remaining % 3_600_000) / 60_000);
      const seconds = Math.floor((remaining % 60_000) / 1_000);
      countdown.textContent = `${days} days · ${hours} hrs · ${minutes} min · ${seconds} sec`;
      return true;
    };

    if (updateCountdown()) {
      countdownInterval = window.setInterval(updateCountdown, 1_000);
    }
  }
}

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
const configuredValue = (value) => (typeof value === "string" ? value.trim() : "");
const phone = configuredValue(organiserPhone);
const email = configuredValue(organiserEmail);
const mapEmbedUrl = configuredValue(venueMapEmbedUrl);
const directionsUrl = configuredValue(venueDirectionsUrl);

if (phone && phoneLink) {
  phoneLink.href = `tel:${phone}`;
  phoneLink.textContent = phone;
  phoneLink.hidden = false;
}

if (email && emailLink) {
  emailLink.href = `mailto:${email}`;
  emailLink.textContent = email;
  emailLink.hidden = false;
}

if ((phone || email) && pendingContact) {
  pendingContact.hidden = true;
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
