// Main JavaScript

// Configurable Business Constants
const WHATSAPP_NUMBER = '917676445237'; // Direct business number (with country code 91 for India)

// Packaged Water Product Catalog
const PRODUCTS_CATALOG = {
  '500ml': { name: '500ml Elegant', packSize: 24, unit: 'case', sizeLabel: '500ml' },
  '1-ltr': { name: '1 Litre Royal', packSize: 12, unit: 'case', sizeLabel: '1 Ltr' },
  '2-ltr': { name: '2 Litre Grande', packSize: 6, unit: 'case', sizeLabel: '2 Ltr' },
  '5-ltr': { name: '5 Litre Majestic', packSize: 2, unit: 'case', sizeLabel: '5 Ltr' }
};

let rowCounter = 0;

// Dom Initializations on Load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer for fade-in animations
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(element => {
    observer.observe(element);
  });

  // 2. Date Picker Limiter (Lock out past dates)
  const dateInput = document.getElementById('bulk-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // 3. Dynamic Product Rows Setup
  const container = document.getElementById('product-rows-container');
  if (container) {
    // Add default initial row on load
    addRow();

    // Add Product button listener
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
      addBtn.addEventListener('click', addRow);
    }

    // Submit checkout via WhatsApp
    const submitBtn = document.getElementById('whatsapp-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', submitOrder);
    }
  }

  // 4. Interactive Collapsible Reveal Logic for Bulk Order
  const orderTriggers = document.querySelectorAll('.order-trigger');
  const bulkSection = document.getElementById('bulk-order');

  orderTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (bulkSection) {
        // Reveal Section
        bulkSection.classList.add('active');
        
        // Smooth scroll
        bulkSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Check if product cart trigger
      const productKey = trigger.getAttribute('data-product-key');
      if (productKey && PRODUCTS_CATALOG[productKey]) {
        const container = document.getElementById('product-rows-container');
        if (container) {
          // Clear all existing dynamic rows
          container.innerHTML = '';
          rowCounter = 0;
          
          // Add a single custom row pre-selected to this product
          addRow();
          const firstSelect = container.querySelector('.product-select');
          if (firstSelect) {
            firstSelect.value = productKey;
            calculateTotals();
          }
        }
      }
    });
  });

  // 5. About Us / Owner Profile Modal Toggle Controller
  const aboutModal = document.getElementById('about-modal');
  const aboutLinks = document.querySelectorAll('.about-us-link');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = aboutModal ? aboutModal.querySelector('.about-modal-backdrop') : null;

  function openAboutModal(e) {
    if (e) e.preventDefault();
    if (aboutModal) {
      aboutModal.classList.add('modal-active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
  }

  function closeAboutModal() {
    if (aboutModal) {
      aboutModal.classList.remove('modal-active');
      document.body.style.overflow = ''; // Restore background scrolling
    }
  }

  aboutLinks.forEach(link => {
    link.addEventListener('click', openAboutModal);
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeAboutModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeAboutModal);
  }

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal && aboutModal.classList.contains('modal-active')) {
      closeAboutModal();
    }
  });
});

// Dynamic HTML Constructor for Rows
function createProductRow(id) {
  const row = document.createElement('div');
  row.className = 'product-row';
  row.id = `product-row-${id}`;
  
  // Build product dropdown choices
  let selectOptions = '';
  for (const [key, value] of Object.entries(PRODUCTS_CATALOG)) {
    selectOptions += `<option value="${key}">${value.name}</option>`;
  }
  
  row.innerHTML = `
    <div class="form-group" style="margin-bottom: 0;">
      <label style="font-size: 0.7rem; color: rgba(255,255,255,0.6);">Product Size</label>
      <div class="input-wrapper">
        <span class="input-icon"><svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #e5c158; vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg></span>
        <select class="product-select" data-row-id="${id}">
          ${selectOptions}
        </select>
      </div>
      <div class="pack-info-badge active" id="pack-badge-${id}">
        <svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 12 21 6.92 21 17.08 12 22.08"/><polygon points="12 2 21 6.92 12 12 3 6.92 12 2"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> 12 Bottles per Case
      </div>
    </div>

    <div class="form-group" style="margin-bottom: 0;">
      <label style="font-size: 0.7rem; color: rgba(255,255,255,0.6);" id="qty-label-${id}">Quantity (Cases)</label>
      <div class="qty-input-wrapper">
        <div class="input-wrapper" style="width: 100%;">
          <span class="input-icon"><svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #e5c158; vertical-align: middle;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 12 21 6.92 21 17.08 12 22.08"/><polygon points="12 2 21 6.92 12 12 3 6.92 12 2"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
          <input type="number" class="product-qty" data-row-id="${id}" min="1" value="1" required style="width: 100%;">
        </div>
      </div>
    </div>

    <div class="row-subtotal-container">
      <span class="row-subtotal-label">Subtotal</span>
      <span class="row-subtotal" id="row-subtotal-${id}">12 Bottles</span>
    </div>

    <div class="row-action-container">
      <span class="row-subtotal-label" style="display:block; opacity:0; height:13px;">.</span>
      <button type="button" class="btn-remove-row" data-row-id="${id}" aria-label="Remove Product"><svg class="svg-icon svg-trash" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ff5252;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
    </div>
  `;
  
  return row;
}

// Add Row Handler
function addRow() {
  rowCounter++;
  const container = document.getElementById('product-rows-container');
  if (container) {
    const newRow = createProductRow(rowCounter);
    container.appendChild(newRow);
    
    // Wire up events for interactive fields inside new row
    const select = newRow.querySelector('.product-select');
    const qty = newRow.querySelector('.product-qty');
    const removeBtn = newRow.querySelector('.btn-remove-row');
    
    select.addEventListener('change', () => {
      calculateTotals();
    });
    
    qty.addEventListener('input', () => {
      if (qty.value < 1 && qty.value !== '') qty.value = 1;
      calculateTotals();
    });

    qty.addEventListener('change', () => {
      if (qty.value < 1 || qty.value === '') qty.value = 1;
      calculateTotals();
    });
    
    removeBtn.addEventListener('click', () => {
      newRow.remove();
      calculateTotals();
    });
    
    calculateTotals();
  }
}

// Multi-Product Re-Calculations
function calculateTotals() {
  const rows = document.querySelectorAll('.product-row');
  let totalUnique = rows.length;
  let totalCases = 0;
  let totalBottles = 0;
  
  rows.forEach(row => {
    const select = row.querySelector('.product-select');
    const qtyInput = row.querySelector('.product-qty');
    const rowId = select.dataset.rowId;
    
    const productKey = select.value;
    const qty = parseInt(qtyInput.value) || 0;
    const product = PRODUCTS_CATALOG[productKey];
    
    let subtotalBottles = 0;
    
    if (product.unit === 'case') {
      totalCases += qty;
      subtotalBottles = qty * product.packSize;
    } else {
      subtotalBottles = qty;
    }
    totalBottles += subtotalBottles;
    
    // Update subtotal display for this specific row
    const subtotalEl = document.getElementById(`row-subtotal-${rowId}`);
    if (subtotalEl) {
      subtotalEl.textContent = `${subtotalBottles} ${subtotalBottles === 1 ? 'Bottle' : 'Bottles'}`;
    }
    
    // Update label & badge formatting dynamically
    const packBadge = document.getElementById(`pack-badge-${rowId}`);
    const qtyLabel = document.getElementById(`qty-label-${rowId}`);
    const inputIcon = row.querySelector('.qty-input-wrapper .input-icon');
    
    if (packBadge && qtyLabel) {
      if (product.unit === 'case') {
        packBadge.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 12 21 6.92 21 17.08 12 22.08"/><polygon points="12 2 21 6.92 12 12 3 6.92 12 2"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> ${product.packSize} Bottles per Case`;
        qtyLabel.textContent = 'Quantity (Cases)';
        if (inputIcon) {
          inputIcon.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #e5c158; vertical-align: middle;"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08"/><polygon points="12 12 21 6.92 21 17.08 12 22.08"/><polygon points="12 2 21 6.92 12 12 3 6.92 12 2"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
        }
      } else {
        packBadge.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> Sold Individually (No Cases)`;
        qtyLabel.textContent = 'Quantity (Bottles)';
        if (inputIcon) {
          inputIcon.innerHTML = `<svg class="svg-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #e5c158; vertical-align: middle;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
        }
      }
    }
  });
  
  // Update Live Summary Box
  const summaryItems = document.getElementById('summary-total-items');
  const summaryCases = document.getElementById('summary-total-cases');
  const summaryBottles = document.getElementById('summary-total-bottles');
  
  if (summaryItems && summaryCases && summaryBottles) {
    summaryItems.textContent = totalUnique;
    summaryCases.textContent = `${totalCases} ${totalCases === 1 ? 'Case' : 'Cases'}`;
    summaryBottles.textContent = `${totalBottles} ${totalBottles === 1 ? 'Bottle' : 'Bottles'}`;
  }
  
  // Disable remove button if only 1 row exists
  const deleteBtns = document.querySelectorAll('.btn-remove-row');
  deleteBtns.forEach(btn => {
    btn.disabled = (rows.length <= 1);
  });
}

// Compile order data and direct to WhatsApp
function submitOrder() {
  const nameInput = document.getElementById('bulk-name');
  const addressInput = document.getElementById('bulk-address');
  const dateInput = document.getElementById('bulk-date');

  const name = nameInput.value.trim();
  const address = addressInput.value.trim();
  const date = dateInput.value;
  
  // Form Validations
  if (!name) {
    alert('Please enter your full name.');
    nameInput.focus();
    return;
  }
  if (!address) {
    alert('Please enter your delivery address.');
    addressInput.focus();
    return;
  }
  if (!date) {
    alert('Please select the date needed.');
    dateInput.focus();
    return;
  }
  
  // Fetch products and quantities
  const rows = document.querySelectorAll('.product-row');
  const items = [];
  let totalBottles = 0;
  let totalCases = 0;
  
  rows.forEach(row => {
    const select = row.querySelector('.product-select');
    const qtyInput = row.querySelector('.product-qty');
    
    const qty = parseInt(qtyInput.value) || 0;
    const productKey = select.value;
    const product = PRODUCTS_CATALOG[productKey];
    
    if (qty > 0) {
      let subtotalBottles = 0;
      if (product.unit === 'case') {
        subtotalBottles = qty * product.packSize;
        totalCases += qty;
        items.push({
          name: product.name,
          qty: qty,
          unit: 'Cases',
          bottles: subtotalBottles
        });
      } else {
        subtotalBottles = qty;
        items.push({
          name: product.name,
          qty: qty,
          unit: 'Bottles',
          bottles: subtotalBottles
        });
      }
      totalBottles += subtotalBottles;
    }
  });
  
  if (items.length === 0 || totalBottles === 0) {
    alert('Please ensure you have ordered at least one item with a valid quantity.');
    return;
  }
  
  // Date Formatter
  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build Premium Formatted Text Inquiry
  let msg = `👑 *ROYAL AURA - BULK ORDER INQUIRY* 👑\n\n`;
  msg += `👤 *Client Name:* ${name}\n`;
  msg += `📍 *Delivery Address:* ${address}\n`;
  msg += `📅 *Date Needed:* ${formattedDate}\n\n`;
  msg += `📦 *PRODUCTS IN ORDER:* \n`;
  
  items.forEach((item, index) => {
    msg += `   ${index + 1}. *${item.name}* : ${item.qty} ${item.unit} _(${item.bottles} bottles)_\n`;
  });
  
  msg += `\n📊 *ORDER INQUIRY SUMMARY:* \n`;
  if (totalCases > 0) {
    msg += `• Total Cases: *${totalCases} Cases*\n`;
  }
  msg += `• Total Bottles: *${totalBottles} Bottles*\n\n`;
  msg += `✨ _Thank you for choosing Royal Aura Premium Hydration._`;
  
  // Encode URL and trigger navigation to WhatsApp api
  const encodedMsg = encodeURIComponent(msg);
  const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMsg}`;
  
  window.open(waUrl, '_blank');
}

