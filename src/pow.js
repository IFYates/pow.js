export default (() => {
    function findChildTemplates(element) {
        element.removeAttribute('pow')
        const dom = element.content ?? element
        return Array.from(dom.querySelectorAll('*[pow]:not([pow] [pow])'))
    }

    function consumeBinding(element, state) {
        const attr = ['item', 'array', 'else', 'else-if', 'else-ifnot', 'if', 'ifnot'].find($ => element.hasAttribute($))
        const path = element.getAttribute(attr)
        element.removeAttribute(attr)
        return { attr, path, value: (path && state ? resolvePath(state, path) : undefined) }
    }

    function resolvePath(state, path) {
        try {
            var value
            if (path[0] == '*') {
                state = { ...state }
                state.parent = state.parent?.data
                value = (new Function('return this.' + path.slice(1))).call(state)
            } else {
                value = (new Function('return this.' + path)).call(state.data)
            }
            if (typeof value == 'function') {
                const fn = value
                const uufn = `_${Math.random().toString(36).slice(2)}`
                globalThis.$pow$[uufn] = (el) => fn.call(el, state.data, state.root)
                return `$pow$.${uufn}(this)`
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', state.path, path, e)
        }
    }

    function updateSiblingCondition(sibling, value) {
        if (sibling?.hasAttribute('pow') && ['else-if', 'else-ifnot', 'else'].some($ => sibling.hasAttribute($))) {
            if (value) {
                sibling.remove()
                return true
            }
            const { attr, condition } = consumeBinding(sibling)
            if (attr != 'else') {
                sibling.setAttribute(attr.slice(5), condition)
            }
        }
    }

    function processElement(element, state) {
        const { attr, path, value } = consumeBinding(element, state)
        if (attr == 'if' || attr == 'ifnot') {
            const result = attr == 'if' ? !!value : !value
            while (updateSiblingCondition(element.nextElementSibling, result));
            if (!result) {
                element.remove()
                return
            }
        } else if (attr == 'item') {
            state = {
                path: state.path + '.' + (path || element.id || ''),
                data: path ? value : state.data,
                parent: path ? state : state.parent, root: state.root
            }
            if (path && state.data === undefined) {
                console.warn('Template binding without data', state.path)
                return
            }
        } else if (attr == 'array' && typeof state.data == 'object') {
            const array = Array.isArray(value) ? value
                : Object.entries(value).map(([k, v]) => ({ $key: k, $value: v }))
            for (var index = 0; index < array.length; ++index) {
                const child = element.cloneNode(true)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    path: state.path + '[' + index + ']',
                    index, first: index == 0, last: index == array.length - 1,
                    data: array[index],
                    parent: state, root: state.root
                })
            }
            element.remove()
            return
        }

        const innerTemplates = findChildTemplates(element)
        for (const childTemplate of innerTemplates) {
            processElement(childTemplate, state)
        }

        for (const { name, value } of element.attributes) {
            element.setAttribute(name, parseText(value, state))
        }
        const html = parseText(element.innerHTML, state)
        if (element instanceof HTMLTemplateElement) {
            element.outerHTML = html
        } else {
            element.innerHTML = html
        }
    }

    const _regex = /\{\{\s*(\*?[\$\w]+(\.\*?[\$\w]+)*.*?)\s*\}\}/g
    function parseText(text, state, match) {
        while (match = _regex.exec(text)) {
            const value = resolvePath(state, match[1])
            if (value === undefined) {
                console.warn('Placeholder not resolved', state.path, match[1])
            } else {
                _regex.lastIndex = match.index + `${value}`.length
            }
            text = text.substring(0, match.index) + (value ?? '') + text.slice(match.index + match[0].length)
        }
        return text
    }

    function bind(element) {
        const originalHTML = element.innerHTML
        const attributes = [...(element?.attributes || [])].map(({ name, value }) => [name, value])
        const binding = {
            remove: () => range?.deleteContents
        }
        var applying = false
        binding.apply = (data) => {
            if (applying) {
                return console.warn('Binding already in progress')
            }
            applying = true
            globalThis.$pow$ = {}
            element.innerHTML = originalHTML
            for (const [name, value] of attributes) {
                element.setAttribute(name, value)
            }
            processElement(element, { path: '$', data, root: data })
            applying = false
            return binding
        }
        return binding
    }
    return {
        apply(element, data) {
            return bind(element).apply(data)
        },
        bind
    }
})()