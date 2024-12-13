/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Self interpolation', () => {
  document.body.innerHTML = '<div>{{ *data }}</div>'

  pow.apply(document.body, 'Hello, world!')

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Key interpolation', () => {
  document.body.innerHTML = '<div>{{ text }}</div>'

  pow.apply(document.body, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Deep interpolation', () => {
  document.body.innerHTML = '<div>{{ child.text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, world!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Array length interpolation', () => {
  document.body.innerHTML = '<div>{{ data.length }}</div>'

  pow.apply(document.body, { data: [1, 2, 3] })

  expect(document.body.innerHTML).toBe('<div>3</div>')
})

test.each([ true, false ])('Boolean interpolation', (bool) => {
  document.body.innerHTML = '<div>{{ data }}</div>'

  pow.apply(document.body, { data: bool })

  expect(document.body.innerHTML).toBe(`<div>${bool ? 'true' : 'false'}</div>`)
})

test('Function result interpolation', () => {
  document.body.innerHTML = '<div>{{ fn() }}</div>'

  pow.apply(document.body, { fn: () => 'ok' })

  expect(document.body.innerHTML).toBe('<div>ok</div>')
})

test('Function interpolation', () => {
  document.body.innerHTML = '<div>{{ fn }}</div>'

  pow.apply(document.body, { fn: () => {} })

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`<div>$pow$.${fn}(this)</div>`)
})