test('Can repeat children of element', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ text }}</li></ul>'

  pow.apply(document.body, {
    items: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>One</li><li>Two</li><li>Three</li></ul>')
})

test('Can repeat multiple children of element', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ text }}</li><li>extra</li></ul>'

  pow.apply(document.body, {
    items: [
      { text: 'One' },
      { text: 'Two' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>One</li><li>extra</li><li>Two</li><li>extra</li></ul>')
})

test('Repeat with empty array keeps element with no children', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ text }}</li></ul>'

  pow.apply(document.body, { items: [] })

  expect(document.body.innerHTML).toBe('<ul></ul>')
})

test('Repeat with null keeps element with no children', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ text }}</li></ul>'

  pow.apply(document.body, { items: null })

  expect(document.body.innerHTML).toBe('<ul></ul>')
})

test('Can access $index in repeat', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $index }}</li></ul>'

  pow.apply(document.body, {
    items: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>0</li><li>1</li><li>2</li></ul>')
})

test('Can access $first in repeat', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $first ? "true" : "false" }}</li></ul>'

  pow.apply(document.body, {
    items: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>true</li><li>false</li><li>false</li></ul>')
})

test('Can access $last in repeat', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $last ? "true" : "false" }}</li></ul>'

  pow.apply(document.body, {
    items: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>false</li><li>false</li><li>true</li></ul>')
})

test('Can access $prev in repeat', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $data }}: {{ $prev }}</li></ul>'

  pow.apply(document.body, { items: [1, 2, 3] })

  expect(document.body.innerHTML).toBe('<ul><li>1: </li><li>2: 1</li><li>3: 2</li></ul>')
})

test('Can access $next in repeat', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $data }}: {{ $next }}</li></ul>'

  pow.apply(document.body, { items: [1, 2, 3] })

  expect(document.body.innerHTML).toBe('<ul><li>1: 2</li><li>2: 3</li><li>3: </li></ul>')
})

test('Can repeat current context', () => {
  document.body.innerHTML = '<ul pow repeat><li>{{ text }}</li></ul>'

  pow.apply(document.body, [
    { text: 'One' },
    { text: 'Two' },
    { text: 'Three' }
  ])

  expect(document.body.innerHTML).toBe('<ul><li>One</li><li>Two</li><li>Three</li></ul>')
})

test('Can repeat an object', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ key }}: {{ value }}</li></ul>'

  pow.apply(document.body, {
    items: { One: 1, Two: 2, Three: 3 }
  })

  expect(document.body.innerHTML).toBe('<ul><li>One: 1</li><li>Two: 2</li><li>Three: 3</li></ul>')
})

test('Repeat can access parent state via $parent', () => {
  document.body.innerHTML = '<ul pow repeat="items"><li>{{ $parent.$data.title }}: {{ text }}</li></ul>'

  pow.apply(document.body, {
    title: 'Item',
    items: [
      { text: 'One' },
      { text: 'Two' }
    ]
  })

  expect(document.body.innerHTML).toBe('<ul><li>Item: One</li><li>Item: Two</li></ul>')
})
