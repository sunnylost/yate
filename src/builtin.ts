// @ts-nocheck
import { forEach, first,last,size, } from 'lodash-es'

type IterHandler = (value: unknown, key: number|string) => void

export const Builtin = {
	iter(obj: unknown, handler:IterHandler) {
		forEach(obj, (value: unknown, key: number|string) => {
			handler(value, key)
		})
	},

	len(obj:unknown) {
		return size(obj)
	},

	first(obj: unknown) {
		if (!obj) {
			return null
		}

		return first(obj)
	},

	last(obj: unknown) {
		if (!obj) {
			return null
		}

		return last(obj)
	}
}
