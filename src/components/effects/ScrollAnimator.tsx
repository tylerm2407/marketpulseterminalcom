import { useEffect } from 'react';

export function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    function observeAll() {
      const elements = document.querySelectorAll('.scroll-animate:not(.visible), .scroll-animate-left:not(.visible)');
      elements.forEach((el) => observer.observe(el));
    }

    observeAll();

    // Re-scan when new elements are added to the DOM
    const mutation = new MutationObserver(() => observeAll());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
