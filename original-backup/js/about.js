document.addEventListener('DOMContentLoaded', () => {
    const progressionTrack = document.querySelector('.progression-track');

    if (!progressionTrack || !('IntersectionObserver' in window)) {
        progressionTrack?.classList.add('animate-track');
        return;
    }

    const trackObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        progressionTrack.classList.add('animate-track');
        observer.disconnect();
    }, { rootMargin: '0px 0px -20%', threshold: 0.1 });

    trackObserver.observe(progressionTrack);
});