import type Scroll from '../blots/scroll.js';
import Emitter from './emitter.js';
import type Quill from '../core/quill.js';
declare class Composition {
    private scroll;
    private emitter;
    isComposing: boolean;
    private quill;
    constructor(scroll: Scroll, emitter: Emitter, quill: Quill);
    private setupListeners;
    private handleCompositionStart;
    private handleCompositionEnd;
    get composing(): boolean;
}
export default Composition;
