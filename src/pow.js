/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 1.4.2
 */

const doc = document, win = window

// Resolves next pow binding
const consumeBinding = (element, bindings = ['if', 'ifnot', 'item', 'array', 'template']) => {
    for (const attr of bindings.filter($ => element.hasAttribute($))) {
        const expr = element.getAttribute(attr)
        element.removeAttribute(attr)
        return { attr, expr }
    }
    return 0
}
const nextChildTemplate = (element, selector) => (element.content ?? element).querySelectorAll(selector)

// Interpolates text templates
const parseText = (text, state) => escape(text.replace(/{{\s*(.*?)\s*}}/gs, (_, expr) => resolveExpr(expr, state) ?? ''), state.root == state.data)

// Resolves an expression to a value
const resolveExpr = (expr, state, js = expr) => {
    try {
        // If the expression starts with a star, it's accessing the state metadata
        const args = (expr[0] == '*' && (js = expr.slice(1))) ? state : state.data

        // Execute the expression as JS code, mapping to the state data
        const value = pow._eval(js, args)

        // If the result is a function, bind it for later
        if (typeof value == 'function') {
            const id = Math.random()
            win[state.id][id] = (el) => value.call(el, state.data, state.root)
            return `${state.id}[${id}](this)`
        }
        return value
    } catch (e) {
        console.warn('Interpolation failed', { '*path': state.path, expr }, e)
    }
}

// Updates the next sibling condition
const updateSiblingCondition = (sibling, value) => {
    if (sibling?.attributes.pow) {
        const { attr, expr } = consumeBinding(sibling, ['else-if', 'else-ifnot', 'else'])
        if (attr && value) {
            return !sibling.remove()
        } else if (attr && attr != 'else') {
            sibling.setAttribute(attr.slice(5), expr)
        }
    }
}
const processCondition = (element, active, always) => {
    while (updateSiblingCondition(element.nextElementSibling, active));
    return (always | !active) && element.remove()
}

const escape = (text, skip) => skip ? text : text.replace(/({|p)({|ow)/g, '$1​$2​')

const processElement = (element, state, isRoot, value) => {
    // Disable child HTML for stopped bindings
    for (const child of nextChildTemplate(element, '*[pow][stop]')) {
        child.replaceWith(doc.createRange().createContextualFragment(escape(child.outerHTML)))
    }
    
    const { attr, expr } = consumeBinding(element)

    if (attr == 'template' && (value = doc.getElementById(expr))) {
        const clone = value.cloneNode(1)
        element.parentNode.replaceChild(clone, element)
        return processElement(clone, state)
    }

    value = expr ? resolveExpr(expr, state) : state.data
    if (attr == 'if' || attr == 'ifnot') {
        return processCondition(element, (attr == 'if') != !value)
    } else if (attr == 'item' && expr) {
        if (value == null) {
            return element.remove()
        }
        state = {
            ...state,
            path: `${state.path}.${expr}`,
            data: value,
            parent: state.data
        }
    } else if (attr == 'array') {
        // TODO: (v2.0.0?) Alternative binding for inside only? Makes <ul pow each=""><li> cleaner
        value = !value || Array.isArray(value) ? value
            : Object.entries(value).map(([k, v]) => ({ key: k, value: v }))
        for (let index = 0; index < value?.length; ++index) {
            const child = element.cloneNode(1)
            element.parentNode.insertBefore(child, element)
            processElement(child, {
                ...state,
                path: `${state.path}${expr ? `.${expr}` : ''}[${index}]`,
                index, first: !index, last: index > value.length - 2,
                data: value[index],
                parent: state
            })
        }
        return processCondition(element, value?.length, 1)
    }

    element.removeAttribute('pow')

    // Process every child 'pow' template
    while (value = nextChildTemplate(element, '*[pow]:not([pow] [pow])')[0]) {
        processElement(value, state)
    }

    // Interpolate attributes
    for (let { name, value } of [...element.attributes]) {
        if (name[0] == ':') {
            element.removeAttribute(name)
            if (value = resolveExpr(value, state)) {
                element.setAttribute(name.slice(1), escape(value, isRoot))
            }
        } else if (value = parseText(value, state)) {
            element.setAttribute(name, value)
        } else {
            element.removeAttribute(name)
        }
    }

    // Parse inner HTML
    value = parseText(element.innerHTML, state)
    if (element.tagName == 'TEMPLATE') {
        element.insertAdjacentHTML('afterend', value)
        element.remove()
    } else {
        element.innerHTML = value
    }
}

const bind = (element) => {
    const originalHTML = element.innerHTML
    const attributes = [...element.attributes]
    const id = `$pow_${Math.random().toString(36).slice(2)}`
    const binding = {
        apply: (data) => {
            if (binding.$pow) {
                return console.warn('Binding already in progress')
            }
            binding.$pow = 1

            // Reset global state
            element.innerHTML = originalHTML
            attributes.forEach($ => element.setAttribute($.name, $.value))
            win[id] = {}

            try {
                processElement(element, { id, path: '*root', data, root: data }, 1)
            } finally {
                delete binding.$pow
            }
            element.innerHTML = element.innerHTML.replace(/​/g, '')

            binding.refresh = () => binding.apply(data)
            return binding
        },
        refresh: () => { }
    }
    return binding
}
const pow = {
    apply(element, data) {
        return bind(element).apply(data)
    },
    bind,
    _eval: (expr, ctxt) => {
        const args = Object.entries(ctxt || {}).filter($ => isNaN($[0]))
        return (new Function(...args.map($ => $[0]), `return ${expr}`)).call(ctxt, ...args.map($ => $[1]))
    }
}
export default pow