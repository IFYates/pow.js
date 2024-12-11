/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Self interpolation', () => {
  document.body.innerHTML = '<div pow>{{ *data }}</div>'

  pow.apply(document.body, 'Hello, world!')

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Key interpolation', () => {
  document.body.innerHTML = '<div pow>{{ text }}</div>'

  pow.apply(document.body, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Deep interpolation', () => {
  document.body.innerHTML = '<div pow>{{ child.text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, world!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Array length interpolation', () => {
  document.body.innerHTML = '<div pow>{{ data.length }}</div>'

  pow.apply(document.body, { data: [1, 2, 3] })

  expect(document.body.innerHTML).toBe('<div>3</div>')
})