test.each([ ['$data'], ['this'] ])('Self interpolation', (expr) => {
  document.body.innerHTML = `<div>{{ ${expr} }}</div>`

  pow.apply(document.body, 'Hello, world!')

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Key interpolation', () => {
  document.body.innerHTML = '<div>{{ text }}</div>'

  pow.apply(document.body, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Deep interpolation', () => {
  document.body.innerHTML = '<div>{{ child.text }}</div>'

  pow.apply(document.body, { child: { text: 'Hello, world!' } })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Interpolated values are not double-interpolated', () => {
  document.body.innerHTML = '<div pow array="list">{{ $data }}</div>'

  pow.apply(document.body, { list: ['{{ text }}'] })

  expect(document.body.innerHTML).toBe('<div>{{ text }}</div>')
})

test('Array length interpolation', () => {
  document.body.innerHTML = '<div>{{ data.length }}</div>'

  pow.apply(document.body, { data: [1, 2, 3] })

  expect(document.body.innerHTML).toBe('<div>3</div>')
})

test.each([ true, false ])('Boolean interpolation', (bool) => {
  document.body.innerHTML = '<div>{{ data }}</div>'

  pow.apply(document.body, { data: bool })

  expect(document.body.innerHTML).toBe(`<div>${bool ? 'true' : 'false'}</div>`)
})

test('Function result interpolation', () => {
  document.body.innerHTML = '<div>{{ func(name) }}</div>'

  pow.apply(document.body, { name: 'world', func: (name) => 'Hello, ' + name + '!' })

  expect(document.body.innerHTML).toBe('<div>Hello, world!</div>')
})

test('Function interpolation', () => {
  document.body.innerHTML = '<div>{{ fn }}</div>'

  pow.apply(document.body, { fn: () => {} })

  const bindingKeys = Object.keys(window).filter($ => $.startsWith('$pow_'))
  expect(bindingKeys.length).toBe(1)
  const fn = Object.keys(window[bindingKeys[0]])[0]
  expect(typeof window[bindingKeys[0]][fn]).toBe('function')
  expect(document.body.innerHTML).toBe(`<div>${bindingKeys[0]}[${fn}](this)</div>`)
})

test('Functions are not removed from unrelated binding', () => {
  document.body.innerHTML = '<div id="bind1">{{ fn }}</div><div id="bind2">{{ fn }}</div>'

  const bind1 = document.getElementById('bind1')
  pow.apply(bind1, { fn: () => {} })
  
  let bindingKeys = Object.keys(window).filter($ => $.startsWith('$pow_'))
  expect(bindingKeys.length).toBe(1)
  expect(Object.keys(window[bindingKeys[0]]).length).toBe(1)
  const fn1 = Object.keys(window[bindingKeys[0]])[0]

  const bind2 = document.getElementById('bind2')
  pow.apply(bind2, { fn: () => {} })
  
  bindingKeys = Object.keys(window).filter($ => $.startsWith('$pow_'))
  expect(bindingKeys.length).toBe(2)
  expect(Object.keys(window[bindingKeys[1]]).length).toBe(1)
  const fn2 = Object.keys(window[bindingKeys[1]])[0]

  expect(`${bindingKeys[0]}[${fn1}]`).not.toBe(`${bindingKeys[1]}[${fn2}]`)
  expect(typeof window[bindingKeys[0]][fn1]).toBe('function')
  expect(typeof window[bindingKeys[1]][fn2]).toBe('function')
})

test('Custom eval interpolation', () => {
  document.body.innerHTML = '[{{ text }}, {{ number }}, {{ fn }}]'

  const originalEval = pow._eval
  
  pow._eval = () => 'eval'
  pow.apply(document.body, { text: 'Hello, world!', number: 123, fn: () => {} })

  pow._eval = originalEval

  expect(document.body.innerHTML).toBe(`[eval, eval, eval]`)
})