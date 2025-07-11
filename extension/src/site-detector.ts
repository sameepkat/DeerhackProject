import { SupportedSite, SiteControls, SiteInfo } from './types';

export class SiteDetector {
  public currentSite: SupportedSite;
  public controls: SiteControls;

  constructor() {
    this.currentSite = this.detectCurrentSite();
    this.controls = this.getSiteControls();
  }

  detectCurrentSite(): SupportedSite {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    if (hostname.includes('docs.google.com') && url.includes('/presentation/')) {
      return 'google_slides';
    }
    if (hostname.includes('canva.com')) {
      return 'canva';
    }
    if (hostname.includes('prezi.com')) {
      return 'prezi';
    }
    if (hostname.includes('slides.com')) {
      return 'slides';
    }
    if (hostname.includes('beautiful.ai')) {
      return 'beautiful_ai';
    }
    if (hostname.includes('powerpoint.office.com') || hostname.includes('office.com')) {
      return 'powerpoint_online';
    }
    if (hostname.includes('slideshare.net')) {
      return 'slideshare';
    }
    
    return 'unknown';
  }

  getSiteControls(): SiteControls {
    const controls: Record<SupportedSite, SiteControls> = {
      google_slides: {
        nextSelectors: [
          '[data-tooltip="Next slide"]',
          '[aria-label="Next slide"]',
          '.goog-inline-block.goog-flat-menu-button-caption',
          '[data-mdc-dialog-action="next"]',
          'button[aria-label*="Next"]',
          '.punch-viewer-nav-next'
        ],
        prevSelectors: [
          '[data-tooltip="Previous slide"]',
          '[aria-label="Previous slide"]',
          '[data-mdc-dialog-action="previous"]',
          'button[aria-label*="Previous"]',
          '.punch-viewer-nav-prev'
        ],
        startSelectors: [
          '[data-tooltip="Present"]',
          '[aria-label="Present"]',
          '.goog-inline-block[aria-label*="Present"]',
          'button[aria-label*="Present"]',
          '.punch-present-button'
        ],
        exitSelectors: [
          '[data-tooltip="Exit presentation"]',
          '[aria-label="Exit presentation"]',
          '.punch-exit-presentation'
        ]
      },
      
      canva: {
        nextSelectors: [
          '[data-testid="presentation-next-slide"]',
          '[aria-label="Next slide"]',
          '.presentation-controls button:last-child',
          'button[aria-label*="Next"]',
          '.presentation-nav-next'
        ],
        prevSelectors: [
          '[data-testid="presentation-previous-slide"]',
          '[aria-label="Previous slide"]',
          '.presentation-controls button:first-child',
          'button[aria-label*="Previous"]',
          '.presentation-nav-prev'
        ],
        startSelectors: [
          '[data-testid="presentation-play"]',
          '[aria-label="Start presentation"]',
          '.presentation-play-button',
          'button[aria-label*="Present"]'
        ],
        exitSelectors: [
          '[data-testid="presentation-exit"]',
          '[aria-label="Exit presentation"]',
          '.presentation-exit-button'
        ]
      },
      
      prezi: {
        nextSelectors: [
          '.prezi-player-next',
          '[data-action="next"]',
          '.navigation-next',
          'button[aria-label*="Next"]'
        ],
        prevSelectors: [
          '.prezi-player-prev',
          '[data-action="previous"]',
          '.navigation-prev',
          'button[aria-label*="Previous"]'
        ],
        startSelectors: [
          '.prezi-player-play',
          '[data-action="play"]',
          'button[aria-label*="Play"]'
        ],
        exitSelectors: [
          '.prezi-player-exit',
          '[data-action="exit"]',
          'button[aria-label*="Exit"]'
        ]
      },
      
      slides: {
        nextSelectors: [
          '.slide-nav-next',
          '[data-action="next"]',
          'button[aria-label*="Next"]'
        ],
        prevSelectors: [
          '.slide-nav-prev',
          '[data-action="previous"]',
          'button[aria-label*="Previous"]'
        ],
        startSelectors: [
          '.slide-present',
          '[data-action="present"]',
          'button[aria-label*="Present"]'
        ],
        exitSelectors: [
          '.slide-exit',
          '[data-action="exit"]',
          'button[aria-label*="Exit"]'
        ]
      },
      
      beautiful_ai: {
        nextSelectors: [
          '.presentation-next',
          '[data-action="next"]',
          'button[aria-label*="Next"]'
        ],
        prevSelectors: [
          '.presentation-prev',
          '[data-action="previous"]',
          'button[aria-label*="Previous"]'
        ],
        startSelectors: [
          '.presentation-start',
          '[data-action="present"]',
          'button[aria-label*="Present"]'
        ],
        exitSelectors: [
          '.presentation-exit',
          '[data-action="exit"]',
          'button[aria-label*="Exit"]'
        ]
      },
      
      powerpoint_online: {
        nextSelectors: [
          '[aria-label="Next slide"]',
          '.slide-nav-next',
          'button[aria-label*="Next"]'
        ],
        prevSelectors: [
          '[aria-label="Previous slide"]',
          '.slide-nav-prev',
          'button[aria-label*="Previous"]'
        ],
        startSelectors: [
          '[aria-label="Start presentation"]',
          '.presentation-start',
          'button[aria-label*="Present"]'
        ],
        exitSelectors: [
          '[aria-label="Exit presentation"]',
          '.presentation-exit',
          'button[aria-label*="Exit"]'
        ]
      },
      
      slideshare: {
        nextSelectors: [
          '.slide-nav-next',
          '[data-action="next"]',
          'button[aria-label*="Next"]'
        ],
        prevSelectors: [
          '.slide-nav-prev',
          '[data-action="previous"]',
          'button[aria-label*="Previous"]'
        ],
        startSelectors: [
          '.slide-present',
          '[data-action="present"]',
          'button[aria-label*="Present"]'
        ],
        exitSelectors: [
          '.slide-exit',
          '[data-action="exit"]',
          'button[aria-label*="Exit"]'
        ]
      },
      
      unknown: {
        nextSelectors: [],
        prevSelectors: [],
        startSelectors: [],
        exitSelectors: []
      }
    };
    
    return controls[this.currentSite] || controls.unknown;
  }

  findElement(selectors: string[]): Element | null {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    return null;
  }

  clickElement(selectors: string[]): boolean {
    const element = this.findElement(selectors);
    if (element) {
      (element as HTMLElement).click();
      return true;
    }
    return false;
  }

  simulateKeyboardEvent(key: string, type: 'keydown' | 'keyup' = 'keydown'): void {
    const event = new KeyboardEvent(type, {
      key,
      code: `Key${key.toUpperCase()}`,
      keyCode: this.getKeyCode(key),
      which: this.getKeyCode(key),
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    document.dispatchEvent(event);
  }

  getKeyCode(key: string): number {
    const keyMap: Record<string, number> = {
      ArrowRight: 39,
      ArrowLeft: 37,
      ArrowUp: 38,
      ArrowDown: 40,
      Enter: 13,
      Escape: 27,
      F5: 116,
      ' ': 32, // Space
      PageDown: 34,
      PageUp: 33
    };
    return keyMap[key] || key.charCodeAt(0);
  }

  // Site-specific control methods
  nextSlide(): boolean {
    if (this.clickElement(this.controls.nextSelectors)) {
      return true;
    }
    
    // Fallback to keyboard simulation
    this.simulateKeyboardEvent('ArrowRight');
    return true;
  }

  previousSlide(): boolean {
    if (this.clickElement(this.controls.prevSelectors)) {
      return true;
    }
    
    // Fallback to keyboard simulation
    this.simulateKeyboardEvent('ArrowLeft');
    return true;
  }

  startPresentation(): boolean {
    if (this.clickElement(this.controls.startSelectors)) {
      return true;
    }
    
    // Fallback to keyboard simulation
    this.simulateKeyboardEvent('F5');
    return true;
  }

  exitPresentation(): boolean {
    if (this.clickElement(this.controls.exitSelectors)) {
      return true;
    }
    
    // Fallback to keyboard simulation
    this.simulateKeyboardEvent('Escape');
    return true;
  }

  // Get site information
  getSiteInfo(): SiteInfo {
    return {
      site: this.currentSite,
      url: window.location.href,
      title: document.title,
      controls: Object.keys(this.controls)
    };
  }

  // Check if we're in presentation mode
  isInPresentationMode(): boolean {
    const url = window.location.href;
    
    switch (this.currentSite) {
      case 'google_slides':
        return url.includes('/present/') || url.includes('/embed/');
      case 'canva':
        return url.includes('/present/') || !!document.querySelector('.presentation-mode');
      case 'prezi':
        return url.includes('/present/') || !!document.querySelector('.prezi-presentation');
      default:
        return false;
    }
  }

  // Refresh site detection (useful for dynamic sites)
  refresh(): void {
    this.currentSite = this.detectCurrentSite();
    this.controls = this.getSiteControls();
  }
} 