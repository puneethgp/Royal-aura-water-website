// Main JavaScript

// Configurable Business Constants
const WHATSAPP_NUMBER = '919876543210'; // Replace with client business number (with country code e.g. 91 for India)

// Packaged Water Product Catalog
const PRODUCTS_CATALOG = {
  '1-ltr': { name: '1 Litre Royal', packSize: 30, unit: 'case', sizeLabel: '1 Ltr' },
  '2-ltr': { name: '2 Litre Premium', packSize: 15, unit: 'case', sizeLabel: '2 Ltr' },
  '5-ltr': { name: '5 Litre Elite', packSize: 10, unit: 'case', sizeLabel: '5 Ltr' },
  '20-ltr': { name: '20-Litre Jar', packSize: 1, unit: 'bottle', sizeLabel: '20 Ltr' },
  '250ml': { name: '250ml Petite', packSize: 48, unit: 'case', sizeLabel: '250ml' },
  '500ml': { name: '500ml Classic', packSize: 24, unit: 'case', sizeLabel: '500ml' }
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
        <span class="input-icon">💧</span>
        <select class="product-select" data-row-id="${id}">
          ${selectOptions}
        </select>
      </div>
      <div class="pack-info-badge active" id="pack-badge-${id}">
        📦 30 Bottles per Case
      </div>
    </div>

    <div class="form-group" style="margin-bottom: 0;">
      <label style="font-size: 0.7rem; color: rgba(255,255,255,0.6);" id="qty-label-${id}">Quantity (Cases)</label>
      <div class="qty-input-wrapper">
        <div class="input-wrapper" style="width: 100%;">
          <span class="input-icon">📦</span>
          <input type="number" class="product-qty" data-row-id="${id}" min="1" value="1" required>
        </div>
        <span class="qty-unit-badge" id="qty-unit-${id}">Cases</span>
      </div>
    </div>

    <div class="row-subtotal-container">
      <span class="row-subtotal-label">Subtotal</span>
      <span class="row-subtotal" id="row-subtotal-${id}">30 Bottles</span>
    </div>

    <div class="row-action-container">
      <span class="row-subtotal-label" style="display:block; opacity:0; height:13px;">.</span>
      <button type="button" class="btn-remove-row" data-row-id="${id}">🗑️</button>
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
    const qtyUnit = document.getElementById(`qty-unit-${rowId}`);
    const inputIcon = row.querySelector('.qty-input-wrapper .input-icon');
    
    if (packBadge && qtyLabel && qtyUnit) {
      if (product.unit === 'case') {
        packBadge.innerHTML = `📦 ${product.packSize} Bottles per Case`;
        qtyLabel.textContent = 'Quantity (Cases)';
        qtyUnit.textContent = 'Cases';
        if (inputIcon) inputIcon.textContent = '📦';
      } else {
        packBadge.innerHTML = `💧 Sold Individually (No Cases)`;
        qtyLabel.textContent = 'Quantity (Bottles)';
        qtyUnit.textContent = 'Bottles';
        if (inputIcon) inputIcon.textContent = '💧';
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

