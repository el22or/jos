// Još — a little JavaScript: intro, menu and the "build your own cake" form.
// The site works without it; this only adds convenience.

const phone = '381601234567';

/* ---------- intro animation ---------- */

const splash = document.querySelector('[data-splash]');
if (splash && document.documentElement.classList.contains('intro')) {
  const finish = () => {
    splash.remove();
    document.documentElement.classList.remove('intro');
  };
  splash.addEventListener('click', finish, { once: true });
  // Remove the splash as soon as its slide-out animation ends; the timer is only a safety net.
  splash.addEventListener('animationend', (e) => {
    if (e.target === splash && e.animationName === 'splashOut') splash.remove();
  });
  setTimeout(() => splash.isConnected && splash.remove(), 3000);
}

/* ---------- mobile menu (popover + commandfor) ---------- */

const menu = document.getElementById('menu');

if (menu && 'popover' in HTMLElement.prototype) {
  // Clicking a link inside the menu closes it.
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && menu.matches(':popover-open')) menu.hidePopover();
  });

  // Fallback for browsers without the Invoker Commands API.
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    const commands = {
      'toggle-popover': (el) => el.togglePopover(),
      'show-popover': (el) => el.showPopover(),
      'hide-popover': (el) => el.hidePopover(),
    };
    document.querySelectorAll('button[commandfor]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = document.getElementById(button.getAttribute('commandfor'));
        const run = commands[button.getAttribute('command')];
        if (target && run) run(target);
      });
    });
    // Native invokers expose aria-expanded themselves; the fallback has to do it by hand.
    const toggle = document.querySelector('.header__toggle');
    toggle?.setAttribute('aria-expanded', 'false');
    menu.addEventListener('toggle', (e) => {
      toggle?.setAttribute('aria-expanded', String(e.newState === 'open'));
    });
  }
}

/* ---------- build your own cake ---------- */

const form = document.querySelector('[data-builder]');

if (form) {
  const cakeText = document.querySelector('[data-cake-text]');
  const colorName = form.querySelector('[data-color-name]');
  const message = form.querySelector('[data-message]');
  const status = form.querySelector('[data-status]');
  const instagramLink = form.querySelector('[data-send-ig]');
  const whatsappLink = form.querySelector('[data-send-wa]');
  const inscription = form.elements.inscription;
  const pickupDate = form.elements['pickup-date'];

  // Calendar dates without a time of day: Temporal.PlainDate where available, Date otherwise.
  const hasTemporal = typeof Temporal !== 'undefined';
  const dateFormat = new Intl.DateTimeFormat('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' });

  const earliestPickup = () => {
    if (hasTemporal) return Temporal.Now.plainDateISO().add({ days: 2 }).toString();
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  };

  // e.g. "20. oktobar 2026."
  const formatDate = (isoDate) => {
    if (hasTemporal) return dateFormat.format(Temporal.PlainDate.from(isoDate));
    const [year, month, day] = isoDate.split('-').map(Number);
    return dateFormat.format(new Date(year, month - 1, day));
  };

  pickupDate.min = earliestPickup();

  const orderText = () => {
    const flavor = form.elements.flavor.value;
    const glaze = form.elements.glaze.value;
    const text = inscription.value.trim() || 'bez natpisa';
    const when = pickupDate.value ? `za ${formatDate(pickupDate.value)}` : 'datum po dogovoru';
    // A Serbian date already ends with a full stop ("20. oktobar 2026."), so don't add a second one.
    return `bento torta, ${flavor.toLowerCase()}, glazura ${glaze.toLowerCase()}, natpis „${text}“, ${when}${when.endsWith('.') ? '' : '.'}`;
  };

  // The cake colour follows the checked swatch in CSS (:has()); JS only updates the text.
  const update = () => {
    colorName.textContent = form.elements.glaze.value;
    cakeText.textContent = inscription.value.trim() || 'tvoj natpis';

    const text = orderText();
    message.textContent = text;
    whatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent('Zdravo! Želim da poručim: ' + text)}`;
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  update();

  // Instagram does not allow a prefilled message, so copy it before the chat opens.
  instagramLink.addEventListener('click', async () => {
    const text = 'Zdravo! Želim da poručim: ' + orderText();
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Poruka je kopirana — nalepi je u Instagram razgovor. Vidimo se uskoro!';
    } catch {
      status.textContent = 'Napiši nam u Instagram poruci: ' + text;
    }
  });
}
