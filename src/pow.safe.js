import pow from './pow.js'

/**
 * Provides basic interpolation of values
 * 
 * Supports property walking and 0-argument functions
 */
pow._eval = (template, data, root = null) => {
    const period = template.indexOf('.')
    if (period < 0) {
        if (template.endsWith('()')) {
            const fn = pow._eval(template.slice(0, -2), data, root)
            return typeof fn == 'function' ? fn(root ?? data) : undefined
        }
        return data?.hasOwnProperty(template) ? data[template]
            : template == 'length' && typeof data == 'object' ? Object.keys(data).length
            : !root && window?.hasOwnProperty(template) ? window[template]
            : undefined
    }

    const value = pow._eval(template.slice(0, period), data, root)
    return pow._eval(template.slice(period + 1), value, root)
}

export default pow