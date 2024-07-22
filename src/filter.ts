function wrap(fn) {
    return (...args) => {
        const ret = fn.apply(null, args)

        return typeof ret === 'undefined' || ret === null ? '' : ret
    }
}

const filters = {
    join: wrap((arr, separator = '') => (Array.isArray(arr) ? arr.join(separator) : arr)),
    capitalize: wrap((v) => (typeof v === 'string' ? v.replace(/^./, (v) => v.toUpperCase()) : v)),
    abs: wrap((v) => Math.abs(v))
}

export default {
    filters,

    addFilter(name, handler) {
        if (!filters[name]) {
            filters[name] = wrap(handler)
        } else {
            console.warn(`"${name}" is conflict with builtin filter.`)
        }
    }
}
