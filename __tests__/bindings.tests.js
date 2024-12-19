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
  document.body.innerHTML = '<div pow item="child">{{ $path }}</div>'

  pow.apply(document.body, { child: {} })

  expect(document.body.innerHTML).toBe('<div>$root.child</div>')
})

test('Can access parent from child context', () => {
  document.body.innerHTML = '<div pow item="child">{{ $parent.text }}</div>'

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

test('Binding to unknown key removes element with warning', () => {
  document.body.innerHTML = '<div pow item="child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, {})

  expect(consoleWarnMock.mock.calls).toHaveLength(1)
  expect(consoleWarnMock.mock.calls[0][0]).toBe('Interpolation failed')
  expect(document.body.innerHTML).toBe('')
})

test('Binding to unknown this key removes element without warning', () => {
  document.body.innerHTML = '<div pow item="this.child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, {})

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('')
})

test.each([null, undefined])('Binding to null data removes element without warning', (value) => {
  document.body.innerHTML = '<div pow item="child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { child: value })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('')
})

test('Can stop parsing of elements', () => {
  document.body.innerHTML = '{{ $path }}<div pow stop attr="{{ $path }}">{{ $path }} <div pow item="child">{{ $path }}</div></div>{{ $path }}'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { child: {} })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('$root<div pow="" stop="" attr="{{ $path }}">{{ $path }} <div pow="" item="child">{{ $path }}</div></div>$root')
})

test('Can have subsequent bindings of stopped child', () => {
  document.body.innerHTML = '{{ text }}<div pow stop id="child">{{ text }}</div>{{ text }}'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { text: 'root' })
  pow.apply(document.getElementById('child'), { text: 'child' })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('root<div id="child">child</div>root')
})

test('Failure does not block next binding', () => {
  document.body.innerHTML = '<div pow :$bad="fail">{{ text }}</div>'

  let failed = false
  const binding = pow.bind(document.body)
  try {
    binding.apply({ fail: true, text: 'Hello, world!' })
  } catch {
    failed = true
  }
  binding.apply({ text: 'Hello, world!' })

  expect(failed).toBe(true)
  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})