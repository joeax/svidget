
import { PageRoot } from './pageRoot';

export type { PageRoot };


// Entrypoint for SVG/widget context
function onDomReady(fn: () => void) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

onDomReady(() => {
    // Instantiate PageRoot and assign to global svidget
    const root = new PageRoot();
    (window as any).svidget = root;
});
