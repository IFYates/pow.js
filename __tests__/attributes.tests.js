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

test('Attribute templates on root element are resolved correctly', () => {
  document.body.innerHTML = '<div class="{{ value }}"></div>'

  const target = document.body.querySelector('div')
  pow.apply(target, { value: '{{ pow }}' })

  expect(document.body.innerHTML).toBe('<div class="{{ pow }}"></div>')
})

test.each([[false, 'false'], [0, '0'], [null, ''], [undefined, ''], ['', '']])('Attribute falsy templates on unbound elements are resolved', (value, expected) => {
  document.body.innerHTML = '<div class="{{ value }}"></div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe(`<div class="${expected}"></div>`)
})

test.each([[false, ''], [0, ' class="0"'], [null, ''], [undefined, ''], ['', '']])('Attribute falsy templates on bound elements are removed', (value, expected) => {
  document.body.innerHTML = '<div pow class="{{ value }}"></div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe(`<div${expected}></div>`)
})

test(':attributes on bound elements are resolved', () => {
  document.body.innerHTML = '<div pow :class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test(':attributes on bound elements are resolved (moustache)', () => {
  document.body.innerHTML = '<div pow :class="{{ value }}"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test.each([
  ['[attr{{ value }}', 'ibute]', '[attribute]'],
  ['[{{ value }}]', 'attribute', '[attribute]'],
  ['[{{ value }}]', null, '[]']
])(':attributes on bound elements are resolved (multi-part moustache)', (template, value, expected) => {
  document.body.innerHTML = `<div pow :class="${template}"></div>`

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe(`<div class="${expected}"></div>`)
})

test(':attributes on unbound elements are not resolved', () => {
  document.body.innerHTML = '<div :class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div :class="value"></div>')
})

test.each([[false], [0], [null], [undefined], ['']])('falsy :attributes on bound elements are removed', (value) => {
  document.body.innerHTML = '<div pow :class="value"></div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div></div>')
})

test(':attributes on bound elements replace existing', () => {
  document.body.innerHTML = '<div pow class="existing" :class="value"></div>'

  pow.apply(document.body, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div class="attribute"></div>')
})

test.each([[false], [0], [null], [undefined], ['']])('falsy :attributes on bound elements leave existing', (value) => {
  document.body.innerHTML = '<div pow class="existing" :class="value"></div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div class="existing"></div>')
})

test.each([[false], [0], [null], [undefined], ['']])('falsy :attributes on bound elements leave existing (moustache)', (value) => {
  document.body.innerHTML = '<div pow class="existing" :class="{{ value }}"></div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div class="existing"></div>')
})

test('Attributes work on root element', () => {
  document.body.innerHTML = '<div id="root" attr1="{{ value }}" :attr2="value"></div>'

  const target = document.getElementById('root')
  pow.apply(target, { value: 'attribute' })

  expect(document.body.innerHTML).toBe('<div id="root" attr1="attribute" attr2="attribute"></div>')
})

test('Empty attributes on bound elements are removed', () => {
  document.body.innerHTML = '<div pow attribute></div><div attribute></div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div></div><div attribute=""></div>')
})

test('Data attributes add data to current state', () => {
  document.body.innerHTML = '<div pow data="child"><div pow before="{{ value }}" value:="num" after="{{ value }}">{{ value }}</div><div outside="{{ value }}">{{ value }}</div></div>'

  pow.apply(document.body, { child: { num: 1, value: 2 } })

  expect(document.body.innerHTML).toBe('<div><div before="2" after="1">1</div><div outside="2">2</div></div>')
})