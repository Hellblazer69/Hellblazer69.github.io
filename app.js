// ========================================
// Initialize on page load
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  initializeLastUpdated();
  initializeEmergencyMode();
  initializePrintButton();
  initializeQRCode();
  initializeVCardDownload();
});

// ========================================
// Last Updated Date
// ========================================
function initializeLastUpdated() {
  const lastUpdatedElement = document.getElementById('lastUpdated');
  if (lastUpdatedElement) {
    const today = new Date();
    const formattedDate = formatDate(today);
    lastUpdatedElement.textContent = formattedDate;
  }
}

function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

// ========================================
// Emergency Mode Toggle
// ========================================
function initializeEmergencyMode() {
  const emergencyBtn = document.getElementById('emergencyModeBtn');
  
  if (!emergencyBtn) return;
  
  // Check if emergency mode was previously enabled
  const isEmergencyMode = localStorage.getItem('emergencyMode') === 'true';
  if (isEmergencyMode) {
    document.body.classList.add('emergency-mode');
    updateEmergencyButtonText(true);
  }
  
  emergencyBtn.addEventListener('click', function() {
    const isActive = document.body.classList.toggle('emergency-mode');
    updateEmergencyButtonText(isActive);
    
    // Save preference
    localStorage.setItem('emergencyMode', isActive);
    
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(isActive ? [100, 50, 100] : 50);
    }
  });
}

function updateEmergencyButtonText(isActive) {
  const emergencyBtn = document.getElementById('emergencyModeBtn');
  if (emergencyBtn) {
    emergencyBtn.textContent = isActive ? '✓ Emergency Mode Active' : '🚨 Emergency Mode';
  }
}

// ========================================
// Print Functionality
// ========================================
function initializePrintButton() {
  const printBtn = document.getElementById('printBtn');
  
  if (!printBtn) return;
  
  printBtn.addEventListener('click', function() {
    // Temporarily disable emergency mode for printing
    const wasEmergencyMode = document.body.classList.contains('emergency-mode');
    
    if (wasEmergencyMode) {
      document.body.classList.remove('emergency-mode');
    }
    
    window.print();
    
    // Restore emergency mode after printing
    if (wasEmergencyMode) {
      document.body.classList.add('emergency-mode');
    }
  });
}

// ========================================
// QR Code Generation
// ========================================
function initializeQRCode() {
  const qrElement = document.getElementById('qrCode');
  
  if (!qrElement) return;
  
  // Get current page URL
  const currentURL = encodeURIComponent(window.location.href);
  
  // Use QR Server API to generate QR code
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentURL}&margin=10`;
  
  qrElement.src = qrURL;
  qrElement.alt = 'QR Code for this emergency contact page';
  
  // Add error handling
  qrElement.onerror = function() {
    console.warn('QR code failed to load');
    qrElement.style.display = 'none';
  };
}

// ========================================
// vCard Download Functionality
// ========================================
function initializeVCardDownload() {
  const downloadBtn = document.getElementById('downloadVcf');
  
  if (!downloadBtn) return;
  
  downloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    generateAndDownloadVCard();
  });
}

function generateAndDownloadVCard() {
  // Extract information from the page
  const name = getTextContent('.name') || 'Saba Kveselava';
  const phone = extractPhone('.contact-card a[href^="tel:"]');
  const email = extractEmail('.contact-card a[href^="mailto:"]');
  const address = getTextContent('.detail-value:last-child');
  const bloodType = extractBloodType();
  const dob = extractDOB();
  
  // Create vCard content
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:Kveselava;Saba;;;`,
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    email ? `EMAIL:${email}` : '',
    address ? `ADR;TYPE=HOME:;;${address};;;` : '',
    dob ? `BDAY:${dob}` : '',
    bloodType ? `NOTE:Blood Type: ${bloodType}\\nEmergency Contact Page: ${window.location.href}` : `NOTE:Emergency Contact Page: ${window.location.href}`,
    'END:VCARD'
  ].filter(line => line !== '').join('\r\n');
  
  // Create blob and download
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name.replace(/\s+/g, '_')}_Emergency_Contact.vcf`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  window.URL.revokeObjectURL(url);
  
  // Show feedback
  showNotification('vCard downloaded successfully!');
}

// ========================================
// Helper Functions
// ========================================
function getTextContent(selector) {
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : '';
}

function extractPhone(selector) {
  const phoneLink = document.querySelector(selector);
  if (phoneLink) {
    const href = phoneLink.getAttribute('href');
    return href.replace('tel:', '').trim();
  }
  return '';
}

function extractEmail(selector) {
  const emailLink = document.querySelector(selector);
  if (emailLink) {
    const href = emailLink.getAttribute('href');
    return href.replace('mailto:', '').trim();
  }
  return '';
}

function extractBloodType() {
  const profileMeta = getTextContent('.profile-meta');
  const match = profileMeta.match(/Blood Type:\s*([A-Z][+-]?)/i);
  return match ? match[1] : '';
}

function extractDOB() {
  const profileMeta = getTextContent('.profile-meta');
  const match = profileMeta.match(/DOB:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
  if (match) {
    // Convert "May 26, 1999" to "19990526" format for vCard
    const date = new Date(match[1]);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }
  }
  return '';
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ========================================
// Accessibility Enhancements
// ========================================

// Add keyboard navigation for important links
document.addEventListener('keydown', function(e) {
  // Press 'E' for emergency mode
  if (e.key === 'e' || e.key === 'E') {
    const emergencyBtn = document.getElementById('emergencyModeBtn');
    if (emergencyBtn && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      emergencyBtn.click();
    }
  }
  
  // Press 'P' for print
  if (e.key === 'p' || e.key === 'P') {
    if (e.ctrlKey || e.metaKey) {
      // Let default Ctrl+P/Cmd+P work
      return;
    }
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const printBtn = document.getElementById('printBtn');
      if (printBtn) {
        printBtn.click();
      }
    }
  }
});

// ========================================
// Service Worker Registration (Optional)
// ========================================

// Uncomment to enable offline functionality
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch(function(error) {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}
*/

// ========================================
// Export functions for testing (optional)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    extractBloodType,
    extractDOB,
    extractPhone,
    extractEmail
  };
}