const TokenType = require('./tokenType')
const startTags = ['stmtStart', 'exprStart', 'commentStart']

class Tokenizer {
	constructor(config) {
		this.config = config || {}
		this.tags = Object.assign({}, TokenType, this.config.tags)
	}

	prepare() {
		let prefix = []

		startTags.forEach(v => {
			let c = this.tags[v][0]

			if (!prefix.includes(c)) {
				prefix.push(c)
			}
		})

		this.$prefix = prefix
	}

	isEnd() {
		return this.cur >= this.len
	}

	advance() {
		let tags = this.tags
		let source = this.source
		this.consumeText()

		for (let i = 0; i < startTags.length; i++) {
			let tag = tags[startTags[i]]

			if (source.substring(this.cur, this.cur + tag.length) === tag) {
				return startTags[i]
			}
		}
		return null
	}

	consume() {
		let tag = this.advance()

		if (!tag) {
			!this.isEnd() &&
				this.tokens.push({
					type: TokenType.text,
					value: this.source[this.cur++]
				})
			return
		}

		if (tag.endsWith('Start')) {
			tag = tag.replace('Start', '')
			this.consumeTag(tag)
		} else {
			console.log('what?', tag)
		}
	}

	consumeText() {
		let $prefix = this.$prefix
		let text = ''

		while (!this.isEnd()) {
			let c = this.source[this.cur]

			if ($prefix.includes(c)) {
				break
			} else {
				text += c
				this.cur++
			}
		}

		text.length &&
			this.tokens.push({
				type: TokenType.text,
				value: text
			})
	}

	consumeTag(type) {
		let source = this.source
		let startTag = this.tags[type + 'Start']
		let endTag = this.tags[type + 'End']
		let endTagLen = endTag.length
		let tokenContent = ''
		this.cur += startTag.length

		//TODO: string "endTag" | 'endTag'
		while (!this.isEnd()) {
			if (source.substring(this.cur, this.cur + endTagLen) !== endTag) {
				tokenContent += source[this.cur++]
			} else {
				this.cur += endTagLen
				break
			}
		}

		tokenContent = tokenContent.trim()

		/**
		 * remove redundant whitespaces
		 */
		if (tokenContent.length) {
			let prevToken = this.tokens[this.tokens.length - 1]

			if (prevToken.type === TokenType.text) {
				let value = prevToken.value

				if (value.match(/\s+$/)) {
					prevToken.value = value.trimRight()
				}
			}

			this.tokens.push({
				type: TokenType[type],
				value: tokenContent
			})
		}
	}

	run(source) {
		this.tokens = []
		this.source = source
		this.len = source.length
		this.cur = 0
		this.prepare()

		while (!this.isEnd()) {
			this.consume()
		}

		return this.tokens
	}
}

module.exports = Tokenizer
