
import { WidgetRoot } from './widgetRoot';

export type { WidgetRoot };


// Entrypoint for SVG/widget context
function onDomReady(fn: () => void) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

onDomReady(() => {
    // Instantiate WidgetRoot and assign to global svidget
    const root = new WidgetRoot();
    (window as any).svidget = root;
});
