/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Can loop contents of a child', () => {
  document.body.innerHTML = '<div pow array="child">{{ text }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>One</div><div>Two</div><div>Three</div>')
})

test('Can loop current context', () => {
  document.body.innerHTML = '<template pow item="child"><div pow array>{{ text }}</div></template>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>One</div><div>Two</div><div>Three</div>')
})

test('Can access index in loop', () => {
  document.body.innerHTML = '{{ *index }}<div pow array="child">{{ *index }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>0</div><div>1</div><div>2</div>')
})

test('Can access "first" in loop', () => {
  document.body.innerHTML = '{{ *first }}<div pow array="child">{{ *first ? "true" : "false" }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>true</div><div>false</div><div>false</div>')
})

test('Can access "last" in loop', () => {
  document.body.innerHTML = '{{ *last }}<div pow array="child">{{ *last ? "true" : "false" }}</div>'

  pow.apply(document.body, {
    child: [
      { text: 'One' },
      { text: 'Two' },
      { text: 'Three' }
    ]
  })

  expect(document.body.innerHTML).toBe('<div>false</div><div>false</div><div>true</div>')
})

test('Can loop an object', () => {
  document.body.innerHTML = '<div pow array>{{ key }}: {{ value }}</div>'

  pow.apply(document.body, {
    'One': 1,
    'Two': 2,
    'Three': 3
  })

  expect(document.body.innerHTML).toBe('<div>One: 1</div><div>Two: 2</div><div>Three: 3</div>')
})