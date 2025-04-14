test('Can reference existing template', () => {
  document.body.innerHTML = '<div id="main"><pow:test-element>No match</pow:test-element></div>'
    + '<template id="test-element"><div>{{ text }}</div></template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(target.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Invokes else sibling if no match', () => {
  document.body.innerHTML = '<div id="main"><pow:test-element></pow:test-element><div pow else>No match</div>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(target.innerHTML).toBe('<div>No match</div>')
})

test('Other attributes are processed', () => {
  document.body.innerHTML = '<div id="main"><pow:test-element data="child">No match</pow:test-element></div>'
    + '<template id="test-element"><div>{{ text }}</div></template>'

  const target = document.getElementById('main')
  pow.apply(target, { child: { text: 'Hello, world!' } })

  expect(target.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Can include subcontent', () => {
  document.body.innerHTML = '<div id="main"><pow:test-element><template>Hello, world!</template>No match</pow:test-element></div>'
    + '<template id="test-element"><div><param /></div></template>'

  const target = document.getElementById('main')
  pow.apply(target)

  expect(target.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Can include default subcontent', () => {
  document.body.innerHTML = '<div id="main"><pow:test-element>Hello, <em>world</em>!</pow:test-element></div>'
    + '<template id="test-element"><div><param /></div></template>'

  const target = document.getElementById('main')
  pow.apply(target)

  expect(target.innerHTML).toBe('<div>Hello, <em>world</em>!</div>')
})

test('Custom elements work from templates', () => {
  document.body.innerHTML = '<div id="main"><pow:parent-element>No match</pow:parent-element></div>'
    + '<template id="parent-element"><pow:test-element></pow:test-element></template>'
    + '<template id="test-element"><div>Element</div></template>'

  const target = document.getElementById('main')
  pow.apply(target)

  expect(target.innerHTML).toBe('<div>Element</div>')
})

test.each([ [ 'testelement' ], [ 'Testelement' ], [ 'testElement' ] ])('Does not match capitals', (id) => {
  document.body.innerHTML = `<div id="main"><pow:${id}></pow:${id}><template pow else>No match</template></div>'
    + '<template id="TestElement">MATCH</template>`

  const target = document.getElementById('main')
  pow.apply(target)

  expect(target.outerHTML).toBe('<div id="main">No match</div>')
})
