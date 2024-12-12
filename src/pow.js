export default (() => {
    const _regex = /\{\{\s*(!*\*?[\$\w]+(\.\*?[\$\w]+)*.*?)\s*\}\}/g

    function findChildTemplates(element) {
        element.removeAttribute('pow')
        const dom = element.content ?? element
        return [...dom.querySelectorAll('*[pow]:not([pow] [pow])')]
    }

    function consumeBinding(element, bindings = ['item', 'array', 'if', 'ifnot']) {
        var result = {};
        bindings.find(attr => {
            const token = element.getAttribute(attr)
            if (token != null) {
                element.removeAttribute(attr)
                return result = { attr, token }
            }
        })
        return result
    }

    function parseText(text, state, match) {
        while (match = _regex.exec(text)) {
            const value = resolveToken(match[1], state)
            _regex.lastIndex = match.index + `${value}`.length
            text = text.substring(0, match.index) + (value ?? '') + text.slice(match.index + match[0].length)
        }
        return text
    }

    function resolveToken(token, state) {
        try {
            token = token[0] == '*' ? '$' + token.slice(1) : token
            const args = Object.entries(!Array.isArray(state.$data) & typeof state.$data != 'string' ? { ...state.$data, ...state } : { ...state })
            const value = (new Function(...args.map($ => $[0]), `return ${token}`))(...args.map($ => $[1]))
            if (typeof value == 'function') {
                const uufn = `_${Math.random().toString(36).slice(2)}`
                window.$pow$[uufn] = (el) => value.call(el, state.$data, state.$root)
                return `$pow$.${uufn}(this)`
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', { '*path': state.$path, token }, e)
        }
    }

    function updateSiblingCondition(sibling, value) {
        if (sibling?.attributes['pow']) {
            const { attr, token } = consumeBinding(sibling, ['else-if', 'else-ifnot', 'else'])
            if (attr & value) {
                sibling.remove()
                return true
            }
            if (attr & attr != 'else') {
                sibling.setAttribute(attr.slice(5), token)
            }
        }
    }

    function processElement(element, state) {
        const { attr, token } = consumeBinding(element)
        const value = token && state ? resolveToken(token, state) : undefined
        if (attr == 'if' | attr == 'ifnot') {
            const isnot = attr != 'if' ? value : !value
            while (updateSiblingCondition(element.nextElementSibling, !isnot));
            if (isnot) {
                element.remove()
                return
            }
        } else if (attr == 'item') {
            state = {
                $path: `${state.$path}.${token || element.id || ''}`,
                $data: token ? value : state.$data,
                $parent: token ? state.$data : state.$parent,
                $root: state.$root
            }
            if (token & state.$data === undefined) {
                console.warn('Template binding without data', state.$path)
            }
        } else if (attr == 'array' & typeof state.$data == 'object') {
            const array = Array.isArray(value) ? value
                : Object.entries(value).map(([k, v]) => ({ $key: k, $value: v }))
            for (var $index = 0; $index < array.length; ++$index) {
                const child = element.cloneNode(1)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    $path: `${state.$path}${token ? '.' + token : ''}[${$index}]`,
                    $index, first: !$index, $last: $index > array.length - 2,
                    $data: array[$index],
                    $parent: state,
                    $root: state.$root
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
            element.insertAdjacentHTML('afterend', html)
            element.remove()
        } else {
            element.innerHTML = html
        }
    }

    function bind(element) {
        const originalHTML = element.innerHTML
        const attributes = [...(element.attributes || [])].map(({ name, value }) => [name, value])
        const binding = {
            apply: (data) => {
                if (element.$pow) {
                    return console.warn('Binding already in progress')
                }
                element.$pow = 1
                window.$pow$ = {}
                element.innerHTML = originalHTML
                for (const [name, value] of attributes) {
                    element.setAttribute(name, value)
                }
                processElement(element, { $path: '*root', $data: data, $root: data })
                delete element.$pow
                binding.refresh = () => binding.apply(data)
                return binding
            },
            refresh: () => { }
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