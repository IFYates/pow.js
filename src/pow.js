// TODO: functions, recursive parsing?
export default (() => {
    function findChildTemplates(element) {
        element.removeAttribute('pow')
        const dom = element.content ?? element
        return Array.from(dom.querySelectorAll('*[pow]:not([pow] [pow])'))
    }

    function consumeBinding(element, state, resolve = false) {
        const attr = ['item', 'array', 'else', 'else-if', 'else-ifnot', 'if', 'ifnot'].find($ => element.hasAttribute($))
        const path = element.getAttribute(attr)
        const value = path && resolve ? resolvePath(state, path) : undefined
        console.debug(state?.path, element.tagName, attr, path, value)
        element.removeAttribute(attr)
        return { attr, path, value }
    }

    function resolvePath(state, path) {
        const parts = path?.split('.') ?? []
        for (var i = 0; i < parts.length; ++i) {
            const part = parts[i]
            if (['*first', '*index', '*last', '*parent', '*path', '*root'].includes(part)) {
                state = { data: state[part.slice(1)] }
            } else if (part == '*index1') {
                state = { data: state.index != null ? state.index + 1 : undefined }
            } else if (part == '*true' || part == '*false') {
                state = { data: part == '*true' }
            } else if (part && state.data?.hasOwnProperty(part)) {
                state = { data: state.data[part] }
            } else if (part == 'length' && !Array.isArray(state.data)) {
                state = { data: Object.keys(state.data).length }
            } else if (part != '*data') {
                return undefined
            }
        }
        return path ? state.data : undefined
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
        const { attr, path, value } = consumeBinding(element, state, true)
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
            const array = value instanceof Array ? value
                : Object.entries(value).map(([k, v]) => ({ $key: k, $value: v }))
            const html = element.innerHTML
            for (var index = 0; index < array.length; ++index) {
                element.innerHTML = html
                processElement(element, {
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
            childTemplate.remove()
        }

        element.innerHTML = replacePlaceholders(element.innerHTML, state)
    }

    const _regex = /\{\{\s*((?:\*)?[\$\w]+(?:\.(?:\*)?[\$\w]+)*)\s*\}\}/g
    function replacePlaceholders(html, state) {
        var match
        while (match = _regex.exec(html)) {
            var value = resolvePath(state, match[1])
            if (value === undefined) {
                console.warn('Placeholder not resolved', state.path, match[1])
            } else {
                if (typeof value == 'function' && match.index > 2 && html.slice(match.index - 2, match.index) == '="' && html[match.index + match[0].length] == '"') {
                    const fn = value
                    const uufn = `$pow$${Math.random().toString(36).slice(2)}`
                    globalThis[uufn] = (el) => fn.call(el, state.data, state.root)
                    value = `${uufn}(this)`
                }
                _regex.lastIndex = match.index + `${value}`.length
            }
            html = html.substring(0, match.index) + (value != null ? value : '') + html.slice(match.index + match[0].length)
        }
        return html
    }

    function bind(element) {
        const originalHTML = element.innerHTML
        // const range = document.createRange()
        // range.setStart(element.parentNode, 0)
        // range.setEndAfter(element.parentNode, element.parentNode.childNodes.length)
        // console.log(range.toString())
        // globalThis.R = range
        const binding = {
            remove: () => range?.deleteContents
        }
        binding.apply = (data) => {
            // range?.deleteContents()
            // range.insertNode(range.createContextualFragment(originalHtml))
            element.innerHTML = originalHTML
            processElement(element, { path: '$', data, root: data })
            // console.log(range.toString())
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