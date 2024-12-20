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

  expect(document.body.innerHTML).toBe('<div id="main">Hello, world!</div>')
})

test('Replaces template contents repeated for loop', () => {
  document.body.innerHTML = '<div id="main"><template pow array="list">{{ $data }}, </template></div>'

  const target = document.getElementById('main')
  pow.apply(target, { list: [ 1, 2, 3, 4, 5 ] })

  expect(document.body.innerHTML).toBe('<div id="main">1, 2, 3, 4, 5, </div>')
})

test('Can reference existing template', () => {
  document.body.innerHTML = '<div id="main"><source pow template="text-view"/></div><template id="text-view">{{ text }}</template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main">Hello, world!</div><template id="text-view">{{ text }}</template>')
})

test.each([ [true, '1, 2, 3, 4, 5, '], [false, ''] ])('Template processed after other bindings', (condition, expected) => {
  document.body.innerHTML = '<template id="main"><source pow if="check" array="list" template="list-view"/></template><template id="list-view">{{ $data }}, </template>'

  const target = document.getElementById('main')
  pow.apply(target, { check: condition, list: [ 1, 2, 3, 4, 5 ] })

  expect(document.body.innerHTML).toBe(expected + '<template id="list-view">{{ $data }}, </template>')
})