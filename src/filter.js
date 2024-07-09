function wrap(fn) {
    return (...args) => {
        const ret = fn.apply(null, args)

        return typeof ret === 'undefined' || ret === null ? '' : ret
    }
}

export const abs = wrap((v) => Math.abs(v))

export const capitalize = wrap((v) =>
    typeof v === 'string' ? v.replace(/^./, (v) => v.toUpperCase()) : v
)

export const join = wrap((arr, separator = '') => (Array.isArray(arr) ? arr.join(separator) : arr))
