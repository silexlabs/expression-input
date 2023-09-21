import {PopinDialog} from '../popin-dialog';
import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('popin-dialog', () => {
  test('is defined', () => {
    const el = document.createElement('popin-dialog')
    assert.instanceOf(el, PopinDialog)
  })

  test('renders with default values', async () => {
    const el = await fixture(html`<popin-dialog></popin-dialog>`)
    assert.shadowDom.equal(
      el,
      `
      <header>
        <slot class="header" name="header"></slot>
      </header>
      <main>
        <slot class="body" name="body"></slot>
        <slot class="default"></slot>
      </main>
      <footer>
        <slot class="footer" name="footer"></slot>
      </footer>
    `
    )
  })

  test('renders with a set HTML body', async () => {
    //const el = await fixture(html`<popin-dialog><div slot="body">Test body</div>Test default</popin-dialog>`)
    const el = await fixture(html`<popin-dialog><div id="test">Test default</div></popin-dialog>`)
    const slot = el.shadowRoot?.querySelector('slot.default') as HTMLSlotElement
    const nodes = slot.assignedNodes()
    assert.equal(nodes.length, 1)
    assert.equal(nodes[0].textContent, 'Test default')
  })

  test('hides when lose focus', async () => {
    const el = await fixture(html`<popin-dialog><div>Test</div></popin-dialog>`) as HTMLElement
    el.focus()
    el.blur()
    await new Promise(resolve => setTimeout(resolve, 0))
    assert.equal(getComputedStyle(el).display, 'none')
    assert.equal(el.hasAttribute('hidden'), true)
  })

  test('do not hide when lose focus with autoclose set to false', async () => {
    const el = await fixture(html`<popin-dialog no-auto-close><div>Test</div></popin-dialog>`) as HTMLElement
    el.focus()
    el.blur()
    await new Promise(resolve => setTimeout(resolve, 0))
    assert.notEqual(getComputedStyle(el).display, 'none')
  })

  test('hides when hidden attribute is set', async () => {
    const el = await fixture(html`<popin-dialog hidden><div>Test</div></popin-dialog>`)
    assert.equal(getComputedStyle(el).display, 'none')
  })
})
