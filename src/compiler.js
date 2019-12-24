const Tokenizer = require('./tokenizer')
const TokenType = require('./tokenType')
const { uuid } = require('./util')
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
		let id = uuid()

		this.$tokenizer = new Tokenizer(config)
		this.strName = 'str_' + id
		this.ctxName = 'ctx_' + id
		this.envName = 'env_' + id
	}

	emit(content, config = {}) {
		if (config.raw) {
			this.codes.push(`${this.strName} += \`${content}\`;`)
		} else if (config.concat) {
			this.codes.push(`${this.strName} += ${content};`)
		} else {
			this.codes.push(content)
		}
	}

	compileExpr(val) {
		let len = val.length
		let parts = []
		let item = ''
		let isInString = false
		let strStart = []

		for (let i = 0; i < len; i++) {
			let c = val[i]

			switch (c) {
				case '|':
					if (isInString) {
						item += c
					} else {
						item = item.trim()
						item.length && parts.push(item)
						item = ''
					}

					break

				case '"':
				case "'":
					if (!strStart.length) {
						strStart.push(c)
						isInString = true
					} else {
						if (strStart[strStart.length - 1] === c) {
							strStart.splice(strStart.length - 1, 1)
							isInString = !!strStart.length
						} else {
							isInString = true
							strStart.push(c)
						}
					}

					item += c

					break

				case ' ':
					if (!isInString) {
						continue
					}
					break

				default:
					item += c
					break
			}
		}

		item.length && parts.push(item)

		if (parts.length) {
			let attr = parts.splice(0, 1)
			let attrName = '__tmp__'

			this.emit(`var ${attrName};`)

			if (isStringLiteral(attr)) {
				this.emit(`${attrName} = ${attr.substring(1, attr.length - 1)}`)
			} else {
				this.emit(`${attrName} = ${parseAttrPath(this.ctxName + '.' + attr)} || '';`)
			}

			if (parts.length) {
				let pre = []
				let suf = []
				let isPassed = false
				let envName = this.envName

				while (parts.length) {
					let filter = parts.pop()

					let parenIndex = filter.indexOf('(')
					let args = ''

					if (parenIndex !== -1) {
						args = filter.substring(parenIndex + 1, filter.length - 1)
						filter = filter.substring(0, parenIndex)
					}

					filter = envName + '.filter.' + filter

					if (isPassed) {
						pre.unshift(filter + '(')
					} else {
						isPassed = true
						pre.unshift(filter + '(' + attrName)
					}

					suf.push(',' + args + ')')
				}

				this.emit(pre.join('') + suf.join(''), {
					concat: true
				})
			} else {
				this.emit(attrName, {
					concat: true
				})
			}
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
			case 'break': //TODO
				this.emit('break;')
				break
			case 'endfor':
				this.emit('})')
				break
			case 'if':
				this.compileIfStatement(parts)
				break
			case 'endif':
				this.emit('}')
				break
			default:
				console.log('unknown tag:' + parts[0])
		}
	}

	compileForStatement(parts) {
		let ctxName = this.ctxName
		let envName = this.envName
		let iteratorName = '_iter_' + uuid()
		this.emit(
			`var ${iteratorName} = ${parseAttrPath(ctxName + '.' + parts[parts.length - 1])} || [];`
		)

		if (parts[2] === 'in') {
			this.emit(`${envName}.ext.each(${iteratorName}, function(__val__) {
			var ${ctxName} = Object.assign({}, ${envName}.ctx, {
				${parts[1]}: __val__
			});
			`)
		}
	}

	compileIfStatement() {
		//TODO
	}

	generateCode() {
		let { codes, strName, envName } = this

		return `function generatedTemplateFn(${envName}) {
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
		this.codes = []
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
						raw: true
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
