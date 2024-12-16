/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Support body as root', () => {
  document.body.innerHTML = '{{ text }}'

  const target = document.body
  pow.apply(target, { text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<body>Hello, world!</body>')
})

test('Updates root element', () => {
  document.body.innerHTML = '<div id="main" class="{{ classes }}">{{ text }}</div>'

  const target = document.getElementById('main')
  pow.apply(target, { classes: 'styled', text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<div id="main" class="styled">Hello, world!</div>')
})

test('Updates child element', () => {
  document.body.innerHTML = '<div id="main"><div pow class="{{ classes }}">{{ text }}</div></div>'

  const target = document.getElementById('main')
  pow.apply(target, { classes: 'styled', text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<div id="main"><div class="styled">Hello, world!</div></div>')
})

test('Invokes element event function', () => {
  document.body.innerHTML = '<button id="btn" onclick="{{ clicked }}">Click me</button>'

  var wasClicked = false

  const target = document.getElementById('btn')
  pow.apply(target, { clicked: () => { wasClicked = true } })

  target.click()

  const fn = Object.keys(window.$pow$)[0]
  expect(document.body.innerHTML).toBe(`<button id="btn" onclick="$pow$.${fn}(this)">Click me</button>`)
  expect(wasClicked).toBe(true)
})