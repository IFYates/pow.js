import pow from './pow.js'

/**
 * Provides basic interpolation of values
 */
pow._eval = (template, data) => {
    const idx = template.indexOf('.')
    if (idx < 0) {
        return data.hasOwnProperty(template) ? data[template] : undefined
    }

    const value = pow._eval(template.slice(0, idx), data)
    return pow._eval(template.slice(idx + 1), value)
}

export default pow