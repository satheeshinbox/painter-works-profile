/**
 * Chandiran Works - Johor Painter & Handyman Services
 * Application Logic, Multi-language Controller & Quote Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = localStorage.getItem('chandiran_lang') || 'en';
  let selectedService = 'painting';

  // Initialize Language
  setLanguage(currentLang);

  // Setup Language Switcher Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      if (lang && translations[lang]) {
        currentLang = lang;
        localStorage.setItem('chandiran_lang', lang);
        setLanguage(currentLang);
      }
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Quote Calculator Service Option Selection
  const serviceCards = document.querySelectorAll('.service-option-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedService = card.getAttribute('data-service');
      updateCalculatorOptions();
      calculateQuote();
    });
  });

  // Calculator Input Event Listeners
  const calcInputs = ['propType', 'serviceScope', 'paintQuality', 'tilingSqft', 'formName', 'formLocation', 'formDate', 'formNotes'];
  calcInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', calculateQuote);
      el.addEventListener('input', calculateQuote);
    }
  });

  // FAQ Accordion Toggles
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(f => f.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Gallery Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Send WhatsApp Quote Button
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');
  if (sendWhatsappBtn) {
    sendWhatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendQuoteViaWhatsApp();
    });
  }

  // Quick Service Quote Trigger Buttons from Service Cards
  document.querySelectorAll('.btn-quick-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const s = btn.getAttribute('data-service-target');
      if (s) {
        selectedService = s;
        const targetCard = document.querySelector(`.service-option-card[data-service="${s}"]`);
        if (targetCard) {
          serviceCards.forEach(c => c.classList.remove('active'));
          targetCard.classList.add('active');
        }
        updateCalculatorOptions();
        calculateQuote();
        document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /**
   * Set Application Language
   */
  function setLanguage(lang) {
    const dict = translations[lang];
    if (!dict) return;

    // Update active lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const keyPath = el.getAttribute('data-i18n').split('.');
      let val = dict;
      for (const k of keyPath) {
        val = val ? val[k] : null;
      }
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.innerHTML = val;
        }
      }
    });

    updateCalculatorOptions();
    calculateQuote();
  }

  /**
   * Dynamically Update Sub-options based on Selected Service
   */
  function updateCalculatorOptions() {
    const scopeSelect = document.getElementById('serviceScope');
    const scopeContainer = document.getElementById('scopeContainer');
    const qualityContainer = document.getElementById('qualityContainer');

    if (!scopeSelect) return;

    const dict = translations[currentLang].quote;
    scopeSelect.innerHTML = '';
    qualityContainer.style.display = 'none';

    let options = {};
    if (selectedService === 'painting') {
      options = dict.paintScopeOptions;
      qualityContainer.style.display = 'block';
    } else if (selectedService === 'plumbing') {
      options = dict.plumbingOptions;
    } else if (selectedService === 'electrical') {
      options = dict.electricalOptions;
    } else if (selectedService === 'renovation') {
      options = dict.renovationOptions;
    } else if (selectedService === 'handyman') {
      options = dict.handymanOptions;
    } else if (selectedService === 'tiling') {
      options = dict.tilingOptions;
    }

    for (const [key, text] of Object.entries(options)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = text;
      scopeSelect.appendChild(opt);
    }
  }

  /**
   * Calculate Real-time Price Estimate Range in MYR
   */
  function calculateQuote() {
    const scope = document.getElementById('serviceScope')?.value;
    const propType = document.getElementById('propType')?.value || 'landed';
    const quality = document.getElementById('paintQuality')?.value || 'standard';
    const resultEl = document.getElementById('estimatedPriceOutput');

    if (!resultEl) return;

    let minRM = 100;
    let maxRM = 250;

    // Service pricing logic
    if (selectedService === 'painting') {
      if (scope === 'singleRoom') { minRM = 350; maxRM = 600; }
      else if (scope === 'fullInterior') { minRM = 1400; maxRM = 2400; }
      else if (scope === 'exteriorOnly') { minRM = 1800; maxRM = 3200; }
      else if (scope === 'fullPackage') { minRM = 3200; maxRM = 5500; }

      if (quality === 'premium') {
        minRM = Math.round(minRM * 1.25);
        maxRM = Math.round(maxRM * 1.3);
      }
    } else if (selectedService === 'plumbing') {
      if (scope === 'leakFix') { minRM = 80; maxRM = 150; }
      else if (scope === 'fixtureInstall') { minRM = 120; maxRM = 280; }
      else if (scope === 'majorPlumbing') { minRM = 350; maxRM = 850; }
    } else if (selectedService === 'electrical') {
      if (scope === 'fewFittings') { minRM = 60; maxRM = 140; }
      else if (scope === 'mediumFittings') { minRM = 160; maxRM = 380; }
      else if (scope === 'dbWiring') { minRM = 350; maxRM = 900; }
    } else if (selectedService === 'renovation') {
      if (scope === 'partition') { minRM = 450; maxRM = 1100; }
      else if (scope === 'plasterCeiling') { minRM = 600; maxRM = 1500; }
      else if (scope === 'waterproofing') { minRM = 500; maxRM = 1200; }
    } else if (selectedService === 'handyman') {
      if (scope === 'drilling') { minRM = 50; maxRM = 120; }
      else if (scope === 'cupboardFix') { minRM = 80; maxRM = 180; }
      else if (scope === 'multiFix') { minRM = 150; maxRM = 350; }
    } else if (selectedService === 'tiling') {
      if (scope === 'small') { minRM = 250; maxRM = 600; }
      else if (scope === 'medium') { minRM = 800; maxRM = 1800; }
      else if (scope === 'large') { minRM = 2200; maxRM = 5000; }
    }

    // Property multiplier
    if (propType === 'office') {
      minRM = Math.round(minRM * 1.15);
      maxRM = Math.round(maxRM * 1.15);
    }

    resultEl.textContent = `RM ${minRM.toLocaleString()} - RM ${maxRM.toLocaleString()}`;
  }

  /**
   * Format & Send WhatsApp Message directly to +60179052183
   */
  function sendQuoteViaWhatsApp() {
    const name = document.getElementById('formName')?.value.trim() || 'Valued Customer';
    const location = document.getElementById('formLocation')?.value.trim() || 'Johor Bahru';
    const date = document.getElementById('formDate')?.value.trim() || 'As soon as possible';
    const notes = document.getElementById('formNotes')?.value.trim() || 'N/A';
    const estPrice = document.getElementById('estimatedPriceOutput')?.textContent || '';
    const scopeText = document.getElementById('serviceScope')?.options[document.getElementById('serviceScope')?.selectedIndex]?.text || '';

    const serviceTitleMap = {
      painting: 'House Painting Services',
      plumbing: 'Plumbing Services',
      electrical: 'Electrical Works',
      renovation: 'Small Renovation Works',
      handyman: 'Wall/Sink/Cupboard Fixes & Drilling',
      tiling: 'Tiling Works'
    };

    const message = `Hello Mr. Chandiran Manickam, I would like to book an appointment & confirm a quote for handyman/painting services in Johor:

*Service Required:* ${serviceTitleMap[selectedService] || selectedService}
*Details:* ${scopeText}
*Estimated Price Range:* ${estPrice}

*Customer Details:*
• Name: ${name}
• Location: ${location}
• Preferred Date/Urgency: ${date}
• Notes/Special Request: ${notes}

Requested via Website Quote Generator. Looking forward to your response!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/60179052183?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  }
});
