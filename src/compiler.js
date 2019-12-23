const Tokenizer = require('./tokenizer')
const TokenType = require('./tokenType')
const DOT = '.'
const BRACKET_LEFT = '['
const BRACKET_RIGHT = ']'
const rbracket = /([^[]+)(\[[^]]+)/

function isStringLiteral(val) {
	let firstChar = val[0]
	let lastChar = val[val.length - 1]

	//string
	if (firstChar === "'" || firstChar === '"') {
		if (firstChar === lastChar) {
			return true
		} else {
			throw Error(`${val} is not enclosed correctly.`)
		}
	}
}

/**
 * generate object's attribute path
 *
 * eg.
 * input: "a.b.c"
 * output: "a && a.b && a.b.c
 *
 * input "a.b[2].c"
 * output: "a && a.b && a.b[2] && a.b[2].c
 * TODO: check 0
 */
function parseAttrPath(expr) {
	if (expr.includes(DOT) || (expr.includes(BRACKET_LEFT) && expr.includes(BRACKET_RIGHT))) {
		if (expr.endsWith(DOT)) {
			throw Error(`"${expr}" is not a correct format.`)
		}

		let arr = expr.split(DOT),
			newArr = []

		for (let i = 0; i < arr.length; i++) {
			let item = arr[i]
			let previous = arr.slice(0, i + 1)

			if (item.includes(BRACKET_LEFT)) {
				let matches = item.match(rbracket)

				if (matches && matches.length > 2) {
					let tmp = previous.slice(0, previous.length - 1)
					tmp.push(matches[1])
					newArr.push(tmp.join(DOT))
				}
			}

			newArr.push(previous.join('.'))
		}

		return newArr.join(' && ')
	}

	return expr
}

class Compiler {
	constructor(config) {
		this.$tokenizer = new Tokenizer(config)
		this.codes = []
		this.strName = 'str_' + Date.now()
		this.ctxName = 'ctx_' + Date.now()
	}

	emit(content, config = {}) {
		if (config.isRaw) {
			this.codes.push(`${this.strName} += \`${content}\`;`)
		} else if (config.needConcat) {
			this.codes.push(`${this.strName} += ${content};`)
		} else {
			this.codes.push(content)
		}
	}

	compileExpr(val) {
		if (isStringLiteral(val)) {
			this.emit(val.substring(1, val.length - 1), {
				isRaw: true
			})
		} else {
			this.emit(`${parseAttrPath(this.ctxName + '.' + val)} || ''`, {
				needConcat: true
			})
		}
	}

	compileStmt(val) {
		let parts = val.split(' ')

		if (!parts.length) {
			console.log('empty stmt')
			return
		}

		switch (parts[0]) {
			case 'for':
				this.compileForStatement(parts)
				break
			case 'endfor':
				this.emit('}')
				break
			case 'endif':
				this.emit('}')
				break
			default:
				console.log('unknow tag:' + parts[0])
		}
	}

	compileForStatement(parts) {
		let iteratorName = '_iter_' + ((Math.random() * 1000) >>> 0)
		this.emit(
			`var ${iteratorName} = ${parseAttrPath(
				this.ctxName + '.' + parts[parts.length - 1]
			)} || [];`
		)

		if (parts[2] === 'in') {
			//only val
			this.emit(`for(var i = 0; i < ${iteratorName}.length; i++) {`)
			this.emit(`var ${parts[1]} = ${iteratorName}[i];`)
			this.emit(`${this.ctxName}.${parts[1]} = ${parts[1]};`)
		}
	}

	generateCode() {
		let codes = this.codes
		let strName = this.strName

		return `function generatedTemplateFn(env) {
			return function fn(${this.ctxName}) {
				var ${strName} = '';
				try {
					${codes.join('\n')}
				} catch(e) {
					console.log(e);
					return '';
				}
				
				return ${strName};
			}
		}`
	}

	run(source) {
		let tokens = this.$tokenizer.run(source)

		while (tokens.length) {
			let t = tokens.shift()
			switch (t.type) {
				case TokenType.expr:
					this.compileExpr(t.value)
					break

				case TokenType.stmt:
					this.compileStmt(t.value)
					break

				case TokenType.text:
					this.emit(`${t.value}`, {
						isRaw: true
					})
					break

				case TokenType.comment:
					//skip comment
					break
			}
		}

		return this.generateCode()
	}
}

module.exports = Compiler
