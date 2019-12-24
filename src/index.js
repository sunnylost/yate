const fs = require('fs')
const Tokenizer = require('./tokenizer')
const Compiler = require('./compiler')
const Env = require('./env')

class Template {
	constructor(config) {
		this.config = Object.assign({}, config)
		this.$tokenizer = new Tokenizer(this.config)
		this.$compiler = new Compiler(this.config)
	}

	tokenizer() {
		return new Tokenizer(this)
	}

	compile(str) {
		let envName = this.$compiler.envName
		let rawFn = this.$compiler.run(str)
		let env = new Env()
		return {
			env,
			template: new Function(envName, `return ${rawFn}(${envName})`)(env),
			render(ctx) {
				env.ctx = ctx || {}
				return this.template(env.ctx)
			}
		}
	}

	render(name, ctx, callback) {
		try {
			let str = fs.readFileSync(name, {
				encoding: 'utf8'
			})
			return this.renderString(str, ctx, callback)
		} catch (e) {
			console.error(e)
		}
	}

	renderString(str, ctx, callback) {
		let fn = this.compile(str)
		let hasCallback = typeof callback === 'function'

		try {
			let result = fn.call(null, ctx)

			if (hasCallback) {
				callback(null, result)
				return this
			} else {
				return result
			}
		} catch (e) {
			if (hasCallback) {
				callback(e)
			} else {
				throw new Error(e)
			}
		}
	}
}

module.exports = Template
