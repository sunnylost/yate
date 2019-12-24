const filters = {
	abs(v) {
		return Math.abs(v)
	},

	capitalize(v) {
		return typeof v === 'string' ? v.replace(/^./, v => v.toUpperCase()) : v
	},

	join(arr, separator = '') {
		return Array.isArray(arr) ? arr.join(separator) : arr
	}
}

function wrap(fn) {
	return function(...args) {
		let ret = fn.apply(null, args)

		return typeof ret === 'undefined' || ret === null ? '' : ret
	}
}

Object.entries(filters).forEach(([name, fn]) => {
	exports[name] = wrap(fn)
})
