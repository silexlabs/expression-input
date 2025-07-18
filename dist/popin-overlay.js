var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { popinStyles } from './styles.js';
/**
 * This PopinOverlay component is a simple dialog that can be used to display any html on top of your UI
 * It is not a modal, it is not blocking the UI, it is just a simple dialog that will catch focus and hide when the user press escape or click outside of it
 * The dialog will be automatically positioned where placed in the DOM but it will be moved and resized to be fully visible on all screen sizes
 *
 * Usage:
 *
 * ```
 * <popin-overlay hidden style="width: 400px" no-auto-close>
 *   <div slot="header">Header</div>
 *   <div slot="body">Body</div>
 *   <div slot="footer">Footer</div>
 * </popin-overlay>
 * ```
 *
 * @element popin-overlay
 * @htmltag popin-overlay
 * @htmlslot The content of the dialog
 * @htmlattr hidden - Hide the dialog
 * @htmlattr no-auto-close - Do not close the dialog when the user click outside of it
 * @fires {CustomEvent} popin-closed - Fires when the dialog is closed
 * @fires {CustomEvent} popin-opened - Fires when the dialog is opened
 * @cssprop {Color} --popin-background - The background color of the dialog
 * @cssprop {Color} --popin-color - The text color of the dialog
 *
 */
export class PopinOverlay extends LitElement {
    constructor() {
        super(...arguments);
        this.hidden = false;
        this.noAutoClose = false;
        this.resized_ = this.ensureElementInView.bind(this);
        this.blured_ = this.blured.bind(this);
        this.keydown_ = this.keydown.bind(this);
    }
    render() {
        setTimeout(() => this.ensureElementInView());
        return html ` <slot></slot> `;
    }
    connectedCallback() {
        super.connectedCallback();
        // Make the element focusable
        this.setAttribute('tabindex', '0');
        // Attach events on this instance
        this.addEventListener('blur', this.blured_);
        this.addEventListener('keydown', this.keydown_);
        // Attach elements on window
        window.addEventListener('resize', this.resized_);
        window.addEventListener('blur', this.blured_);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.resized_);
        window.removeEventListener('blur', this.blured_);
        this.removeEventListener('blur', this.blured_);
        this.removeEventListener('keydown', this.keydown_);
        super.disconnectedCallback();
    }
    getActiveElementRecursive(element = document.activeElement) {
        if (element === null || element === void 0 ? void 0 : element.shadowRoot) {
            return this.getActiveElementRecursive(element.shadowRoot.activeElement);
        }
        return element;
    }
    blured() {
        if (this.noAutoClose)
            return;
        // Give the time to the click event to be processed
        setTimeout(() => {
            // Check if the focus is still inside the dialog
            const focusedElement = this.getActiveElementRecursive();
            let popin = focusedElement;
            while (popin && popin !== this) {
                popin = popin.parentNode || popin.host;
            }
            if (popin !== this) {
                // Hide the dialog
                this.close();
            }
            else {
                // Focus the dialog again so that this function
                // will be called again when the user click outside
                //this.focus()
            }
        });
    }
    close() {
        this.setAttribute('hidden', '');
        this.blur();
    }
    keydown(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }
    attributeChangedCallback(name, _old, value) {
        super.attributeChangedCallback(name, _old, value);
        if (name === 'hidden' && value === null) {
            this.focus();
            this.dispatchEvent(new CustomEvent('popin-opened'));
        }
        if (name === 'hidden' && value !== null) {
            this.dispatchEvent(new CustomEvent('popin-closed'));
        }
    }
    ensureElementInView() {
        var _a;
        // Set our position to the parent element position
        const parentStyle = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        this.style.left = `${parentStyle === null || parentStyle === void 0 ? void 0 : parentStyle.left}px`;
        this.style.top = `${parentStyle === null || parentStyle === void 0 ? void 0 : parentStyle.top}px`;
        const offsetX = 0;
        const offsetY = 0;
        // // Get the element's bounding rectangle
        const rect = this.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        // Check if the element is out of the viewport on the right side
        if (rect.left + rect.width + offsetX > viewportWidth) {
            this.style.left = `${viewportWidth - rect.width - offsetX}px`;
        }
        // Check if the element is out of the viewport on the left side
        if (rect.left + offsetX < 0) {
            this.style.left = `${-offsetX}px`;
        }
        // Check if the element is out of the viewport on the bottom
        if (rect.top + rect.height + offsetY > viewportHeight) {
            this.style.top = `${viewportHeight - rect.height - offsetY}px`;
        }
        // Check if the element is out of the viewport on the top
        if (rect.top + offsetY < 0) {
            this.style.top = `${-offsetY}px`;
        }
    }
}
PopinOverlay.styles = popinStyles;
__decorate([
    property()
], PopinOverlay.prototype, "hidden", void 0);
__decorate([
    property({ type: Boolean, attribute: 'no-auto-close' })
], PopinOverlay.prototype, "noAutoClose", void 0);
if (!window.customElements.get('popin-overlay')) {
    window.customElements.define('popin-overlay', PopinOverlay);
}
//# sourceMappingURL=popin-overlay.js.map