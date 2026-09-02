(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const railButtons = Array.from(document.querySelectorAll('.rail [data-go]'));
  const goButtons = Array.from(document.querySelectorAll('[data-go]'));
  const previousButton = document.querySelector('[data-prev]');
  const nextButton = document.querySelector('[data-next]');
  const counter = document.querySelector('.counter');
  const progress = document.querySelector('.progress span');
  let activeIndex = 0;

  const clamp = (value) => Math.max(0, Math.min(slides.length - 1, value));

  const updateUI = (index) => {
    activeIndex = clamp(index);
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    railButtons.forEach((button, buttonIndex) => {
      const active = buttonIndex === activeIndex;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    progress.style.transform = `scaleX(${(activeIndex + 1) / slides.length})`;
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  };

  const goTo = (index, behavior = 'smooth') => {
    const targetIndex = clamp(index);
    slides[targetIndex].scrollIntoView({ behavior, block: 'start' });
    updateUI(targetIndex);
    history.replaceState(null, '', `#${slides[targetIndex].id}`);
  };

  goButtons.forEach((button) => {
    button.addEventListener('click', () => goTo(Number(button.dataset.go)));
  });

  previousButton.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton.addEventListener('click', () => goTo(activeIndex + 1));

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (isEditing) return;

    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)) {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    updateUI(Number(visible.target.dataset.index));
  }, { threshold: [.35, .55, .72] });

  slides.forEach((slide) => observer.observe(slide));

  const hashIndex = slides.findIndex((slide) => `#${slide.id}` === window.location.hash);
  updateUI(hashIndex >= 0 ? hashIndex : 0);
})();
