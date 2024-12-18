/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Attribute templates on unbound elements are resolved', () => {
  document.body.innerHTML = '<div class="{{ value }}"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test('Attribute templates on bound elements are resolved', () => {
  document.body.innerHTML = '<div pow class="{{ value }}"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test('Attribute falsy templates on unbound elements are resolved', () => {
  document.body.innerHTML = '<div class="{{ value }}"></div>'

  pow.apply(document.body, { value: false })

  expect(document.body.innerHTML).toBe('<div class="false"></div>')
})

test('Attribute falsy templates on bound elements are removed', () => {
  document.body.innerHTML = '<div pow class="{{ value }}"></div>'

  pow.apply(document.body, { value: false })

  expect(document.body.innerHTML).toBe('<div></div>')
})

test('$attributes on bound elements are resolved', () => {
  document.body.innerHTML = '<div pow $class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test('$attributes on unbound elements are not resolved', () => {
  document.body.innerHTML = '<div $class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div $class="value"></div>')
})

test('falsy $attributes on bound elements are removed', () => {
  document.body.innerHTML = '<div pow $class="value"></div>'

  pow.apply(document.body, { value: false })

  expect(document.body.innerHTML).toBe('<div></div>')
})

test('$attributes on bound elements replace existing', () => {
  document.body.innerHTML = '<div pow class="existing" $class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test('falsy $attributes on bound elements leave existing', () => {
  document.body.innerHTML = '<div pow class="existing" $class="value"></div>'

  pow.apply(document.body, { value: false })

  expect(document.body.innerHTML).toBe('<div class="existing"></div>')
})