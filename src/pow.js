/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 3.7.2
 */

const ATTR_POW = 'pow', P_DATA = '$data', P_PARENT = '$parent', P_PATH = '$path', P_ROOT = '$root'
const B_ARRAY = 'array', B_DATA = 'data', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot', B_TEMPLATE = 'template', B_TRANSFORM = 'transform'
const MOUSTACHE_RE = /{{\s*(.*?)\s*}}/gs

const $attr = { set: (el, name, value) => el.setAttribute(name, value), rem: (el, name) => el.removeAttribute(name) }
const $cloneNode = (el) => el.cloneNode(1)
const $cloneState = (state) => ({ ...state[P_DATA], ...state, [P_PARENT]: state[P_PARENT] && $cloneState(state[P_PARENT]) })
const $escape = (text, skip) => skip || !text.replace ? text : text.replace(/({|p)({|ow)/g, '$1​$2​')
const $fragment = (html) => document.createRange().createContextualFragment(html)
const $randomId = _ => '_' + Math.random().toString(36).slice(2)
const $replace = (el, html) => el?.isConnected ? el.outerHTML = html : el?.replaceWith($fragment(html)) // Replace items not in document DOM
const $selectChildren = (el, selector) => (el.content ?? el).querySelectorAll(selector), $selectChild = (el, id) => $selectChildren(el, '#' + id)[0]

const bind = (root) => {
    const _originalHTML = root.innerHTML, _attributes = [...root.attributes]
    const _bindingId = '$pow' + $randomId(), _sections = {}

    const processElement = (element, state, isRoot, val) => {
        // Resolves an expression to a value
        const evalExpr = (expr, context = $cloneState(state)) => {
            try {
                // Execute the expression as JS code, mapping to the state data
                return pow._eval(expr, context)
            } catch (e) {
                console.warn('Interpolation failed', { [P_PATH]: state[P_PATH], expr }, e)
            }
        }

        // Allow sibling 'else' based on condition
        const processCondition = (active, alwaysRemove, sibling = element.nextElementSibling) => {
            if (!active && sibling?.attributes.pow)
                $attr.rem(sibling, B_ELSE)
            return (alwaysRemove | !active) && !$replace(element, '')
        }

        // Check if a value has resolved to a Promise
        const resolvePromise = (value, context) =>
            value?.constructor?.name == 'AsyncFunction'
            ? value(context)
            : value instanceof Promise ? value : 0

        // Convert a function to a bound string
        const bindFunction = (fn, id = $randomId()) => {
            window[_bindingId][id] = (target) => fn.call(target, $cloneState(state))
            return `${_bindingId}.${id}(this)`
        }

        // Prepare custom elements
        for (const child of [...$selectChildren(element, '*')].filter($ => $.tagName.startsWith('POW:')))
            $replace(child, child.outerHTML.replace(/^<pow:([\w-]+)/i, `<${B_TEMPLATE} ${ATTR_POW} ${B_TEMPLATE}="$1"`))

        // Disable child HTML for stopped bindings
        for (const child of $selectChildren(element, '*[pow][stop]'))
            $replace(child, $escape(child.outerHTML))

        $attr.rem(element, ATTR_POW)

        // Process each attribute in order
        let transformFunction = 0
        for (const { name, value } of [...element.attributes]) {
            if (name == B_ELSE) // If 'else' survives to here, the element isn't wanted
                return $replace(element, '')

            $attr.rem(element, name)

            if (name == B_TEMPLATE && !processCondition(val = $selectChild(document, value))) { // Apply template
                // Gather content data
                let content = {}, defaultContent = null
                for (const child of $selectChildren(element, B_TEMPLATE)) {
                    defaultContent ??= child.innerHTML // Remember first template
                    content[child.id] = child.innerHTML
                }
                defaultContent ??= element.innerHTML // No templates, use whole content

                // Build content with replaced params
                // Has to be a regex on full HTML due to template contents not being in DOM
                element.innerHTML = val.innerHTML.replace(/<param(?:\s+id=["']([^"']+)["'])?\s*\/?>/g,
                    // Find templates by id or default first
                    // Default param (no id), takes whole content if there were no templates
                    (_, id) => id ? (content[id] || '') : defaultContent)

                return processElement(element, { ...state, $content: content })
            } else if (name == B_TRANSFORM) { // Transformation function
                transformFunction = evalExpr(value)
                // TODO: async support?
                continue
            } else if (name == 'section' && value) { // Store render section
                // TODO: allow unnamed section? `value = (value || $randomId())`
                element.id = element.id || $randomId()
                state.$section = _sections[value] = (data) => {
                    copy.state[P_DATA] = data ?? copy.state[P_DATA]
                    val = $cloneNode(copy.element)
                    return _exec(val, _ => {
                        $selectChild(root, element.id).replaceWith(val)
                        processElement(val, copy.state, 1)
                    })
                }
                const copy = { element: $cloneNode(element), state: { ...state } }
                continue
            }

            // Resolve value to expression or text
            const isBinding = name == B_ARRAY | name == B_DATA | name == B_IF | name == B_IFNOT
            const isInterpolatedAttribute = name[0] == ':', isDataAttribute = name.at(-1) == ':'
            const implicitExpr = isBinding | isInterpolatedAttribute | isDataAttribute
            MOUSTACHE_RE.lastIndex = 0
            if (!value) {
                val = implicitExpr ? state[P_DATA] : value
            } else if (val = MOUSTACHE_RE.exec(value)) {
                // Treat value of a single moustache as an expression    
                if (val[0].length == value.length) {
                    val = evalExpr(val[1])
                } else {
                    // Parse all values
                    val = value.replace(MOUSTACHE_RE, (_, expr) => evalExpr(expr) ?? '')
                }
            } else {
                // Treat value without moustaches as an expression
                val = implicitExpr ? evalExpr(value) : value
            }

            // If Promise, store element until it can be resolved
            var promise
            if (promise = resolvePromise(val, state)) {
                // Remember source include siblings in template + resolve 'else' now
                $attr.set(element, ATTR_POW)
                var html = element.outerHTML, el = element.nextElementSibling, elseId
                while (el?.attributes[ATTR_POW] && el.attributes[B_ELSE]) {
                    html += el.outerHTML
                    if (!el.attributes.if && !el.attributes[B_IFNOT]) {
                        $attr.rem(el, B_ELSE)
                        el.id = elseId = $randomId()
                        break
                    }
                    var nx = el.nextElementSibling
                    $replace(el, '')
                    el = nx
                }

                // Replace element until Promise resolved
                $replace(element, `<${B_TEMPLATE} id="${val = $randomId()}"></${B_TEMPLATE}>`)
                return promise.then(r => {
                    el = $selectChild(root, val)
                    el.innerHTML = html.replace(' ', ` ${name}="{{ $async }}" `)
                    processElement(el, { ...state, $async: r }, 1)
                    if (elseId)
                        $replace($selectChild(root, elseId), '')
                })
            }

            if (name == B_ARRAY) { // Element loop
                val = !val | Array.isArray(val) ? val
                    : Object.entries(val).map(([key, value]) => ({ key, value }))
                for (let i = 0; i < val?.length; ++i) {
                    const child = $cloneNode(element)
                    element.parentNode.insertBefore(child, element)
                    processElement(child, {
                        ...state, [P_PATH]: `${state[P_PATH]}.${value || B_ARRAY}[${i}]`, [P_DATA]: val[i],
                        [P_PARENT]: state, $index: i, $first: !i, $last: i > val.length - 2, $array: val,
                        $prev: i ? val[i - 1] : '', $next: i < val.length - 1 ? val[i + 1] : ''
                    })
                }
                return processCondition(val?.length, 1)
            } else if (name == B_DATA) { // Data binding
                return processCondition(val != null)
                    ? 0 // Removed as inactive
                    : processElement(element, {
                        ...state, [P_PATH]: state[P_PATH] + '.' + value,
                        [P_DATA]: val, [P_PARENT]: state
                    }, isRoot)
            } else if (isInterpolatedAttribute) { // Interpolated attribute
                if (val)
                    $attr.set(element, name.slice(1), val)
                return processElement(element, state, isRoot)
            } else if (name == B_IF | name == B_IFNOT) { // Conditional element
                if (processCondition((name == B_IF) != !val))
                    return // Removed as inactive
            } else if (isDataAttribute) { // Data attribute
                state = { ...state, [P_DATA]: { ...state[P_DATA], [name.slice(0, -1)]: val } }
            } else if (val instanceof Function) {
                $attr.set(element, name, bindFunction(val))
            } else if (val || val === 0) { // Standard attribute
                $attr.set(element, name, $escape('' + val, isRoot))
            }
        }

        // Process every child 'pow' template
        while (val = $selectChildren(element, '[pow]:not([pow] [pow])')[0])
            processElement(val, state)

        // Transform complete element
        if (transformFunction?.call)
            transformFunction.call(element, element, state)

        // Parse inner HTML
        html = element.innerHTML.replace(MOUSTACHE_RE, (_, expr) => {
            const context = $cloneState(state)
            const value = evalExpr($fragment(expr).textContent, context)
            if (!value)
                return value ?? ''

            // Display async result when available
            if (expr = resolvePromise(value, context)) {
                const id = $randomId()
                expr.then(r => $replace($selectChild(root, id), r))
                return `<${B_TEMPLATE} id="${id}"></${B_TEMPLATE}>`
            }

            // TODO: drop in v4
            // If the result is a function, bind it for later
            return value.call ? bindFunction(value) : value
        })
        element.innerHTML = $escape(html, isRoot)
        if (element.localName == B_TEMPLATE)
            $replace(element, element.innerHTML)
    }

    // Safely run logic on an element
    const _exec = (target, logic) => {
        if (_exec.$)
            return console.warn('Binding already in progress')
        _exec.$ = 1
        try {
            logic()
        } finally {
            target.innerHTML = target.innerHTML.replace(/​/g, '')
            delete _exec.$
        }

        _binding.sections = { ..._sections }
        return _binding
    }

    const _binding = {
        apply: (data) => _exec(root, _ => {
            // Reset global state
            root.innerHTML = _originalHTML
            for (const attr of _attributes)
                $attr.set(root, attr.name, attr.value)
            window[_bindingId] = {}

            processElement(root, { [P_PATH]: P_ROOT, [P_DATA]: data, [P_ROOT]: data }, 1)

            _binding.refresh = _ => _binding.apply(data)
        }),
        refresh: _ => { }
    }
    return _binding
}

const pow = {
    apply: (element, data) => bind(element).apply(data),
    bind,
    _eval: (expr, ctxt, _args = Object.entries(ctxt).filter($ => isNaN($[0]))) =>
        (new Function(..._args.map($ => $[0]), 'return ' + expr)).call(ctxt[P_DATA], ..._args.map($ => $[1]))
}
export default pow