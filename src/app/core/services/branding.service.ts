import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { storageKey } from '../constants/storage-key';

@Injectable({
  providedIn: 'root',
})
export class BrandingService {
  private renderer: Renderer2;

  // Default branding values
  private readonly DEFAULT_LOGO_PATH = 'assets/images/logo.svg';
  private readonly DEFAULT_FAVICON_PATH = 'favicon.png';
  private readonly DEFAULT_PRIMARY_COLOR = '#36474f';
  private readonly DEFAULT_TEXT_COLOR = '#000000';
  private readonly DEFAULT_SHORT_NAME = 'GoChek';

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Apply organization branding (logo, favicon, primary color)
   * @param logoPath - Path to organization logo
   * @param faviconPath - Path to organization favicon
   * @param primaryColor - Primary color hex code
   */
  applyBranding(logoPath?: string, faviconPath?: string, primaryColor?: string, secondaryColor?: string, shortName?: string): void {
    // Update logo in localStorage
    if (logoPath) {
      localStorage.setItem(storageKey.logoPath, logoPath);
    }

    // Update favicon
    if (faviconPath) {
      this.updateFavicon(faviconPath);
      localStorage.setItem(storageKey.faviconPath, faviconPath);
    }

    // Update primary color
    if (primaryColor) {
      this.updatePrimaryColor(primaryColor);
      localStorage.setItem(storageKey.primaryColor, primaryColor);
    }

    // Update secondary color
    if (secondaryColor) {
      this.updateSecondaryColor(secondaryColor);
      localStorage.setItem(storageKey.secondaryColor, secondaryColor);
    }

    // Update short name
    if (shortName) {
      localStorage.setItem(storageKey.shortName, shortName);
    }
  }

  /**
   * Update favicon dynamically
   * @param faviconPath - Path to favicon
   */
  private updateFavicon(faviconPath: string): void {
    const faviconLink = document.getElementById('favicon') as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = faviconPath;
    } else {
      // Create favicon link if it doesn't exist
      const link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'id', 'favicon');
      this.renderer.setAttribute(link, 'rel', 'icon');
      this.renderer.setAttribute(link, 'href', faviconPath);
      const head = document.getElementsByTagName('head')[0];
      this.renderer.appendChild(head, link);
    }
  }

  /**
   * Update primary color CSS variable
   * @param primaryColor - Primary color hex code
   */
  private updatePrimaryColor(primaryColor: string): void {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }

  /**
   * Update secondary color CSS variable
   * @param secondaryColor - Secondary color hex code
   */
  private updateSecondaryColor(secondaryColor: string): void {
    document.documentElement.style.setProperty('--text-color', secondaryColor);
  }

  /**
   * Update web page title
   * @param shortName - Short name for page title
   */
  private updateShortName(shortName: string): void {
    document.title = shortName;
  }

  /**
   * Get logo path from localStorage
   */
  getLogoPath(): string | null {
    return localStorage.getItem(storageKey.logoPath);
  }

  /**
   * Get favicon path from localStorage
   */
  getFaviconPath(): string | null {
    return localStorage.getItem(storageKey.faviconPath);
  }

  /**
   * Get primary color from localStorage
   */
  getPrimaryColor(): string | null {
    return localStorage.getItem(storageKey.primaryColor);
  }

  /**
   * Get secondary color from localStorage
   */
  getSecondaryColor(): string | null {
    return localStorage.getItem(storageKey.secondaryColor);
  }

  /**
   * Get short name from localStorage
   */
  getShortName(): string | null {
    return localStorage.getItem(storageKey.shortName);
  }

  /**
   * Initialize branding from localStorage (call on app init)
   */
  initBrandingFromStorage(): void {
    const logoPath = this.getLogoPath();
    const faviconPath = this.getFaviconPath();
    const primaryColor = this.getPrimaryColor();
    const secondaryColor = this.getSecondaryColor();
    const shortName = this.getShortName();

    if (faviconPath) {
      this.updateFavicon(faviconPath);
    }

    if (primaryColor) {
      this.updatePrimaryColor(primaryColor);
    }

    if (secondaryColor) {
      this.updateSecondaryColor(secondaryColor);
    }

    if (shortName) {
      this.updateShortName(shortName);
    }
  }

  /**
   * Reset branding to default values (logo, favicon, colors)
   */
  resetBranding(): void {
    // Reset logo to default
    localStorage.setItem(storageKey.logoPath, this.DEFAULT_LOGO_PATH);

    // Reset favicon to default
    this.updateFavicon(this.DEFAULT_FAVICON_PATH);
    localStorage.setItem(storageKey.faviconPath, this.DEFAULT_FAVICON_PATH);

    // Reset primary color to default
    this.updatePrimaryColor(this.DEFAULT_PRIMARY_COLOR);
    localStorage.setItem(storageKey.primaryColor, this.DEFAULT_PRIMARY_COLOR);

    // Reset secondary color to default
    this.updateSecondaryColor(this.DEFAULT_TEXT_COLOR);
    localStorage.setItem(storageKey.secondaryColor, this.DEFAULT_TEXT_COLOR);

    // Reset short name to default
    this.updateShortName(this.DEFAULT_SHORT_NAME);
    localStorage.setItem(storageKey.shortName, this.DEFAULT_SHORT_NAME);
  }

  /**
   * Clear all branding settings
   */
  clearBranding(): void {
    localStorage.removeItem(storageKey.logoPath);
    localStorage.removeItem(storageKey.faviconPath);
    localStorage.removeItem(storageKey.primaryColor);
    localStorage.removeItem(storageKey.secondaryColor);
    localStorage.removeItem(storageKey.shortName);

    // Reset to defaults
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--text-color');
  }
}