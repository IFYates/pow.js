test('Asynchronous interpolations resolve when available', async () => {
    document.body.innerHTML = '<div>[{{ fn }}]</div>'

    var resolveValue
    const fn = async () => await new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template>\]<\/div>/)

    const str = new Date().toString()
    await resolveValue(str)
    await resolveValue() // Second await to delay for redraw
    expect(document.body.innerHTML).toBe(`<div>[${str}]</div>`)
})

test('Asynchronous binding delay element until available', async () => {
    document.body.innerHTML = '<div>[<span pow data="{{ fn }}">{{ $data }}</span>]</div>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template>\]<\/div>/)

    const str = new Date().toString()
    await resolveValue(str)
    expect(document.body.innerHTML).toBe(`<div>[<span>${str}</span>]</div>`)
})

test('Asynchronous binding array works as expected', async () => {
    document.body.innerHTML = '<div>[<span pow array="{{ fn }}">{{ $data }}</span>]</div>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template>\]<\/div>/)

    await resolveValue([1, 2, 3])
    expect(document.body.innerHTML).toBe(`<div>[<span>1</span><span>2</span><span>3</span>]</div>`)
})

test('Asynchronous normal attribute delay element until available', async () => {
    document.body.innerHTML = '<div>[<span pow attr="{{ fn }}">inner</span>]</div>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template>\]<\/div>/)

    const str = new Date().toString()
    await resolveValue(str)
    expect(document.body.innerHTML).toBe(`<div>[<span attr="${str}">inner</span>]</div>`)
})

test('Asynchronous attribute shows "else" sibling while resolving', async () => {
    document.body.innerHTML = '<div>[<span pow attr="{{ fn }}">main</span><span pow else>loading</span>]</div>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template><span id="_\w+">loading<\/span>\]<\/div>/)

    const str = new Date().toString()
    await resolveValue(str)
    expect(document.body.innerHTML).toBe(`<div>[<span attr="${str}">main</span>]</div>`)
})

test.each([[0, 0, 'none'], [1, 0, 'first'], [0, 1, 'second']])('Asynchronous attribute pulls all siblings in for resolving', async (valA, valB, expected) => {
    document.body.innerHTML = '<div>[<span pow if="{{ valA }}">first</span><span pow else if="{{ valB }}">second</span><span pow else if>none</span><span pow else>loading</span>]</div>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { valA: fn, valB })

    expect(document.body.innerHTML).toMatch(/<div>\[<template id="_\w+"><\/template><span id="_\w+">loading<\/span>\]<\/div>/)

    const str = new Date().toString()
    await resolveValue(valA)
    expect(document.body.innerHTML).toBe(`<div>[<span>${expected}</span>]</div>`)
})

test('Asynchronous supports table row', async () => {
    document.body.innerHTML = '<table><tbody><tr pow array="{{ fn }}"><td>{{ $data }}</td></tr></tbody></table>'

    var resolveValue
    const fn = new Promise((resolve) => {
        resolveValue = resolve
    })
    pow.apply(document.body, { fn })

    expect(document.body.innerHTML).toMatch(/<table><tbody><template id="\w+"><\/template><\/tbody><\/table>/)

    await resolveValue([1, 2, 3])
    expect(document.body.innerHTML).toBe('<table><tbody><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr></tbody></table>')
})