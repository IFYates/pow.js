test('Can loop contents of a child', () => {
  document.body.innerHTML = '<div pow each="child">{{ text }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>OneTwoThree</div>')
})

test('Can loop current context', () => {
  document.body.innerHTML = '<template pow data="child"><div pow each>{{ text }}</div></template>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>OneTwoThree</div>')
})

test.each([[null], [[]]])('Loop if nothing does not output', (arr) => {
  document.body.innerHTML = '<template pow data="child"><div pow each>DO NOT SHOW</div></template>'

  pow.apply(document.body, {
    child: arr
  })

  expect(document.body.innerHTML).toBe('')
})

test('Can access index in loop', () => {
  document.body.innerHTML = '<div pow each="child">{{ $index }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>012</div>')
})

test('Can access "first" in loop', () => {
  document.body.innerHTML = '<div pow each="child">{{ $first ? "true" : "false" }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>truefalsefalse</div>')
})

test('Can access "last" in loop', () => {
  document.body.innerHTML = '<div pow each="child">{{ $last ? "true" : "false" }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>falsefalsetrue</div>')
})

test('Can access index in loop child', () => {
  document.body.innerHTML = '<div pow each="child"><template pow data="text">{{ $index }}</template></div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>012</div>')
})

test('Can access "first" in loop child', () => {
  document.body.innerHTML = '<div pow each="child"><template pow data="text">{{ $first ? "true" : "false" }}</template></div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>truefalsefalse</div>')
})

test('Can access "last" in loop child', () => {
  document.body.innerHTML = '<div pow each="child"><template pow data="text">{{ $last ? "true" : "false" }}</template></div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>falsefalsetrue</div>')
})

test('Can loop an object', () => {
  document.body.innerHTML = '<div pow each>{{ key }}: {{ value }}</div>'

  pow.apply(document.body, {
    'One': 1,
    'Two': 2,
    'Three': 3
  })

  expect(document.body.innerHTML).toBe('<div>One: 1Two: 2Three: 3</div>')
})

test('Post-loop conditions are ignored on loop', () => {
  document.body.innerHTML = '<div pow each>{{ $data }}</div><div pow else>None</div>'

  pow.apply(document.body, [1])

  expect(document.body.innerHTML).toBe('<div>1</div>')
})

test.each([[null], [[]]])('Post-loop conditions are used if no loop', (arr) => {
  document.body.innerHTML = '<div pow each>[{{ $data }}]</div><div pow else>None</div>'

  pow.apply(document.body, arr)

  expect(document.body.innerHTML).toBe('<div>None</div>')
})

test.each([[true, '1, 2, 3, '], [false, '']])('Loop binding processed after conditional', (condition, expected) => {
  document.body.innerHTML = '<template pow if="check" each="list">{{ $data }}, </template>'

  pow.apply(document.body, { check: condition, list: [1, 2, 3] })

  expect(document.body.innerHTML).toBe(expected)
})

test('Can access "prev" in loop', () => {
  document.body.innerHTML = '<div pow each>{{ $data }}: {{ $prev }}</div>'

  pow.apply(document.body, [1, 2, 3])

  expect(document.body.innerHTML).toBe('<div>1: 2: 13: 2</div>')
})

test('Can access "next" in loop', () => {
  document.body.innerHTML = '<div pow each>{{ $data }}: {{ $next }}</div>'

  pow.apply(document.body, [1, 2, 3])

  expect(document.body.innerHTML).toBe('<div>1: 22: 33: </div>')
})