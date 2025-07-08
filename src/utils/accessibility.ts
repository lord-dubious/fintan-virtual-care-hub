// Accessibility utilities for WCAG 2.1 AA compliance

// Color contrast utilities
export const colorContrast = {
  // Check if color contrast meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
  meetsWCAGAA: (foreground: string, background: string, isLargeText = false): boolean => {
    const ratio = getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },

  // Check if color contrast meets WCAG AAA standards (7:1 for normal text, 4.5:1 for large text)
  meetsWCAGAAA: (foreground: string, background: string, isLargeText = false): boolean => {
    const ratio = getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  },
};

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Get relative luminance of a color
function getLuminance(color: string): number {
  // This is a simplified version - in production you'd use a proper color parsing library
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// ARIA utilities
export const aria = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Create ARIA label for screen readers
  createLabel: (text: string, context?: string): string => {
    return context ? `${text}, ${context}` : text;
  },

  // Create ARIA description
  createDescription: (description: string, additionalInfo?: string): string => {
    return additionalInfo ? `${description}. ${additionalInfo}` : description;
  },
};

// Focus management utilities
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },

  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector));
  },
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation in lists
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  // Handle escape key
  handleEscape: (callback: () => void) => {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback();
      }
    };
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Create visually hidden text for screen readers
  createSROnlyText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },
};

// Responsive design utilities
export const responsive = {
  // Get current breakpoint
  getCurrentBreakpoint: (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },

  // Check if device is touch-enabled
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get safe area insets for mobile devices
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('--safe-area-inset-top') || '0px',
      right: style.getPropertyValue('--safe-area-inset-right') || '0px',
      bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
      left: style.getPropertyValue('--safe-area-inset-left') || '0px',
    };
  },
};

// Form accessibility utilities
export const formAccessibility = {
  // Associate label with form control
  associateLabel: (labelId: string, controlId: string) => {
    const label = document.getElementById(labelId);
    const control = document.getElementById(controlId);
    
    if (label && control) {
      label.setAttribute('for', controlId);
      control.setAttribute('aria-labelledby', labelId);
    }
  },

  // Add error message to form control
  addErrorMessage: (controlId: string, errorId: string, errorMessage: string) => {
    const control = document.getElementById(controlId);
    const errorElement = document.getElementById(errorId);
    
    if (control && errorElement) {
      control.setAttribute('aria-describedby', errorId);
      control.setAttribute('aria-invalid', 'true');
      errorElement.textContent = errorMessage;
      errorElement.setAttribute('role', 'alert');
    }
  },

  // Remove error message from form control
  removeErrorMessage: (controlId: string, errorId: string) => {
    const control = document.getElementById(controlId);
    const errorElement = document.getElementById(errorId);
    
    if (control && errorElement) {
      control.removeAttribute('aria-describedby');
      control.setAttribute('aria-invalid', 'false');
      errorElement.textContent = '';
      errorElement.removeAttribute('role');
    }
  },
};

// Motion and animation utilities
export const motionAccessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply animation only if user doesn't prefer reduced motion
  conditionalAnimation: (element: HTMLElement, animationClass: string) => {
    if (!motionAccessibility.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },
};

// High contrast mode detection
export const highContrast = {
  // Check if high contrast mode is enabled
  isHighContrastMode: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Apply high contrast styles
  applyHighContrastStyles: (element: HTMLElement) => {
    if (highContrast.isHighContrastMode()) {
      element.classList.add('high-contrast');
    }
  },
};
