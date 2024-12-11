/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Can bind to child context', () => {
  document.body.innerHTML = '<div pow item="child">{{ text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, child!</div>')
})

test('Can access parent from child context', () => {
  document.body.innerHTML = '<div pow item="child">{{ *parent.text }}</div>'

  pow.apply(document.body, { text: 'Hello, parent!', child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, parent!</div>')
})

test('Binding context applies to children', () => {
  document.body.innerHTML = '{{ context }} <div pow item="child" attr="{{ context }}">{{ context }}</div> {{ context }}'

  pow.apply(document.body, { context: 'parent', child: { context: 'child' } })

  expect(document.body.innerHTML).toBe('parent <div attr="child">child</div> parent')
  // TODO: is 'attr' parent or child?
})