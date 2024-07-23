import { capitalize } from '../util.ts'
import { Tags, type Token, TokenType } from './tokenType.ts'

const splitterBegin = ['{{', '{#']
const splitterEnd = ['}}', '#}']

export default class Lexer {
    #source = ''
    #pos = 0
    #size = 0

    constructor(source: string) {
        this.#source = source
        this.#size = source.length
        this.#pos = 0
    }

    #advance() {
        return this.#source[this.#pos++]
    }

    scan() {
        const consumeMethods: (() => Token | undefined)[] = [
            this.#consumeHTML.bind(this),
            this.#consumeComment.bind(this),
            this.#consumeTag.bind(this)
        ]

        for (const fn of consumeMethods) {
            const token = fn()

            if (token) {
                return token
            }
        }
    }

    scanAll() {
        const tokens: Token[] = []

        while (!this.#isEnd()) {
            const token = this.scan()

            if (token) {
                tokens.push(token)
            } else {
                break
            }
        }

        return tokens
    }

    #isEnd() {
        return this.#pos >= this.#size
    }

    #peek(num = 1) {
        let start = this.#pos
        let text = this.#source.charAt(start)

        while (num--) {
            if (++start >= this.#size) {
                return text
            }

            text += this.#source.charAt(start)
        }

        return text
    }

    #consumeHTML() {
        const start = this.#pos
        let text = ''

        while (!this.#isEnd()) {
            const next = this.#peek()

            if (splitterBegin.includes(next)) {
                break
            }

            text += this.#source.charAt(this.#pos++)
        }

        if (text.length) {
            return {
                type: TokenType.HTML,
                text,
                start,
                end: this.#pos
            }
        }
    }

    #consumeComment() {
        const start = this.#pos
        const next = this.#peek()

        if (splitterBegin[1] === next) {
            let text = ''
            this.#pos += 2

            while (!this.#isEnd() && this.#peek() !== splitterEnd[1]) {
                text += this.#source.charAt(this.#pos++)
            }

            this.#pos += 2

            if (text.length) {
                return {
                    type: TokenType.COMMENT,
                    text,
                    start,
                    end: this.#pos
                }
            }
        } else {
            return
        }
    }

    #advanceExpressionStart() {
        if (splitterBegin[0] === this.#peek()) {
            this.#pos += 2

            return true
        }
    }

    #advanceExpressionEnd() {
        if (splitterEnd[0] === this.#peek()) {
            this.#pos += 2

            return true
        }
    }

    #scanForward(predicate: (c: string) => boolean) {
        while (!this.#isEnd() && predicate(this.#source[this.#pos])) {
            this.#pos++
        }
    }

    #consumeTag() {
        if (!this.#advanceExpressionStart()) {
            return
        }

        this.#scanForward((c) => /[ \s\t\n]/.test(c))

        let start = this.#pos
        this.#scanForward((c) => /[a-z]/.test(c))
        const tag = this.#source.substring(start, this.#pos)

        if (Tags.includes(tag as unknown as (typeof Tags)[number])) {
            this.#pos++
            start = this.#pos
            let text = ''

            while (this.#peek() !== splitterEnd[0] && !this.#isEnd()) {
                text += this.#source.charAt(this.#pos++)
            }

            if (text.length) {
                const end = this.#pos
                this.#advanceExpressionEnd()

                return {
                    type: TokenType[`Tag${capitalize(tag)}`],
                    text,
                    start,
                    end
                }
            }
        }
    }
}
