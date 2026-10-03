export type SectionPosition = {
  id: string;
  top: number;
};

export function getSectionFromHref(href: string): string | null {
  if (!href.startsWith('#') || href.length === 1) {
    return null;
  }

  return decodeURIComponent(href.slice(1));
}

export function getActiveSectionId(sections: SectionPosition[], activationPosition: number): string | null {
  if (sections.length === 0) {
    return null;
  }

  let active = sections[0]?.id ?? null;

  for (const section of sections) {
    if (section.top > activationPosition) {
      break;
    }

    active = section.id;
  }

  return active;
}

function initializePortfolio(): void {
  const navLinks = Array.from<HTMLAnchorElement>(document.querySelectorAll('[data-nav-link]'));
  const sections = Array.from<HTMLElement>(document.querySelectorAll('[data-section]'));
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const floatingObjects = Array.from<HTMLElement>(document.querySelectorAll('[data-float]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const setActiveNavigation = (): void => {
    const positions = sections.map((section) => ({
      id: section.id,
      top: section.getBoundingClientRect().top + window.scrollY,
    }));
    const activeId = getActiveSectionId(positions, window.scrollY + window.innerHeight * 0.28);

    for (const link of navLinks) {
      link.toggleAttribute('aria-current', getSectionFromHref(link.getAttribute('href') ?? '') === activeId);
    }
  };

  let scrollFrame = 0;
  window.addEventListener(
    'scroll',
    () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(setActiveNavigation);
    },
    { passive: true },
  );

  if (hero && !reducedMotion.matches) {
    hero.addEventListener('pointermove', (event) => {
      const bounds = hero.getBoundingClientRect();
      const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
      const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

      floatingObjects.forEach((object, index) => {
        const strength = (index % 3) + 1;
        object.style.setProperty('--pointer-x', `${offsetX * strength * 8}px`);
        object.style.setProperty('--pointer-y', `${offsetY * strength * 8}px`);
      });
    });

    hero.addEventListener('pointerleave', () => {
      floatingObjects.forEach((object) => {
        object.style.removeProperty('--pointer-x');
        object.style.removeProperty('--pointer-y');
      });
    });
  }

  setActiveNavigation();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio, {
      once: true,
    });
  } else {
    initializePortfolio();
  }
}
