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

test('Interpolated values are not double-interpolated', () => {
  document.body.innerHTML = '<div pow array="list">{{ *data }}</div>'

  pow.apply(document.body, { list: ['{{ text }}'] })

  expect(document.body.innerHTML).toBe('<div>{{ text }}</div>')
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
  document.body.innerHTML = '<div>{{ func(name) }}</div>'

  pow.apply(document.body, { name: 'world', func: (name) => 'Hello, ' + name + '!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Function interpolation', () => {
  document.body.innerHTML = '<div>{{ fn }}</div>'

  pow.apply(document.body, { fn: () => {} })

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`<div>$pow$.${fn}(this)</div>`)
})

test('Custom eval interpolation', () => {
  document.body.innerHTML = '[{{ text }}, {{ number }}, {{ fn }}]'

  const originalEval = pow._eval
  
  pow._eval = () => 'eval'
  pow.apply(document.body, { text: 'Hello, world!', number: 123, fn: () => {} })

  pow._eval = originalEval

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`[eval, eval, eval]`)
})