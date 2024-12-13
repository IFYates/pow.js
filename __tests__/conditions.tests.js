/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'

test('Each condition group is distinct', () => {
  document.body.innerHTML = '<div pow if="true">1</div><div pow if="true">2</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>1</div><div>2</div>')
})

test('Ignores "else*" conditions on success', () => {
  document.body.innerHTML = '<div pow if="true">1</div><div pow else-if="false">2</div><div pow else>3</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>1</div>')
})

test('Uses first "else-if" conditions on success', () => {
  document.body.innerHTML = '<div pow if="false">1</div><div pow else-if="true">2</div><div pow else>3</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>2</div>')
})

test('Falls through to "else" on all other failures', () => {
  document.body.innerHTML = '<div pow if="false">1</div><div pow else-if="false">2</div><div pow else>3</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>3</div>')
})

test('Falls through to "else" on all other failures (ifnot)', () => {
  document.body.innerHTML = '<div pow ifnot="true">1</div><div pow else-ifnot="true">2</div><div pow else>3</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>3</div>')
})
