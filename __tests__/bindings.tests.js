test('Can bind to child context', () => {
  document.body.innerHTML = '<div pow data="child">{{ text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, child!</div>')
})

test('Can access context path', () => {
  document.body.innerHTML = '<div pow data="child">{{ $path }}</div>'

  pow.apply(document.body, { child: {} })

  expect(document.body.innerHTML).toBe('<div>$root.child</div>')
})

test('Can access parent from child context', () => {
  document.body.innerHTML = '<div pow data="child">{{ $parent.text }}</div>'

  pow.apply(document.body, { text: 'Hello, parent!', child: { text: 'Hello, child!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, parent!</div>')
})

test('Parent does not modify child context', () => {
  document.body.innerHTML = '<div pow data="child">{{ $data.text }}</div>'

  pow.apply(document.body, { text: 'Hello, parent!', child: { } })

  expect(document.body.innerHTML).toBe('<div></div>')
})

test('Binding context applies to children', () => {
  document.body.innerHTML = '{{ context }} <div pow data="child" attr="{{ context }}">{{ context }}</div> {{ context }}'

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
  document.body.innerHTML = '<div pow data="child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, {})

  expect(consoleWarnMock.mock.calls).toHaveLength(1)
  expect(consoleWarnMock.mock.calls[0][0]).toBe('Interpolation failed')
  expect(document.body.innerHTML).toBe('')
})

test('Binding to unknown this key removes element without warning', () => {
  document.body.innerHTML = '<div pow data="this.child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, {})

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('')
})

test.each([null, undefined])('Binding to null data removes element without warning', (value) => {
  document.body.innerHTML = '<div pow data="child">DO NOT SHOW</div>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { child: value })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('')
})

test.each([null, undefined])('Binding to null data renders else sibling', (value) => {
  document.body.innerHTML = '<div pow data="child">DO NOT SHOW</div>'
    + '<div pow else>No child</div>'

  pow.apply(document.body, { child: value })

  expect(document.body.innerHTML).toBe('<div>No child</div>')
})

test('else sibling not rendered on valid binding', () => {
  document.body.innerHTML = '<div pow data="child">{{ $data }}</div>'
    + '<div pow else>No child</div>'

  pow.apply(document.body, { child: 'OK' })

  expect(document.body.innerHTML).toBe('<div>OK</div>')
})

test('Can stop parsing of elements', () => {
  document.body.innerHTML = '{{ $path }}<div pow stop attr="{{ $path }}">{{ $path }} <div pow data="child">{{ $path }}</div></div>{{ $path }}'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { child: {} })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('$root<div pow="" stop="" attr="{{ $path }}">{{ $path }} <div pow="" data="child">{{ $path }}</div></div>$root')
})

test('Can stop parsing of child elements', () => {
  document.body.innerHTML = '<template pow>{{ $path }}<div pow stop attr="{{ $path }}">{{ $path }} <div pow data="child">{{ $path }}</div></div>{{ $path }}</template>'

  const consoleWarnMock = jest.spyOn(console, 'warn')
    .mockImplementation(() => { })

  pow.apply(document.body, { child: {} })

  expect(consoleWarnMock.mock.calls).toHaveLength(0)
  expect(document.body.innerHTML).toBe('$root<div pow="" stop="" attr="{{ $path }}">{{ $path }} <div pow="" data="child">{{ $path }}</div></div>$root')
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

test('Binding order is important', () => {
  document.body.innerHTML = '<div pow if="text == \'Parent\'" data="child">{{ text }}</div><div pow data="child" if="text == \'Child\'">{{ text }}</div>'

  pow.apply(document.body, { text: 'Parent', child: { text: 'Child' } })

  expect(document.body.innerHTML).toBe('<div>Child</div><div>Child</div>')
})

test('Transform binding can change whole element', () => {
  document.body.innerHTML = '<div pow transform="toSpan">Original</div>'

  window.toSpan = function (element, context) {
    element.outerHTML = '<span>' + context.$path + '</span>'
  }

  pow.apply(document.body)

  delete window.toSpan

  expect(document.body.innerHTML).toBe('<span>$root</span>')
})

test.each([ ['toSpan'], ["'(el) => el.outerHTML = ``'"], ["{{ '(el) => el.outerHTML = ``' }}"] ])('Transform binding ignores non-function values', (expr) => {
  document.body.innerHTML = `<div pow transform="${expr}">Original</div>`

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>Original</div>')
})