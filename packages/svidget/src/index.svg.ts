
import { WidgetRoot } from './widgetRoot';

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
    const root = WidgetRoot.getCurrent();
    (window as any).svidget = root;
});
