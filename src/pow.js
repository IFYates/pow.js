/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 2.0.0
 */

const _attribute = { set: (element, name, value) => element.setAttribute(name, value), remove: (element, name) => element.removeAttribute(name) }
const _rand = Math.random
const _selectChild = (element, selector) => (element.content ?? element).querySelectorAll(selector)
const B_ARRAY = 'array', B_DATA = 'data', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot', B_TEMPLATE = 'template'
const ATTR_POW = 'pow', INN_HTML = 'innerHTML'

// Interpolates text templates
const parseText = (text, state, isRoot) => escape(text.replace(/{{\s*(.*?)\s*}}/gs, (_, expr) => resolveExpr(expr, state) ?? ''), isRoot)
const escape = (text, isRoot) => isRoot ? text : text.replace(/({|p)({|ow)/g, '$1​$2​')

// Resolves an expression to a value
const resolveExpr = (expr, state, context = getContext(state)) => {
    try {
        // Execute the expression as JS code, mapping to the state data
        const value = pow._eval(expr, context)

        // If the result is a function, bind it for later
        if (typeof value == 'function') {
            const id = _rand()
            window[state.$id][id] = (el) => value.call(el, context)
            return state.$id + '[' + id + '](this)'
        }
        return value
    } catch (e) {
        console.warn('Interpolation failed', { $path: state.$path, expr }, e)
    }
}
const getContext = (state) => (state.$parent ? { ...state.$data, ...state, $parent: getContext(state.$parent) } : { ...state.$data, ...state })

// Updates the next sibling condition
const updateSiblingCondition = (sibling, active) => {
    if (sibling?.attributes.pow) {
        for (const { name, value } of sibling.attributes) {
            if ([B_ELSE + '-' + B_IF, B_ELSE + '-' + B_IFNOT, B_ELSE].includes(name)) {
                _attribute.remove(sibling, name)
                if (active) {
                    return !sibling.remove()
                } else if (name != B_ELSE) {
                    _attribute.set(sibling, name.slice(5), value) // Convert to if/ifnot
                }
            }
        }
    }
}
const processCondition = (element, active, always) => {
    while (updateSiblingCondition(element.nextElementSibling, active));
    return (always | !active) && element.remove()
}

const processElement = (element, state, isRoot, val) => {
    // Disable child HTML for stopped bindings
    for (const child of _selectChild(element, '*[pow][stop]')) {
        child.replaceWith(document.createRange().createContextualFragment(escape(child.outerHTML)))
    }

    _attribute.remove(element, ATTR_POW)

    // Process each attribute in order
    for (const { name, value } of [...element.attributes]) {
        _attribute.remove(element, name)

        // Apply template
        if (name == B_TEMPLATE) {
            if (val = document.getElementById(value)) {
                element[INN_HTML] = val.cloneNode(1)[INN_HTML]
            }
            return processElement(element, state)
        }

        // Standard attribute
        if (name[0] != ':' && ![B_IF, B_IFNOT, B_DATA, B_ARRAY].includes(name)) {
            if (val = parseText(value, state, isRoot)) {
                _attribute.set(element, name, val)
            }
            continue
        }

        // Remainder logic uses resolved expressions
        val = value ? resolveExpr(value, state) : state.$data

        if (name[0] == ':') {
            // Interpolated attribute
            if (val) {
                _attribute.set(element, name.slice(1), val)
            }
            return processElement(element, state)
        } else if (name == B_DATA && value) {
            // Data binding
            if (val == null) {
                return element.remove()
            }
            return processElement(element, {
                ...state,
                $path: state.$path + '.' + value,
                $data: val,
                $parent: state
            }, isRoot)
        } else if (name == B_IF | name == B_IFNOT) {
            // Conditional element
            val = (name == B_IF) != !val
            if (val) {
                processElement(element, state, isRoot)
            }
            return processCondition(element, val)
        }

        // Element loop
        val = !val | Array.isArray(val) ? val
            : Object.entries(val).map(([key, value]) => ({ key, value }))
        for (let i = 0; i < val?.length; ++i) {
            const child = element.cloneNode(1)
            element.parentNode.insertBefore(child, element)
            processElement(child, {
                ...state,
                $path: state.$path + (value ? '.' + value : '') + '[' + i + ']',
                $index: i, $first: !i, $last: i > val.length - 2,
                $data: val[i],
                $array: val,
                $parent: state
            })
        }
        return processCondition(element, val?.length, 1)
    }

    // Process every child 'pow' template
    while (val = _selectChild(element, '*[pow]:not([pow] [pow])')[0]) {
        processElement(val, state)
    }

    // Parse inner HTML
    element[INN_HTML] = parseText(element[INN_HTML], state, isRoot)
    if (element.tagName == 'TEMPLATE') {
        element.replaceWith(...element.content.childNodes)
    }
}

const bind = (element) => {
    //element = element.at ? nextChildTemplate(document, element) : element
    const originalHTML = element[INN_HTML]
    const attributes = [...element.attributes]
    const $id = '$pow_' + _rand().toString(36).slice(2)
    const binding = {
        apply: (data) => {
            if (binding.$pow) {
                return console.warn('Binding already in progress')
            }
            binding.$pow = 1

            // Reset global state
            element[INN_HTML] = originalHTML
            attributes.forEach($ => _attribute.set(element, $.name, $.value))
            window[$id] = {}

            try {
                processElement(element, { $id, $path: '$root', $data: data, $root: data }, 1)
            } finally {
                element[INN_HTML] = element[INN_HTML].replace(/​/g, '')
                delete binding.$pow
            }

            binding.refresh = () => binding.apply(data)
            return binding
        },
        refresh: () => { }
    }
    return binding
}
const pow = {
    apply: (element, data) => bind(element).apply(data),
    bind,
    _eval: (expr, ctxt) => {
        const args = Object.entries(ctxt).filter($ => isNaN($[0]))
        return (new Function(...args.map($ => $[0]), 'return ' + expr)).call(ctxt.$data, ...args.map($ => $[1]))
    }
}
export default pow