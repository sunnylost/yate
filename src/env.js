const Ext = require('./ext')
const Filter = require('./filter')

module.exports = function() {
	return {
		ctx: {},
		filter: Filter,
		ext: Ext
	}
}
