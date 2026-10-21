function setupSectionNav() {
    const sections = Array.from(document.querySelectorAll('section'));
    if (!sections.length)
        return;

    const GAP = 10;
    let navTarget = null;
    let timer;
    addEventListener('scroll', () => {
        clearTimeout(timer);
        timer = setTimeout(() => (target = null), 150);
      },
      { passive: true }
      );

    document.addEventListener('keydown', (e) => {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable)
            return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)
            return;
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')
            return;
        
        const y = navTarget ?? scrollY;
        const tops = sections.map(s => s.getBoundingClientRect().top + scrollY);

        const nextSection = e.key === 'ArrowRight' ?
            tops.find(t => t > y + GAP) :
            [...tops].reverse().find(t => t < y - GAP);
        
        if (!nextSection)
            return;
        e.preventDefault();
        navTarget = nextSection;
        scrollTo({ top: nextSection, behavior: 'smooth' });
    });
}

addEventListener('DOMContentLoaded', (event) => {
    setupSectionNav();
});
