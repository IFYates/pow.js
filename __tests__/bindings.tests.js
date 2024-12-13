/**
 * @jest-environment jsdom
 */
import pow from '../src/pow.js'
import { jest } from '@jest/globals'

test('Can bind to child context', () => {
  document.body.innerHTML = '<div pow item="child">{{ text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, child!</div>')
})

test('Can access context path', () => {
  document.body.innerHTML = '<div pow item="child">{{ *path }}</div>'

  pow.apply(document.body, { child: { } })

  expect(document.body.innerHTML).toBe('<div>*root.child</div>')
})

test('Can access parent from child context', () => {
  document.body.innerHTML = '<div pow item="child">{{ *parent.text }}</div>'

  pow.apply(document.body, { text: 'Hello, parent!', child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, parent!</div>')
})

test('Binding context applies to children', () => {
  document.body.innerHTML = '{{ context }} <div pow item="child" attr="{{ context }}">{{ context }}</div> {{ context }}'

  pow.apply(document.body, { context: 'parent', child: { context: 'child' } })

  expect(document.body.innerHTML).toBe('parent <div attr="child">child</div> parent')
})

test('Binding refresh is NOOP before first apply', () => {
  document.body.innerHTML = '{{ refresh() }}'

  const binding = pow.bind(document.body)
  binding.refresh()

  expect(document.body.innerHTML).toBe('{{ refresh() }}')
})

test('Applying bindings while being applied raises warning', () => {
  document.body.innerHTML = '{{ refresh() }}'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  const binding = pow.bind(document.body)
  binding.apply({ refresh: () => binding.refresh() })
  binding.refresh()

  expect(consoleWarnMock.mock.calls).toHaveLength(1)
  expect(consoleWarnMock.mock.calls[0][0]).toBe('Binding already in progress')
  expect(document.body.innerHTML).toBe('')
})

test('Warned when applying binding for unknown key', () => {
  document.body.innerHTML = '<div pow item="child">{{ *path }} = [{{ *data }}]</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  const binding = pow.bind(document.body)
  binding.apply({ })

  expect(consoleWarnMock.mock.calls).toHaveLength(1)
  expect(consoleWarnMock.mock.calls[0][0]).toBe('Interpolation failed')
  expect(document.body.innerHTML).toBe('<div>*root.child = []</div>')
})

test.each([ null, undefined ])('Not warned when applying binding for missing data', (value) => {
  document.body.innerHTML = '<div pow item="child">{{ *path }} = [{{ *data }}]</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  const binding = pow.bind(document.body)
  binding.apply({ child: value })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('<div>*root.child = []</div>')
})