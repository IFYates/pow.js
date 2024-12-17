/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.safe.js'

test('Safe interpolation supports properties', () => {
  document.body.innerHTML = '<div>{{ text }}</div>'

  pow.apply(document.body, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Safe interpolation supports deep properties', () => {
  document.body.innerHTML = '<div pow item="child">{{ text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, child!</div>')
})

test('Safe interpolation can resolve functions', () => {
  document.body.innerHTML = '<div>{{ func() }}</div>'

  pow.apply(document.body, { name: 'world', func: (me) => 'Hello, ' + me.name + '!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Safe interpolation can resolve deep functions', () => {
  document.body.innerHTML = '<div>{{ child.func() }}</div>'

  pow.apply(document.body, { child: { name: 'world', func: (me) => 'Hello, ' + me.name + '!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Safe interpolation silently fails non-function call', () => {
  document.body.innerHTML = '<div>{{ notfunc() }}</div>'

  pow.apply(document.body, {})

  expect(document.body.innerHTML).toBe('<div></div>')
})

test('Safe interpolation supports object length', () => {
  document.body.innerHTML = '<div>{{ child.length }}</div>'

  pow.apply(document.body, { child: { a: 1, b: 2, c: 3 } })

  expect(document.body.innerHTML).toBe('<div>3</div>')
})

test('Safe interpolation can access globals', () => {
  document.body.innerHTML = '<div>{{ text }}</div>'

  window.text = 'Hello, world!'
  pow.apply(document.body, {})
  delete window.text

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Safe interpolation returns nothing for undefined', () => {
  document.body.innerHTML = '<div>{{ child.text }}</div>'

  window.text = 'Not this'
  pow.apply(document.body, {})

  expect(document.body.innerHTML).toBe('<div></div>')
})

test('Safe binding will not change function interpolation', () => {
  document.body.innerHTML = '<div>{{ fn }}</div>'

  pow.apply(document.body, { fn: () => { } })

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`<div>$pow$.${fn}(this)</div>`)
})

test('Safe binding will not rebind non-event attributes', () => {
  document.body.innerHTML = '<button click="{{ func }}" onclick="not-bound">Click</button>'

  pow.apply(document.body, { func: () => { } })

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`<button click="$pow$.${fn}(this)" onclick="not-bound">Click</button>`)
})

test('Safe binding will rebind event functions', () => {
  document.body.innerHTML = '<button onclick="{{ func }}">Click</button>'

  var clickArg = null
  const data = {
    func: (arg) => {
      clickArg = arg
    }
  }
  pow.apply(document.body, data)
  document.querySelector('button').click()

  expect(document.body.innerHTML).toBe('<button>Click</button>')
  expect(clickArg).toBe(data)
})