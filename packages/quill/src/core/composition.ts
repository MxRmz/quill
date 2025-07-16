import Embed from '../blots/embed.js';
import type Scroll from '../blots/scroll.js';
import Emitter from './emitter.js';
import type Quill from '../core/quill.js';

class Composition {
  isComposing = false;
  private quill: Quill;

  constructor(
    private scroll: Scroll,
    private emitter: Emitter,
    quill: Quill
  ) {
    this.quill = quill;
    this.setupListeners();
  }

  private setupListeners() {
    this.scroll.domNode.addEventListener('compositionstart', (event) => {
      this.quill.root.classList.remove('ql-blank');

      if (!this.isComposing) {
        this.handleCompositionStart(event);
      }
    });

    this.scroll.domNode.addEventListener('compositionend', (event) => {
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

  private handleCompositionStart(event: CompositionEvent) {
    this.quill.root.dispatchEvent(new Event('composition-start', { bubbles: true }));

    const blot = event.target instanceof Node
      ? this.scroll.find(event.target, true)
      : null;

    if (blot && !(blot instanceof Embed)) {
      this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_START, event);
      this.scroll.batchStart();
      this.emitter.emit(Emitter.events.COMPOSITION_START, event);
      this.isComposing = true;
    }
  }

  private handleCompositionEnd(event: CompositionEvent) {
    this.quill.root.dispatchEvent(new Event('composition-end', { bubbles: true }));

    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
  }

  get composing(): boolean {
    return this.isComposing;
  }
}

export default Composition;
