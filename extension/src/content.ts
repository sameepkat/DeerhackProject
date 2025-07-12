console.log('Content script loaded on:', window.location.href);

// Simple test function to verify content script is working
function testContentScript() {
  console.log('=== CONTENT SCRIPT TEST ===');
  console.log('URL:', window.location.href);
  console.log('Title:', document.title);
  console.log('Content script is working!');
  
  // Test if we can find any buttons
  const allButtons = document.querySelectorAll('button, [role="button"]');
  console.log('Total buttons found:', allButtons.length);
  
  // Show first 10 buttons
  allButtons.forEach((btn, index) => {
    if (index < 10) {
      console.log(`Button ${index + 1}:`, {
        text: btn.textContent?.trim().substring(0, 30),
        ariaLabel: btn.getAttribute('aria-label'),
        className: btn.className,
        dataTestId: btn.getAttribute('data-testid')
      });
    }
  });
  
  // Look specifically for Canva navigation
  const nextButtons = document.querySelectorAll('[aria-label*="next"], [aria-label*="Next"], [data-testid*="next"], [data-testid*="Next"]');
  const prevButtons = document.querySelectorAll('[aria-label*="prev"], [aria-label*="Prev"], [data-testid*="prev"], [data-testid*="Prev"]');
  
  console.log('Next-like buttons found:', nextButtons.length);
  console.log('Prev-like buttons found:', prevButtons.length);
  
  nextButtons.forEach((btn, index) => {
    console.log(`Next button ${index + 1}:`, {
      ariaLabel: btn.getAttribute('aria-label'),
      dataTestId: btn.getAttribute('data-testid'),
      className: btn.className,
      text: btn.textContent?.trim()
    });
  });
  
  prevButtons.forEach((btn, index) => {
    console.log(`Prev button ${index + 1}:`, {
      ariaLabel: btn.getAttribute('aria-label'),
      dataTestId: btn.getAttribute('data-testid'),
      className: btn.className,
      text: btn.textContent?.trim()
    });
  });
}

// Run test when content script loads
setTimeout(testContentScript, 2000);

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  try {
    if (request.action === 'getPageInfo') {
      const response = {
        title: document.title,
        url: window.location.href,
        html: document.documentElement.outerHTML.slice(0, 1000) // limit for performance
      };
      console.log('Sending page info:', response);
      sendResponse(response);
    }
    else if (request.action === 'nextSlide') {
      const result = tryNextSlide();
      console.log('Next slide result:', result);
      sendResponse({ success: result.success, method: result.method });
    }
    else if (request.action === 'prevSlide') {
      const result = tryPrevSlide();
      console.log('Previous slide result:', result);
      sendResponse({ success: result.success, method: result.method });
    }
    else {
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error in content script message handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ error: errorMessage });
  }
  
  return true; // Keep the message channel open for async response
});

function showDebugNotification(message: string) {
  let notif = document.createElement('div');
  notif.textContent = '[EXT] ' + message;
  notif.style.position = 'fixed';
  notif.style.bottom = '20px';
  notif.style.right = '20px';
  notif.style.background = 'rgba(0,0,0,0.8)';
  notif.style.color = 'white';
  notif.style.padding = '8px 16px';
  notif.style.borderRadius = '6px';
  notif.style.zIndex = '999999';
  notif.style.fontSize = '14px';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 1500);
}

function tryNextSlide(): { success: boolean; method: string } {
  console.log('Attempting to go to next slide...');
  showDebugNotification('Next Slide command received');

  // Canva: Use aria-label="Next page"
  let btn = document.querySelector('[aria-label="Next page"]');
  console.log('[EXT] Looking for [aria-label="Next page"]:', btn);
  if (btn) {
    console.log('[EXT] Found Next page button, attempting to click...');
    try {
      (btn as HTMLElement).click();
      console.log('[EXT] Clicked Canva next button (aria-label="Next page")');
      showDebugNotification('Clicked Canva next button (aria-label="Next page")');
      return { success: true, method: 'canva-aria-label' };
    } catch (error) {
      console.error('[EXT] Error clicking Next page button:', error);
      showDebugNotification('Error clicking Next page button');
    }
  }

  // Try alternative Canva selectors
  const alternativeSelectors = [
    '[data-testid="presentation-next-slide"]',
    '[data-testid="next-slide"]',
    '[data-testid="next"]',
    '.next-slide',
    '.next',
    'button[aria-label*="next"]',
    'button[aria-label*="forward"]',
    '[role="button"][aria-label*="next"]'
  ];

  for (const selector of alternativeSelectors) {
    btn = document.querySelector(selector);
    console.log(`[EXT] Trying selector "${selector}":`, btn);
    if (btn) {
      try {
        (btn as HTMLElement).click();
        console.log(`[EXT] Clicked button with selector "${selector}"`);
        showDebugNotification(`Clicked button with selector "${selector}"`);
        return { success: true, method: 'canva-alternative' };
      } catch (error) {
        console.error(`[EXT] Error clicking button with selector "${selector}":`, error);
      }
    }
  }

  // Try Canva navigation buttons by text content
  const allButtons = document.querySelectorAll('button, [role="button"], .button');
  console.log('[EXT] Found', allButtons.length, 'total buttons on page');
  
  for (const button of allButtons) {
    const text = button.textContent?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const title = button.getAttribute('title')?.toLowerCase() || '';
    
    if (text.includes('next') || ariaLabel.includes('next') || title.includes('next') ||
        text.includes('forward') || ariaLabel.includes('forward') || title.includes('forward') ||
        text.includes('>') || ariaLabel.includes('>') || title.includes('>')) {
      console.log('[EXT] Found next-like button:', { text, ariaLabel, title });
      try {
        (button as HTMLElement).click();
        console.log('[EXT] Clicked Canva next button (text match):', text || ariaLabel);
        showDebugNotification(`Clicked Canva next button (text match): ${text || ariaLabel}`);
        return { success: true, method: 'canva-text-match' };
      } catch (error) {
        console.error('[EXT] Error clicking text-matched button:', error);
      }
    }
  }

  // Fallback: ArrowRight
  try {
    window.focus();
    setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      console.log('[EXT] Dispatched ArrowRight key event');
      showDebugNotification('Dispatched ArrowRight key event');
    }, 100);
  } catch (e) {
    console.warn('Could not focus window:', e);
  }
  return { success: true, method: 'arrow-key' };
}

function tryPrevSlide(): { success: boolean; method: string } {
  console.log('Attempting to go to previous slide...');
  showDebugNotification('Previous Slide command received');

  // Canva: Use aria-label="Previous page"
  let btn = document.querySelector('[aria-label="Previous page"]');
  console.log('[EXT] Looking for [aria-label="Previous page"]:', btn);
  if (btn) {
    console.log('[EXT] Found Previous page button, attempting to click...');
    try {
      (btn as HTMLElement).click();
      console.log('[EXT] Clicked Canva prev button (aria-label="Previous page")');
      showDebugNotification('Clicked Canva prev button (aria-label="Previous page")');
      return { success: true, method: 'canva-aria-label' };
    } catch (error) {
      console.error('[EXT] Error clicking Previous page button:', error);
      showDebugNotification('Error clicking Previous page button');
    }
  }

  // Try alternative Canva selectors
  const alternativeSelectors = [
    '[data-testid="presentation-previous-slide"]',
    '[data-testid="previous-slide"]',
    '[data-testid="prev"]',
    '.prev-slide',
    '.prev',
    'button[aria-label*="previous"]',
    'button[aria-label*="back"]',
    '[role="button"][aria-label*="previous"]'
  ];

  for (const selector of alternativeSelectors) {
    btn = document.querySelector(selector);
    console.log(`[EXT] Trying selector "${selector}":`, btn);
    if (btn) {
      try {
        (btn as HTMLElement).click();
        console.log(`[EXT] Clicked button with selector "${selector}"`);
        showDebugNotification(`Clicked button with selector "${selector}"`);
        return { success: true, method: 'canva-alternative' };
      } catch (error) {
        console.error(`[EXT] Error clicking button with selector "${selector}":`, error);
      }
    }
  }

  // Try Canva navigation buttons by text content
  const allButtons = document.querySelectorAll('button, [role="button"], .button');
  console.log('[EXT] Found', allButtons.length, 'total buttons on page');
  
  for (const button of allButtons) {
    const text = button.textContent?.toLowerCase() || '';
    const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
    const title = button.getAttribute('title')?.toLowerCase() || '';
    
    if (text.includes('previous') || ariaLabel.includes('previous') || title.includes('previous') ||
        text.includes('back') || ariaLabel.includes('back') || title.includes('back') ||
        text.includes('<') || ariaLabel.includes('<') || title.includes('<')) {
      console.log('[EXT] Found previous-like button:', { text, ariaLabel, title });
      try {
        (button as HTMLElement).click();
        console.log('[EXT] Clicked Canva prev button (text match):', text || ariaLabel);
        showDebugNotification(`Clicked Canva prev button (text match): ${text || ariaLabel}`);
        return { success: true, method: 'canva-text-match' };
      } catch (error) {
        console.error('[EXT] Error clicking text-matched button:', error);
      }
    }
  }

  // Fallback: ArrowLeft
  try {
    window.focus();
    setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      console.log('[EXT] Dispatched ArrowLeft key event');
      showDebugNotification('Dispatched ArrowLeft key event');
    }, 100);
  } catch (e) {
    console.warn('Could not focus window:', e);
  }
  return { success: true, method: 'arrow-key' };
} 