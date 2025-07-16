import Embed from '../blots/embed.js';
import Emitter from './emitter.js';
class Composition {
  isComposing = false;
  constructor(scroll, emitter, quill) {
    this.scroll = scroll;
    this.emitter = emitter;
    this.quill = quill;
    this.setupListeners();
  }
  setupListeners() {
    this.scroll.domNode.addEventListener('compositionstart', event => {
      this.quill.root.classList.remove('ql-blank');
      if (!this.isComposing) {
        this.handleCompositionStart(event);
      }
    });
    this.scroll.domNode.addEventListener('compositionend', event => {
      if (this.isComposing) {
        // Webkit makes DOM changes after compositionend, so we use microtask to
        // ensure the order.
        // https://bugs.webkit.org/show_bug.cgi?id=31902
        queueMicrotask(() => {
          this.handleCompositionEnd(event);
        });
      }
    });
    this.emitter.on(Emitter.events.SELECTION_CHANGE, (_range, _oldRange, _source) => {
      if (this.isComposing && !this.quill.hasFocus()) {
        this.handleCompositionEnd(new CompositionEvent('compositionend'));
      }
    });
  }
  handleCompositionStart(event) {
    this.quill.root.dispatchEvent(new Event('composition-start', {
      bubbles: true
    }));
    const blot = event.target instanceof Node ? this.scroll.find(event.target, true) : null;
    if (blot && !(blot instanceof Embed)) {
      this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_START, event);
      this.scroll.batchStart();
      this.emitter.emit(Emitter.events.COMPOSITION_START, event);
      this.isComposing = true;
    }
  }
  handleCompositionEnd(event) {
    this.quill.root.dispatchEvent(new Event('composition-end', {
      bubbles: true
    }));
    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
  }
  get composing() {
    return this.isComposing;
  }
}
export default Composition;
//# sourceMappingURL=composition.js.map