export function uuid () {
	return (Math.random().toString(16) + '000000000').substr(2, 8).substr(0, 8)
}
