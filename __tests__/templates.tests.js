test('Replaces root template', () => {
  document.body.innerHTML = '<template id="main">{{ text }}</template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.outerHTML).toBe('<body>Hello, world!</body>')
})

test('Replaces child template', () => {
  document.body.innerHTML = '<div id="main"><template pow>{{ text }}</template></div>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main">Hello, world!</div>')
})

test('Replaces template contents repeated for loop', () => {
  document.body.innerHTML = '<div id="main"><template pow array="list">{{ $data }}, </template></div>'

  const target = document.getElementById('main')
  pow.apply(target, { list: [1, 2, 3, 4, 5] })

  expect(document.body.innerHTML).toBe('<div id="main">1, 2, 3, 4, 5, </div>')
})

test('Can reference existing template', () => {
  document.body.innerHTML = '<div id="main">'
    + '<template pow template="text-view"></template>'
    + '</div>'
    + '<template id="text-view">{{ text }}</template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main">Hello, world!</div>'
    + '<template id="text-view">{{ text }}</template>')
})

test('Parses else sibling if no match', () => {
  document.body.innerHTML = '<div id="main">'
    + '<template pow template="text-view"></template>'
    + '<template pow else>No match</template>'
    + '</div>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main">No match</div>')
})

test('Ignores else sibling if match', () => {
  document.body.innerHTML = '<div id="main">'
    + '<template pow template="text-view"></template>'
    + '<template pow else>No match</template>'
    + '</div>'
    + '<template id="text-view">{{ text }}</template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main">Hello, world!</div>'
    + '<template id="text-view">{{ text }}</template>')
})

test.each([[true, '1, 2, 3, 4, 5, '], [false, '']])('Template processed after other bindings', (condition, expected) => {
  document.body.innerHTML = '<template id="main">'
    + '<template pow if="check" array="list" template="list-view"></template>'
    + '</template>'
    + '<template id="list-view">{{ $data }}, </template>'

  const target = document.getElementById('main')
  pow.apply(target, { check: condition, list: [1, 2, 3, 4, 5] })

  expect(document.body.innerHTML).toBe(expected + '<template id="list-view">{{ $data }}, </template>')
})

test('Can process stop in existing template', () => {
  document.body.innerHTML = '<div id="main"><template pow template="text-view"></template></div><template id="text-view"><div pow stop>{{ text }}</div></template>'

  const target = document.getElementById('main')
  pow.apply(target, { text: 'Hello, world!' })

  expect(document.body.innerHTML).toBe('<div id="main"><div pow="" stop="">{{ text }}</div></div><template id="text-view"><div pow="" stop="">{{ text }}</div></template>')
})

test('Can include single subcontent in template', () => {
  document.body.innerHTML = `<div pow template="test">
  <template>my sub content</template>
</div>
<template id="test">[<param>]</template>`

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe(`<div>[my sub content]</div>
<template id="test">[<param>]</template>`)
})

test('Can include named subcontents in template', () => {
  document.body.innerHTML = `<div pow template="test">
  <template id="text1">my sub content</template>
  <template id="text2">second content</template>
</div>
<template id="test">[<param id="text1">, <param id="text2">]</template>`

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe(`<div>[my sub content, second content]</div>
<template id="test">[<param id="text1">, <param id="text2">]</template>`)
})

test('Undefined + unnamed subcontent in template uses while content', () => {
  document.body.innerHTML = '<div pow template="test">content</div>'
    + '<template id="test">[<param>]</template>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>[content]</div>'
    + '<template id="test">[<param>]</template>')
})

test('Undefined named subcontent in template is blank', () => {
  document.body.innerHTML = '<div pow template="test">content</div>'
    + '<template id="test">[<param id="missing">]</template>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>[]</div>'
    + '<template id="test">[<param id="missing">]</template>')
})

test('Subcontent does not work in unmatched template', () => {
  document.body.innerHTML = '<div pow template="test">'
    + '<template id="text1">my sub content</template>'
    + '<template id="text2">second content</template>'
    + '</div>'
    + '<div pow else>'
    + '[<param id="text2">, <param>]'
    + '</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>'
    + '[<param id="text2">, <param>]'
    + '</div>')
})