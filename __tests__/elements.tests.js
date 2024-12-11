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
  document.body.innerHTML = '<div id="main" class="{{ class }}">{{ text }}</div>'

  const target = document.getElementById('main')
  pow.apply(target, { class: 'styled', text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<div id="main" class="styled">Hello, world!</div>')
})

test('Updates child element', () => {
  document.body.innerHTML = '<div id="main"><div pow class="{{ class }}">{{ text }}</div></div>'

  const target = document.getElementById('main')
  pow.apply(target, { class: 'styled', text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<div id="main"><div class="styled">Hello, world!</div></div>')
})

test('Replaces root template', () => {
  document.body.innerHTML = '<template id="main">{{ text }}</template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.outerHTML).toBe('<body>Hello, world!</body>')
})

test('Replaces child template', () => {
  document.body.innerHTML = '<div id="main"><template pow>{{ text }}</template></div>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(target.outerHTML).toBe('<div id="main">Hello, world!</div>')
})