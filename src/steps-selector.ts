import {LitElement, html, css} from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import {customElement, property} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'

import './steps-selector-item.js'

/**
 * @element steps-selector
 * Web component to select a sequence of steps
 * 
 * It has these events:
 * - load
 * - change
 * 
 * It has these properties:
 * - steps
 * - dirty
 * 
 * It has these slots:
 * - placeholder
 * - dirty-icon
 * 
 * User actions:
 * - add a next step at the end of the selection
 * - reset to default value
 * - copy value to clipboard
 * - paste value from clipboard
 */

export interface Step {
  name: string
  icon: string
  type: string
  tags?: string[]
  helpText?: string
  errorText?: string
  options?: any
  optionsForm?: string
}

@customElement('steps-selector')
export class StepsSelector extends LitElement {
  static override styles = css`
    :host {
      --steps-selector-dirty-color: red;
    }
    ::part(header) {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .dirty {
      color: var(--steps-selector-dirty-color, red);
    }
    ::part(property-container) {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    ::part(fixed-selector) {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--steps-selector-dirty-border-color, #ccc);
      background-color: var(--steps-selector-dirty-background-color, #ccc);
      border-radius: 5px;
      padding: 3px;
    }
    .fixed-selector span {
      padding: 3px;
    }
    .fixed-selector span:not(.active):hover {
      color: var(--steps-selector-dirty-color, #0091ff);
    }
    .fixed-selector span:not(.active) {
      cursor: pointer;
    }
    .fixed-selector span:last-child {
      margin-left: 5px;
    }
    .fixed-selector span.active {
      border-radius: 5px;
      background-color: #eee;
      cursor: default;
    }
    steps-selector-item {
      padding: 10px;
      margin: 10px;
    }
  `

  // Read only property dirty
  get dirty() {
    return JSON.stringify(this._steps) !== JSON.stringify(this.initialValue)
  }

  // Steps currently selected
  @property({type: Array})
  steps: Step[] = []

  // Steps with change events - internal use only
  protected get _steps() {
    return this.steps
  }
  protected set _steps(value) {
    const oldValue = this.steps
    this.steps = value
    this.requestUpdate('steps', oldValue)
    this.dispatchEvent(new CustomEvent('change', {detail: {value}}))
  }

  // Initial value
  protected initialValue: Step[] = []

  // Get the list of steps that can be added after the given selection
  @property({type: Function})
  completion: (steps: Step[]) => Step[] = () => []

  @property({type: Boolean, attribute: 'allow-fixed'})
  allowFixed = false

  @property({type: Boolean, attribute: 'fixed', reflect: true})
  fixed = false

  @property({type: String, attribute: 'fixed-type'})
  fixedType: 'text' | 'date' | 'email' | 'number' | 'password' | 'tel' | 'time' | 'url' = 'text'

  @property()
  placeholder = 'Add a first step'

  override render() {
    console.log('render ==== ', this.fixed)
    const nextSteps = this.completion(this._steps)
    return html`
      <!-- header -->
      <header part="header" class="header">
        <div class=${classMap({dirty: this.dirty, 'property-name': true})} part="property-name">
          <slot></slot>
          ${this.dirty ? html`
            <slot name="dirty-icon" @click=${this.reset}>
              <svg viewBox="0 0 24 24" width="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
            </slot>
          ` : html``}
        </div>
        ${this.allowFixed ? html`
          <div part="fixed-selector" class="fixed-selector">
            <span
              class=${classMap({active: this.fixed, 'fixed-selector-fixed': true})}
              @click=${() => this.fixed = true}
              part="fixed-selector-fixed"
            >Fixed</span>
            <span
              class=${classMap({active: !this.fixed, 'fixed-selector-expression': true})}
              @click=${() => this.fixed = false}
              part="fixed-selector-expression"
            >Expression</span>
          </div>
        ` : ''}
      </header>
      <!-- fixed value -->
      ${this.fixed ? html`
        <div part="property-container" class="property-container">
          <input
            .placeholder=${this.placeholder}
            .type=${this.fixedType}
            .value=${this._steps[0]?.options ? this._steps[0].options['value'] : ''}
            @change=${(event: InputEvent) => this.fixedValueChanged((event.target as HTMLInputElement).value)}
          >
        </div>
      ` : html`
        <!-- steps -->
        <div part="steps-container" class="steps-container">
          ${this._steps
            .map((step, index) => ({
              step,
              completion: this.completion(this._steps.slice(0, index)),
            }))
            .map(({step, completion}, index) => html`
              <steps-selector-item
                key=${index}
                ?no-options-editor=${!step.optionsForm}
                ?no-info=${!step.helpText}
                @set=${(event: CustomEvent) => this.setStepAt(index, completion.find(s => s.name === event.detail.value))}
                @delete=${() => this.deleteStepAt(index)}
                @set-options=${(event: CustomEvent) => this.setOptionsAt(index, event.detail.options)}
              >
                <div slot="icon">${step.icon}</div>
                <div slot="name">${step.name}</div>
                <ul slot="tags">
                  ${step.tags?.map(tag => html`<li>${tag}</li>`)}
                </ul>
                <div slot="type">${step.type}</div>
                <div slot="helpText">${unsafeHTML(step.helpText)}</div>
                <div slot="errorText">${unsafeHTML(step.errorText)}</div>
                <div slot="values">
                  <ul>
                    ${
                      completion
                        .map(step => html`<li value=${step.name}>${step.name}</li>`)
                    }
                  </ul>
                </div>
                <div slot="options">${unsafeHTML(step.optionsForm)}</div>
              </steps-selector-item>
            `)}
        <!-- no steps -->
        ${this._steps.length > 0 ? html`` : html`
          <slot name="placeholder" part="placeholder">
            <p>${this.placeholder}</p>
          </slot>
        `}
        <!-- add a step -->
        ${nextSteps.length > 0 ? html`
          <steps-selector-item
            no-options-editor
            no-delete
            no-arrow
            no-info
            @set=${(event: CustomEvent) => this.setStepAt(this._steps.length, nextSteps.find(step => step.name === event.detail.value))}
          >
            <div slot="name">+</div>
            <div slot="values">
              <ul>
                ${ nextSteps.map(step => html`<li value=${step.name}>${step.name}</li>`) }
              </ul>
            </div>
          </steps-selector-item>
        ` : html``}
        </div>
      `}
    `
  }

  override connectedCallback() {
    super.connectedCallback()
    this.dispatchEvent(new Event('load'))
  }

  isFixedValue() {
    return this.allowFixed && this.fixed && (this._steps.length === 0 || this._steps[0].type === 'fixed')
  }

  fixedValueChanged(value: string) {
    if (value && value !== '') {
      this._steps = [
        {
          name: 'Fixed value',
          icon: '',
          type: 'fixed',
          options: {
            value,
          },
          optionsForm: `<form><input name="value" type="text" value=${value} /><button type="submit">Save</button></form>`,
        },
      ]
    } else {
      this._steps = []
    }
  }

  /**
   * Set the step at the given index
   */
  setStepAt(at: number, step: Step | undefined) {
    if (step) {
      this._steps = [
        ...this._steps.slice(0, at),
        step,
      ]
    } else {
      console.error(`Step is undefined at ${at}`)
    }
  }

  setOptionsAt(at: number, options: unknown) {
    this._steps = [
      ...this._steps.slice(0, at),
      {
        ...this._steps[at],
        options,
      },
      ...this._steps.slice(at + 1),
    ]
  }

  /**
   * Delete the step at the given index and all the following steps
   */
  deleteStepAt(at: number) {
    this._steps = this._steps.slice(0, at)
  }

  /**
   * Reset dirty flag and store the current value as initial value
   */
  public save() {
    this.initialValue = [
      ...this._steps,
    ]
  }

  /**
   * Reset dirty flag and restore the initial value
   */
  reset() {
    this._steps = [
      ...this.initialValue,
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'steps-selector': StepsSelector
  }
}
