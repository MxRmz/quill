import Embed from '../blots/embed.js';
import Emitter from './emitter.js';
import Delta from 'quill-delta';
class Composition {
  isComposing = false;
  constructor(scroll, emitter) {
    this.scroll = scroll;
    this.emitter = emitter;
    this.setupListeners();
  }
  setupListeners() {
    this.scroll.domNode.addEventListener('compositionstart', event => {
      if (!this.isComposing) {
        this.isComposing = true;
        this.scroll.batchStart();
        this.handleCompositionStart(event);
      }
    });
    this.scroll.domNode.addEventListener('compositionend', event => {
      if (this.isComposing) {
        setTimeout(() => {
          this.handleCompositionEnd(event);
          this.scroll.batchEnd();
          this.isComposing = false;
          this.emitter.emit(Emitter.events.TEXT_CHANGE, new Delta(), new Delta(), 'composition-fix');
        }, 0);
      }
    });
  }
  handleCompositionStart(event) {
    const blot = event.target instanceof Node ? this.scroll.find(event.target, true) : null;
    if (blot && !(blot instanceof Embed)) {
      this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_START, event);
      this.scroll.batchStart();
      this.emitter.emit(Emitter.events.COMPOSITION_START, event);
      this.isComposing = true;
    }
  }
  handleCompositionEnd(event) {
    this.emitter.emit(Emitter.events.COMPOSITION_BEFORE_END, event);
    this.scroll.batchEnd();
    this.emitter.emit(Emitter.events.COMPOSITION_END, event);
    this.isComposing = false;
  }
}
export default Composition;
//# sourceMappingURL=composition.js.map