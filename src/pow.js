/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 1.0.1
 */
export default (() => {
    function findChildTemplates(element) {
        element.removeAttribute('pow')
        const dom = element.content ?? element
        return [...dom.querySelectorAll('*[pow]:not([pow] [pow])')]
    }

    function consumeBinding(element, bindings = ['item', 'array', 'if', 'ifnot']) {
        for (const attr of bindings) {
            const token = element.getAttribute(attr)
            if (token != null) {
                element.removeAttribute(attr)
                return { attr, token }
            }
        }
        return {}
    }

    const _regex = /\{\{\s*(!*\*?[\$\w]+(\.\*?[\$\w]+)*.*?)\s*\}\}/g
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
            const args = !Array.isArray(state.data) && typeof state.data != 'string' ? Object.entries({ ...state.data }) : []
            args.push(['$', state])
            const js = `return ${token[0] == '*' ? '$.' + token.slice(1) : token}`
            const value = (new Function(...args.map($ => $[0]), js))(...args.map($ => $[1]))
            if (typeof value == 'function') {
                const uufn = `_${Math.random().toString(36).slice(2)}`
                window.$pow$[uufn] = (el) => value.call(el, state.data, state.root)
                return `$pow$.${uufn}(this)`
            }
            return value
        } catch (e) {
            console.warn('Interpolation failed', { '*path': state.path, token }, e)
        }
    }

    function updateSiblingCondition(sibling, value) {
        if (sibling?.attributes.pow) {
            const { attr, token } = consumeBinding(sibling, ['else-if', 'else-ifnot', 'else'])
            if (attr && value) {
                sibling.remove()
                return true
            }
            if (attr && attr != 'else') {
                sibling.setAttribute(attr.slice(5), token)
            }
        }
    }

    function processElement(element, state) {
        const { attr, token } = consumeBinding(element)
        const value = token && state ? resolveToken(token, state) : state.data
        if (attr == 'if' || attr == 'ifnot') {
            while (updateSiblingCondition(element.nextElementSibling, (attr == 'if') != !value));
            if ((attr == 'if') == !value) {
                return element.remove()
            }
        } else if (attr == 'item' && token) {
            state = {
                path: `${state.path}.${token}`,
                data: value,
                parent: state.data,
                root: state.root
            }
        } else if (attr == 'array' && typeof value == 'object') {
            const array = Array.isArray(value) ? value
                : Object.entries(value).map(([k, v]) => ({ key: k, value: v }))
            for (let index = 0; index < array.length; ++index) {
                const child = element.cloneNode(1)
                element.parentNode.insertBefore(child, element)
                processElement(child, {
                    path: `${state.path}${token ? `.${token}` : ''}[${index}]`,
                    index, first: !index, last: index > array.length - 2,
                    data: array[index],
                    parent: state,
                    root: state.root
                })
            }
            return element.remove()
        }

        // Process any child 'pow' templates
        for (const childTemplate of findChildTemplates(element)) {
            processElement(childTemplate, state)
        }

        // Interpolate attributes
        for (const { name, value } of element.attributes) {
            element.setAttribute(name, parseText(value, state))
        }

        // Parse inner HTML
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
        const attributes = [...element.attributes]
        const binding = {
            apply: (data) => {
                if (binding.$pow) {
                    return console.warn('Binding already in progress')
                }
                binding.$pow = 1
                window.$pow$ = {}
                element.innerHTML = originalHTML
                for (const { name, value } of attributes) {
                    element.setAttribute(name, value)
                }
                processElement(element, { path: '*root', data, root: data })
                delete binding.$pow
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