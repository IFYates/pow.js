test('Each condition group is distinct', () => {
  document.body.innerHTML = '<div pow if="true">1</div><div pow if="true">2</div>'

  pow.apply(document.body)

  expect(document.body.innerHTML).toBe('<div>1</div><div>2</div>')
})

test.each([ true, 1, 'string', [], {} ])('IF truthy', (value) => {
  document.body.innerHTML = '<div pow if="value">Yes</div><div pow else>No</div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div>Yes</div>')
})

test.each([ null, undefined, false, 0, '' ])('IF falsy', (value) => {
  document.body.innerHTML = '<div pow if="value">No</div><div pow else>Yes</div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div>Yes</div>')
})

test.each([ true, 1, 'string', [], {} ])('IFNOT truthy', (value) => {
  document.body.innerHTML = '<div pow ifnot="value">No</div><div pow else>Yes</div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div>Yes</div>')
})

test.each([ null, undefined, false, 0, '' ])('IFNOT falsy', (value) => {
  document.body.innerHTML = '<div pow ifnot="value">Yes</div><div pow else>No</div>'

  pow.apply(document.body, { value })

  expect(document.body.innerHTML).toBe('<div>Yes</div>')
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

test.each([ [1], [2], [3] ])('Conditions work fully with template elements', (value) => {
  document.body.innerHTML = '<template pow if="$data === 1">1</template><template pow else-if="$data === 2">2</template><template pow else>3</template>'

  pow.apply(document.body, value)

  expect(document.body.innerHTML).toBe(`${value}`)
})
