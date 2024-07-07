function wrap(fn) {
    return function (...args) {
        let ret = fn.apply(null, args)

        return typeof ret === 'undefined' || ret === null ? '' : ret
    }
}

export const abs = wrap(function abs(v) {
    return Math.abs(v)
})

export const capitalize = wrap(function (v) {
    return typeof v === 'string' ? v.replace(/^./, (v) => v.toUpperCase()) : v
})

export const join = wrap(function (arr, separator = '') {
    return Array.isArray(arr) ? arr.join(separator) : arr
})
