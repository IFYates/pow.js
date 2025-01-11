test('Section can be refreshed to have new value', () => {
  document.body.innerHTML = '<div>{{ text }}</div><div pow section="test">{{ text }}</div>'

  const data = { text: 'Hello, world!' }
  const binding = pow.apply(document.body, data)

  data.text = 'Hello, others!'
  const rebind = binding.sections.test()

  expect(rebind).toBe(binding)
  expect(document.body.innerHTML).toMatch(/^<div>Hello, world!<\/div><div id="\w+">Hello, others!<\/div>$/)
})

test('Section can be refreshed with new data', () => {
  document.body.innerHTML = '<div>{{ text }}</div><div pow section="test">{{ text }}</div>'

  const data = { text: 'Hello, world!' }
  const binding = pow.apply(document.body, data)
  binding.sections.test({ text: 'Hello, others!' })

  expect(document.body.innerHTML).toMatch(/^<div>Hello, world!<\/div><div id="\w+">Hello, others!<\/div>$/)
})

test('Refreshing a changed section keeps the new data', () => {
  document.body.innerHTML = '<div>{{ text }}</div><div pow section="test">{{ text }}</div>'

  const data = { text: 'Hello, world!' }
  const binding = pow.apply(document.body, data)
  binding.sections.test({ text: 'Hello, others!' })
  binding.sections.test()

  expect(document.body.innerHTML).toMatch(/^<div>Hello, world!<\/div><div id="\w+">Hello, others!<\/div>$/)
})

test('Section will maintain existing id', () => {
  document.body.innerHTML = '<div>{{ text }}</div><div pow section="test" id="my-id">{{ text }}</div>'

  const binding = pow.apply(document.body, { text: 'Hello, world!' })
  binding.sections.test({ text: 'Hello, others!' })

  expect(document.body.innerHTML).toMatch('<div>Hello, world!</div><div id="my-id">Hello, others!</div>')
})

test('Section is restored when parent refreshed', () => {
  document.body.innerHTML = '<div>{{ text }}</div><div pow section="test">{{ text }}</div>'

  const data = { text: 'Hello, world!' }
  const binding = pow.apply(document.body, data)
  binding.sections.test({ text: 'Hello, others!' })
  binding.refresh()

  expect(document.body.innerHTML).toMatch(/^<div>Hello, world!<\/div><div id="\w+">Hello, world!<\/div>$/)
})

test('Section added by rebind is available', () => {
  document.body.innerHTML = '<div pow section="top">'
    + '<template pow if="this.text"><div pow section="sub">'
    + '{{ text }}'
    + '</div></template>'
    + '<template pow else>None</template>'
    + '</div>'

  const binding = pow.apply(document.body)
  const first = document.body.innerHTML
  const rebind1 = binding.sections.sub
  const rebind2 = binding.sections.top({ text: 'Two' })
  const second = document.body.innerHTML
  const rebind3 = binding.sections.sub({ text: 'Three' })

  expect(first).toMatch(/^<div id="\w+">None<\/div>$/)
  expect(rebind1).toBeFalsy()
  expect(rebind2).toBeTruthy()
  expect(second).toMatch(/^<div id="\w+"><div id="\w+">Two<\/div><\/div>$/)
  expect(rebind3).toBeTruthy()
  expect(document.body.innerHTML).toMatch(/^<div id="\w+"><div id="\w+">Three<\/div><\/div>$/)
})

test('Can dynamically name sections', () => {
  document.body.innerHTML = '<template pow array="$data"><div pow :section="\'sect_\' + key">{{ value }}</div></template>'

  const data = { a: 'One', b: 'Two' }
  const binding = pow.apply(document.body, data)
  binding.sections.sect_b({ value: 'Three' })

  expect(document.body.innerHTML).toMatch(/^<div id="\w+">One<\/div><div id="\w+">Three<\/div>$/)
})