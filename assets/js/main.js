/* MareFun — site interactions: hero canvas, reveal-on-scroll, i18n, form validation */
(() => {
  "use strict";

  /* ---------------------------------------------------------------------
   * Header state
   * ------------------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("is-open"))
    );
  }

  /* ---------------------------------------------------------------------
   * Scroll reveal
   * ------------------------------------------------------------------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = document.querySelectorAll("[data-reveal]");
  if (reduceMotion) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
   * Hero canvas — generative moonlit sea
   * ------------------------------------------------------------------- */
  const canvas = document.getElementById("hero-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, glints;

    const rand = (a, b) => a + Math.random() * (b - a);

    const buildGlints = () => {
      const count = Math.round((w * h) / 70000);
      // glints cluster into a sun-reflection column at centre, widening toward the bottom
      glints = Array.from({ length: Math.max(30, count) }, () => {
        const y = rand(h * 0.565, h * 0.96);
        const depth = (y - h * 0.565) / (h * 0.4);
        const spread = w * (0.05 + depth * 0.16);
        return {
          x: w * 0.5 + rand(-spread, spread),
          y,
          r: rand(0.4, 1.7),
          speed: rand(0.15, 0.5),
          phase: rand(0, Math.PI * 2),
          drift: rand(-0.05, 0.05),
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGlints();
    };

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // dusk sky — deep navy easing into warm amber at the horizon
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.565);
      sky.addColorStop(0, "#050a17");
      sky.addColorStop(0.62, "#182644");
      sky.addColorStop(0.86, "#4a3a4a");
      sky.addColorStop(1, "#7a5240");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.565);

      // low sun glow sitting on the horizon
      const sx = w * 0.5, sy = h * 0.565;
      const sunGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.32);
      sunGlow.addColorStop(0, "rgba(230,178,120,0.55)");
      sunGlow.addColorStop(0.35, "rgba(198,161,92,0.22)");
      sunGlow.addColorStop(1, "rgba(198,161,92,0)");
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, h * 0.2, w, h * 0.4);

      const sea = ctx.createLinearGradient(0, h * 0.565, 0, h);
      sea.addColorStop(0, "#2c2436");
      sea.addColorStop(0.18, "#141f38");
      sea.addColorStop(1, "#050b18");
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.565, w, h * 0.435);

      // horizon line
      ctx.fillStyle = "rgba(230,190,140,0.3)";
      ctx.fillRect(0, h * 0.565, w, 1);

      // sunlight reflecting on water
      glints.forEach((g) => {
        const s = (Math.sin(t * g.speed + g.phase) + 1) / 2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(236,196,140,${0.06 + s * 0.32})`;
        ctx.arc(g.x, g.y, g.r + s * 0.8, 0, Math.PI * 2);
        ctx.fill();
        g.x += g.drift;
        if (g.x < 0) g.x = w;
        if (g.x > w) g.x = 0;
      });

      t += 0.016;
    };

    let raf;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      draw();
    } else {
      loop();
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else loop();
      });
    }
  }

  /* ---------------------------------------------------------------------
   * i18n — EN / IT / FR
   * ------------------------------------------------------------------- */
  const dict = {
    en: {
      "nav.fleet": "Fleet", "nav.marina": "Marina", "nav.about": "About",
      "nav.testimonials": "Testimonials", "nav.contact": "Contact",
      "header.cta": "Enquire",
      "hero.eyebrow": "Mediterranean Yacht Charter & Marina Management",
      "hero.title": "Set a course for the <em>extraordinary</em>.",
      "hero.sub": "From Portofino to Porto Cervo — handpicked yachts and private berths, arranged with quiet precision.",
      "hero.cta1": "Enquire About a Charter", "hero.cta2": "Reserve a Berth",
      "hero.meta1.label": "Handpicked Fleet", "hero.meta2.label": "Berths Managed Daily", "hero.meta3.label": "Portofino to Monaco",
      "fleet.eyebrow": "The Fleet", "fleet.title": "A collection, not a catalogue.",
      "fleet.lede": "Every yacht is inspected, crewed and provisioned to a single standard — ours. Availability changes with the season; enquire for current departures.",
      "fleet.cta": "View Full Fleet",
      "fleet.guests": "Guests", "fleet.cabins": "Cabins", "fleet.crew": "Crew",
      "fleet.price": "Price on request", "fleet.enquire": "Enquire",
      "yacht.motor": "Motor Yacht", "yacht.sail": "Sailing Yacht",
      "marina.eyebrow": "Marina & Berth Management", "marina.title": "Your berth, held to the same standard as your yacht.",
      "marina.lede": "Real-time availability across our managed piers, with transparent day-rates by length overall. Long-term contracts and owner priority booking available on request.",
      "marina.legend.open": "Available", "marina.legend.hold": "On Hold", "marina.legend.full": "Occupied",
      "marina.th.length": "Length Overall",
      "marina.perDay": "/ day", "marina.onRequest": "On Request",
      "marina.size.small": "Small · Up to 12m", "marina.size.medium": "Medium · 12 – 18m", "marina.size.large": "Large · 18m and above",
      "marina.panel.title": "Request a Berth", "marina.panel.lede": "Tell us your yacht's length, arrival window and stay duration — our harbour team confirms within one business day.",
      "marina.panel.cta": "Check Availability",
      "about.eyebrow": "Our Story", "about.title": "Built by people who would rather be at sea.",
      "about.quote": "We started MareFun because chartering a yacht and mooring a yacht were treated as two different industries. We don't believe that. A guest's week and an owner's year deserve the same discretion, the same standard.",
      "about.founderRole": "Founder & Managing Director",
      "about.body": "Two decades on the water taught us that luxury isn't more of everything — it's fewer, better decisions, made on your behalf before you have to ask. That principle still runs every charter and every berth we manage today.",
      "about.stat1.label": "Personal Follow-Up", "about.stat2.label": "Careful Berth Management", "about.stat3.label": "Mediterranean-Wide Reach",
      "testimonials.eyebrow": "In Their Words", "testimonials.title": "Trusted across the Mediterranean.",
      "testimonials.lede": "A small sample of the notes our guests and berth holders leave us after each season.",
      "t1.quote": "Every detail was arranged before we thought to ask for it. The crew, the provisioning, even the berth transfer in Monaco — seamless.",
      "t2.quote": "We've kept our yacht at their marina for three seasons now. Communication on availability and pricing is the clearest we've had anywhere.",
      "t3.quote": "Sober, professional, and genuinely knowledgeable about the boats themselves. A rare combination in this industry.",
      "contact.eyebrow": "Get in Touch", "contact.title": "Begin with a conversation.",
      "contact.lede": "Whether you're chartering for a week or berthing for a season, our team replies personally — no call centres, no forms lost to the void.",
      "contact.phone.k": "Phone", "contact.email.k": "Email", "contact.location.k": "Base Marina",
      "contact.location.v": "Porto Cervo, Sardinia · Additional berths in Monaco",
      "form.title": "Send an Enquiry", "form.lede": "Fields marked with an asterisk are required.",
      "form.name": "Full Name *", "form.name.ph": "Alexandra Bennett",
      "form.method": "Preferred Contact *", "form.method.email": "Email", "form.method.phone": "Phone",
      "form.contact": "Your Contact Detail *", "form.contact.ph.email": "you@example.com", "form.contact.ph.phone": "+1 555 000 0000",
      "form.message": "Message *", "form.message.ph": "Tell us about the charter or berth you have in mind…",
      "form.submit": "Send Enquiry",
      "form.err.required": "This field is required.", "form.err.email": "Enter a valid email address.", "form.err.phone": "Enter a valid phone number.",
      "form.success": "Thank you — we typically reply within one business day.",
      "footer.blurb": "Luxury yacht charter and marina berth management across the Mediterranean, arranged with quiet precision.",
      "footer.services": "Services", "footer.svc1": "Yacht Charter", "footer.svc2": "Berth Management", "footer.svc3": "Concierge & Provisioning",
      "footer.company": "Company", "footer.link.fleet": "Fleet", "footer.link.marina": "Marina", "footer.link.about": "About", "footer.link.contact": "Contact",
      "footer.legal": "Legal", "footer.privacy": "Privacy Policy", "footer.terms": "Terms & Conditions", "footer.cookies": "Cookie Policy",
      "footer.rights": "All rights reserved.",
    },
    it: {
      "nav.fleet": "Flotta", "nav.marina": "Marina", "nav.about": "Storia",
      "nav.testimonials": "Recensioni", "nav.contact": "Contatti",
      "header.cta": "Richiedi Info",
      "hero.eyebrow": "Charter Nautico di Lusso & Gestione Marina",
      "hero.title": "Rotta verso lo <em>straordinario</em>.",
      "hero.sub": "Da Portofino a Porto Cervo — yacht selezionati e ormeggi privati, organizzati con discreta precisione.",
      "hero.cta1": "Richiedi un Charter", "hero.cta2": "Prenota un Ormeggio",
      "hero.meta1.label": "Flotta Selezionata", "hero.meta2.label": "Ormeggi Gestiti Ogni Giorno", "hero.meta3.label": "Da Portofino a Monaco",
      "fleet.eyebrow": "La Flotta", "fleet.title": "Una collezione, non un catalogo.",
      "fleet.lede": "Ogni yacht è ispezionato, equipaggiato e rifornito secondo un unico standard — il nostro. La disponibilità varia con la stagione; contattateci per le partenze attuali.",
      "fleet.cta": "Vedi Tutta la Flotta",
      "fleet.guests": "Ospiti", "fleet.cabins": "Cabine", "fleet.crew": "Equipaggio",
      "fleet.price": "Prezzo su richiesta", "fleet.enquire": "Richiedi",
      "yacht.motor": "Yacht a Motore", "yacht.sail": "Yacht a Vela",
      "marina.eyebrow": "Marina & Gestione Ormeggi", "marina.title": "Il tuo ormeggio, allo stesso livello del tuo yacht.",
      "marina.lede": "Disponibilità in tempo reale sui nostri moli gestiti, con tariffe giornaliere trasparenti in base alla lunghezza fuori tutto. Contratti a lungo termine e priorità per gli armatori su richiesta.",
      "marina.legend.open": "Disponibile", "marina.legend.hold": "In Opzione", "marina.legend.full": "Occupato",
      "marina.th.length": "Lunghezza F.T.",
      "marina.perDay": "/ giorno", "marina.onRequest": "Su Richiesta",
      "marina.size.small": "Piccolo · Fino a 12m", "marina.size.medium": "Medio · 12 – 18m", "marina.size.large": "Grande · Oltre 18m",
      "marina.panel.title": "Richiedi un Ormeggio", "marina.panel.lede": "Indicaci la lunghezza del tuo yacht, la finestra di arrivo e la durata della sosta — il nostro team conferma entro un giorno lavorativo.",
      "marina.panel.cta": "Verifica Disponibilità",
      "about.eyebrow": "La Nostra Storia", "about.title": "Costruita da chi preferirebbe essere in mare.",
      "about.quote": "Abbiamo fondato MareFun perché noleggiare uno yacht e ormeggiarlo venivano trattati come due settori distinti. Non lo crediamo. La settimana di un ospite e l'anno di un armatore meritano la stessa discrezione, lo stesso standard.",
      "about.founderRole": "Fondatore & Amministratore Delegato",
      "about.body": "Vent'anni in mare ci hanno insegnato che il lusso non è avere di più — sono meno decisioni, ma migliori, prese per voi prima ancora che dobbiate chiederle. Questo principio guida ancora oggi ogni charter e ogni ormeggio che gestiamo.",
      "about.stat1.label": "Assistenza Personale", "about.stat2.label": "Gestione Ormeggi Curata", "about.stat3.label": "Presenza in Tutto il Mediterraneo",
      "testimonials.eyebrow": "Le Loro Parole", "testimonials.title": "La fiducia di tutto il Mediterraneo.",
      "testimonials.lede": "Una piccola selezione dei commenti che i nostri ospiti e armatori ci lasciano ad ogni fine stagione.",
      "t1.quote": "Ogni dettaglio era già organizzato prima ancora che ci pensassimo. L'equipaggio, i rifornimenti, persino il trasferimento dell'ormeggio a Monaco — impeccabile.",
      "t2.quote": "Teniamo il nostro yacht nella loro marina da tre stagioni. La comunicazione su disponibilità e prezzi è la più chiara che abbiamo mai avuto.",
      "t3.quote": "Sobri, professionali e davvero competenti sulle imbarcazioni stesse. Una combinazione rara in questo settore.",
      "contact.eyebrow": "Contattaci", "contact.title": "Iniziamo con una conversazione.",
      "contact.lede": "Che stiate noleggiando per una settimana o ormeggiando per una stagione, il nostro team risponde personalmente — niente call center, nessun modulo perso nel vuoto.",
      "contact.phone.k": "Telefono", "contact.email.k": "Email", "contact.location.k": "Marina Base",
      "contact.location.v": "Porto Cervo, Sardegna · Ormeggi aggiuntivi a Monaco",
      "form.title": "Invia una Richiesta", "form.lede": "I campi contrassegnati con asterisco sono obbligatori.",
      "form.name": "Nome Completo *", "form.name.ph": "Alexandra Bennett",
      "form.method": "Contatto Preferito *", "form.method.email": "Email", "form.method.phone": "Telefono",
      "form.contact": "Il Tuo Recapito *", "form.contact.ph.email": "tu@esempio.com", "form.contact.ph.phone": "+39 000 000 0000",
      "form.message": "Messaggio *", "form.message.ph": "Raccontaci del charter o dell'ormeggio che hai in mente…",
      "form.submit": "Invia Richiesta",
      "form.err.required": "Questo campo è obbligatorio.", "form.err.email": "Inserisci un indirizzo email valido.", "form.err.phone": "Inserisci un numero di telefono valido.",
      "form.success": "Grazie — rispondiamo generalmente entro un giorno lavorativo.",
      "footer.blurb": "Charter nautico di lusso e gestione ormeggi in tutto il Mediterraneo, con discreta precisione.",
      "footer.services": "Servizi", "footer.svc1": "Charter Nautico", "footer.svc2": "Gestione Ormeggi", "footer.svc3": "Concierge & Approvvigionamento",
      "footer.company": "Azienda", "footer.link.fleet": "Flotta", "footer.link.marina": "Marina", "footer.link.about": "Storia", "footer.link.contact": "Contatti",
      "footer.legal": "Legale", "footer.privacy": "Informativa Privacy", "footer.terms": "Termini & Condizioni", "footer.cookies": "Cookie Policy",
      "footer.rights": "Tutti i diritti riservati.",
    },
    fr: {
      "nav.fleet": "Flotte", "nav.marina": "Marina", "nav.about": "Histoire",
      "nav.testimonials": "Avis", "nav.contact": "Contact",
      "header.cta": "Nous Contacter",
      "hero.eyebrow": "Location de Yachts de Luxe & Gestion de Marina",
      "hero.title": "Cap sur l'<em>extraordinaire</em>.",
      "hero.sub": "De Portofino à Porto Cervo — yachts sélectionnés et places privées, organisés avec une discrétion précise.",
      "hero.cta1": "Demander un Charter", "hero.cta2": "Réserver une Place",
      "hero.meta1.label": "Flotte Sélectionnée", "hero.meta2.label": "Places Gérées au Quotidien", "hero.meta3.label": "De Portofino à Monaco",
      "fleet.eyebrow": "La Flotte", "fleet.title": "Une collection, pas un catalogue.",
      "fleet.lede": "Chaque yacht est inspecté, armé et approvisionné selon un seul standard — le nôtre. La disponibilité varie selon la saison ; contactez-nous pour les départs actuels.",
      "fleet.cta": "Voir Toute la Flotte",
      "fleet.guests": "Invités", "fleet.cabins": "Cabines", "fleet.crew": "Équipage",
      "fleet.price": "Prix sur demande", "fleet.enquire": "Demander",
      "yacht.motor": "Yacht à Moteur", "yacht.sail": "Voilier",
      "marina.eyebrow": "Marina & Gestion des Places", "marina.title": "Votre place, au même niveau que votre yacht.",
      "marina.lede": "Disponibilité en temps réel sur nos quais gérés, avec des tarifs journaliers transparents selon la longueur hors tout. Contrats longue durée et priorité armateur sur demande.",
      "marina.legend.open": "Disponible", "marina.legend.hold": "En Option", "marina.legend.full": "Occupée",
      "marina.th.length": "Longueur H.T.",
      "marina.perDay": "/ jour", "marina.onRequest": "Sur Demande",
      "marina.size.small": "Petit · Jusqu'à 12m", "marina.size.medium": "Moyen · 12 – 18m", "marina.size.large": "Grand · Au-delà de 18m",
      "marina.panel.title": "Demander une Place", "marina.panel.lede": "Indiquez-nous la longueur de votre yacht, la fenêtre d'arrivée et la durée du séjour — notre équipe confirme sous un jour ouvré.",
      "marina.panel.cta": "Vérifier la Disponibilité",
      "about.eyebrow": "Notre Histoire", "about.title": "Fondée par des gens qui préféreraient être en mer.",
      "about.quote": "Nous avons créé MareFun parce que louer un yacht et l'amarrer étaient traités comme deux métiers distincts. Nous n'y croyons pas. La semaine d'un invité et l'année d'un armateur méritent la même discrétion, le même standard.",
      "about.founderRole": "Fondateur & Directeur Général",
      "about.body": "Vingt ans en mer nous ont appris que le luxe, ce n'est pas plus de tout — ce sont moins de décisions, mais meilleures, prises en votre nom avant même que vous ayez à les demander. Ce principe guide encore chaque charter et chaque place que nous gérons.",
      "about.stat1.label": "Suivi Personnalisé", "about.stat2.label": "Gestion Soignée des Places", "about.stat3.label": "Présence en Méditerranée",
      "testimonials.eyebrow": "Leurs Mots", "testimonials.title": "La confiance de toute la Méditerranée.",
      "testimonials.lede": "Un petit échantillon des retours laissés par nos invités et propriétaires de place après chaque saison.",
      "t1.quote": "Chaque détail était réglé avant même que nous y pensions. L'équipage, l'avitaillement, même le transfert de la place à Monaco — sans accroc.",
      "t2.quote": "Nous gardons notre yacht dans leur marina depuis trois saisons. La communication sur la disponibilité et les tarifs est la plus claire que nous ayons connue.",
      "t3.quote": "Sobres, professionnels et réellement compétents sur les bateaux eux-mêmes. Une combinaison rare dans ce secteur.",
      "contact.eyebrow": "Nous Contacter", "contact.title": "Commençons par une conversation.",
      "contact.lede": "Que vous louiez pour une semaine ou amarriez pour une saison, notre équipe répond personnellement — pas de centre d'appels, pas de formulaire perdu dans le vide.",
      "contact.phone.k": "Téléphone", "contact.email.k": "Email", "contact.location.k": "Marina de Base",
      "contact.location.v": "Porto Cervo, Sardaigne · Places supplémentaires à Monaco",
      "form.title": "Envoyer une Demande", "form.lede": "Les champs marqués d'un astérisque sont obligatoires.",
      "form.name": "Nom Complet *", "form.name.ph": "Alexandra Bennett",
      "form.method": "Contact Préféré *", "form.method.email": "Email", "form.method.phone": "Téléphone",
      "form.contact": "Votre Coordonnée *", "form.contact.ph.email": "vous@exemple.com", "form.contact.ph.phone": "+33 6 00 00 00 00",
      "form.message": "Message *", "form.message.ph": "Parlez-nous du charter ou de la place que vous envisagez…",
      "form.submit": "Envoyer la Demande",
      "form.err.required": "Ce champ est obligatoire.", "form.err.email": "Saisissez une adresse email valide.", "form.err.phone": "Saisissez un numéro de téléphone valide.",
      "form.success": "Merci — nous répondons généralement sous un jour ouvré.",
      "footer.blurb": "Location de yachts de luxe et gestion de places de marina en Méditerranée, avec une discrétion précise.",
      "footer.services": "Services", "footer.svc1": "Location de Yacht", "footer.svc2": "Gestion des Places", "footer.svc3": "Conciergerie & Avitaillement",
      "footer.company": "Société", "footer.link.fleet": "Flotte", "footer.link.marina": "Marina", "footer.link.about": "Histoire", "footer.link.contact": "Contact",
      "footer.legal": "Mentions Légales", "footer.privacy": "Politique de Confidentialité", "footer.terms": "Conditions Générales", "footer.cookies": "Politique de Cookies",
      "footer.rights": "Tous droits réservés.",
    },
  };

  const supported = Object.keys(dict);
  const stored = window.localStorage ? window.localStorage.getItem("marefun-lang") : null;
  const browserLang = (navigator.language || "en").slice(0, 2);
  let currentLang = supported.includes(stored) ? stored : supported.includes(browserLang) ? browserLang : "en";

  const applyLang = (lang) => {
    const strings = dict[lang] || dict.en;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (strings[key] !== undefined) el.textContent = strings[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (strings[key] !== undefined) el.innerHTML = strings[key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      if (strings[key] !== undefined) el.setAttribute("placeholder", strings[key]);
    });
    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.setAttribute("aria-current", String(btn.dataset.lang === lang));
    });
    currentLang = lang;
    if (window.localStorage) window.localStorage.setItem("marefun-lang", lang);
    syncContactPlaceholder();
  };

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  /* ---------------------------------------------------------------------
   * Contact form — preferred-method toggle + validation
   * ------------------------------------------------------------------- */
  const form = document.getElementById("enquiry-form");
  const contactField = document.getElementById("f-contact");
  const methodRadios = form ? form.querySelectorAll('input[name="method"]') : [];

  function syncContactPlaceholder() {
    if (!contactField) return;
    const method = form.querySelector('input[name="method"]:checked')?.value || "email";
    const key = method === "phone" ? "form.contact.ph.phone" : "form.contact.ph.email";
    contactField.setAttribute("placeholder", dict[currentLang][key]);
    contactField.setAttribute("type", method === "phone" ? "tel" : "email");
  }
  methodRadios.forEach((r) => r.addEventListener("change", syncContactPlaceholder));

  function setError(field, show) {
    const wrap = field.closest(".field");
    wrap.classList.toggle("has-error", show);
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe = /^[+\d][\d\s().-]{6,}$/;

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = dict[currentLang];
      let valid = true;

      const name = document.getElementById("f-name");
      if (!name.value.trim()) {
        setError(name, true);
        name.nextElementSibling.textContent = s["form.err.required"];
        valid = false;
      } else setError(name, false);

      const method = form.querySelector('input[name="method"]:checked')?.value || "email";
      const contactVal = contactField.value.trim();
      if (!contactVal) {
        setError(contactField, true);
        contactField.nextElementSibling.textContent = s["form.err.required"];
        valid = false;
      } else if (method === "email" && !emailRe.test(contactVal)) {
        setError(contactField, true);
        contactField.nextElementSibling.textContent = s["form.err.email"];
        valid = false;
      } else if (method === "phone" && !phoneRe.test(contactVal)) {
        setError(contactField, true);
        contactField.nextElementSibling.textContent = s["form.err.phone"];
        valid = false;
      } else setError(contactField, false);

      const message = document.getElementById("f-message");
      if (!message.value.trim()) {
        setError(message, true);
        message.nextElementSibling.textContent = s["form.err.required"];
        valid = false;
      } else setError(message, false);

      const note = document.getElementById("form-note");
      if (valid) {
        note.textContent = s["form.success"];
        note.classList.add("is-visible");
        form.reset();
        syncContactPlaceholder();
      } else {
        note.classList.remove("is-visible");
      }
    });
  }

  applyLang(currentLang);
})();
