/**
 * @license MIT
 * @author IFYates <https://github.com/ifyates/pow.js>
 * @description A very small and lightweight templating framework.
 * @version 3.7.0
 */

const ATTR_POW = 'pow', P_DATA = '$data', P_PARENT = '$parent', P_PATH = '$path', P_ROOT = '$root'
const B_ARRAY = 'array', B_DATA = 'data', B_EACH = 'each', B_ELSE = 'else', B_IF = 'if', B_IFNOT = 'ifnot'
const B_TEMPLATE = 'template', B_TRANSFORM = 'transform'
const CONTENT = 'content', FUNCTION = 'function', INN_HTML = 'innerHTML'
const OUT_HTML = 'outerHTML', REPLACE = 'replace', REPLACE_WITH = 'replaceWith'
const MOUSTACHE_RE = /{{\s*(.*?)\s*}}/gs

const $attr = { set: (el, name, value) => el.setAttribute(name, value), rem: (el, name) => el.removeAttribute(name) }
const $cloneNode = (el) => el.cloneNode(1)
const $escape = (text, skip) => skip ? text : text[REPLACE](/({|p)({|ow)/g, '$1​$2​')
const $randomId = _ => '_' + Math.random().toString(36).slice(2)
const $replace = (el, html) => el[REPLACE_WITH](document.createRange().createContextualFragment(html)) // TODO: better solution
const $selectChild = (el, selector) => (el[CONTENT] ?? el).querySelectorAll(selector)

const bind = (root) => {
    const _originalHTML = root[INN_HTML], _attributes = [...root.attributes]
    const _id = '$pow' + $randomId(), _sections = {}

    const processElement = (element, state, isRoot, val) => {
        // Interpolates a string as a moustache expression even if it doesn't contain moustaches
        const forceExpr = (text, raw, M) => {
            MOUSTACHE_RE.lastIndex = 0
            return !(M = MOUSTACHE_RE.exec(text))
                // Treat text without moustaches as an expression
                ? resolveExpr(text, raw)
                : M[0].length + M.index == text.length
                    // Treat text of a single moustache as an expression
                    ? resolveExpr(M[1], raw)
                    // Parse all text
                    : parseExprs(text)
        }
        // Interpolates all moustache expressions in text
        const parseExprs = (text) => text[REPLACE](MOUSTACHE_RE, (_, expr) => resolveExpr(expr) ?? '')
        // Resolves an expression to a value
        const resolveExpr = (expr, raw, context = cloneState(state)) => {
            try {
                // Execute the expression as JS code, mapping to the state data
                const value = pow._eval(expr, context)

                // If the result is a function, bind it for later
                if (!raw && value?.call) {
                    window[_id][raw = $randomId()] = (target) => value.call(target, context)
                    return `${_id}.${raw}(this)`
                }
                return value
            } catch (e) {
                console.warn('Interpolation failed', { [P_PATH]: state[P_PATH], expr }, e)
            }
        }
        const cloneState = (state) => ({
            ...state[P_DATA], ...state, [P_PARENT]: state[P_PARENT] && cloneState(state[P_PARENT])
        })

        // Allow sibling 'else' based on condition
        const processCondition = (active, alwaysRemove, sibling = element.nextElementSibling) => {
            if (!active && sibling?.attributes.pow)
                $attr.rem(sibling, B_ELSE)
            return (alwaysRemove | !active) && !element.remove()
        }

        // Prepare custom elements
        for (const child of [...$selectChild(element, '*')].filter($ => $.tagName.startsWith('POW:')))
            $replace(child, child[OUT_HTML][REPLACE](/^<pow:([\w-]+)/i, `<${B_TEMPLATE} ${ATTR_POW} ${B_TEMPLATE}="$1"`))

        // Disable child HTML for stopped bindings
        for (const child of $selectChild(element, '*[pow][stop]'))
            $replace(child, $escape(child[OUT_HTML]))

        $attr.rem(element, ATTR_POW)

        // Process each attribute in order
        let transformFunction = 0
        for (const { name, value } of [...element.attributes]) {
            $attr.rem(element, name)

            // Apply template
            if (name == B_TEMPLATE && !processCondition(val = document.getElementById(value))) {
                // Gather content data
                let content = {}, defaultContent = null
                for (const child of $selectChild(element, B_TEMPLATE)) {
                    defaultContent ??= child[INN_HTML] // Remember first template
                    content[child.id] = child[INN_HTML]
                }
                defaultContent ??= element[INN_HTML] // No templates, use whole content

                // Build content with replaced params
                // Has to be a regex on full HTML due to template contents not being in DOM
                element[INN_HTML] = val[INN_HTML][REPLACE](/<param(?:\s+id=["']([^"']+)["'])?\s*\/?>/g,
                    // Find templates by id or default first
                    // Default param (no id), takes whole content if there were no templates
                    (_, id) => id ? (content[id] || '') : defaultContent)

                return processElement(element, { ...state, $content: content })
            }

            // Some logic requires resolved expressions
            val = _ => val = (value ? forceExpr(value) : state[P_DATA])

            if (name == B_ARRAY || (name == B_EACH && element.localName == B_TEMPLATE)) { // Element loop
                val = !val() | Array.isArray(val) ? val
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
            } else if (name == B_EACH) { // Content loop
                val = !val() | Array.isArray(val) ? val
                    : Object.entries(val).map(([key, value]) => ({ key, value }))
                if (val?.length) {
                    const dest = $cloneNode(element)
                    element.parentNode.insertBefore(dest, element)
                    dest[INN_HTML] = ''
                    for (let i = 0; i < val?.length; ++i) {
                        const child = $cloneNode(element)
                        element.parentNode.insertBefore(child, element)
                        processElement(child, {
                            ...state, [P_PATH]: `${state[P_PATH]}.${value || B_ARRAY}[${i}]`, [P_DATA]: val[i],
                            [P_PARENT]: state, $index: i, $first: !i, $last: i > val.length - 2, $array: val,
                            $prev: i ? val[i - 1] : '', $next: i < val.length - 1 ? val[i + 1] : ''
                        })
                        dest[INN_HTML] += child[INN_HTML]
                        child.remove()
                    }
                }
                return processCondition(val?.length, 1)
            } else if (name == B_DATA) { // Data binding
                return processCondition(val() != null)
                    ? 0 // Removed as inactive
                    : processElement(element, {
                        ...state, [P_PATH]: state[P_PATH] + '.' + value,
                        [P_DATA]: val, [P_PARENT]: state
                    }, isRoot)
            } else if (name == B_IF | name == B_IFNOT) { // Conditional element
                if (processCondition((name == B_IF) != !val()))
                    return // Removed as inactive
            } else if (name[0] == ':') { // Interpolated attribute
                if (val())
                    $attr.set(element, name.slice(1), val)
                return processElement(element, state, isRoot)
            } else if (name.at(-1) == ':') { // Data attribute
                state = { ...state, [P_DATA]: { ...state[P_DATA], [name.slice(0, -1)]: val() } }
            } else if (name == B_ELSE) { // If 'else' survives to here, the element isn't wanted
                return element.remove()
            } else if (name == B_TRANSFORM) { // Transformation function
                transformFunction = forceExpr(value, 1)
            } else if (name == 'section' && value) { // Render section
                element.id = element.id || $randomId()
                _sections[value] = (data) => {
                    copy.state[P_DATA] = data ?? copy.state[P_DATA]
                    val = $cloneNode(copy.element)
                    return _exec(val, _ => {
                        $selectChild(root, '#' + element.id)[0][REPLACE_WITH](val)
                        processElement(val, copy.state, 1)
                    })
                }
                state = { ...state, $section: _sections[value] }
                const copy = { element: $cloneNode(element), state }
            } else if (val = $escape(parseExprs(value), isRoot)) { // Standard attribute
                $attr.set(element, name, val)
            }
        }

        // Process every child 'pow' template
        while (val = $selectChild(element, '[pow]:not([pow] [pow])')[0])
            processElement(val, state)

        // Transform complete element
        if (transformFunction?.call)
            transformFunction.call(element, element, state)

        // Parse inner HTML
        element[INN_HTML] = $escape(parseExprs(element[INN_HTML]), isRoot)
        if (element.localName == B_TEMPLATE)
            $replace(element, element[INN_HTML])
    }

    const _exec = (target, logic) => {
        if (_exec.$)
            return console.warn('Binding already in progress')
        _exec.$ = 1
        try {
            logic()
        } finally {
            target[INN_HTML] = target[INN_HTML][REPLACE](/​/g, '')
            delete _exec.$
        }

        _binding.sections = { ..._sections }
        return _binding
    }

    const _binding = {
        apply: (data) => _exec(root, _ => {
            // Reset global state
            root[INN_HTML] = _originalHTML
            for (const attr of _attributes)
                $attr.set(root, attr.name, attr.value)
            window[_id] = {}

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