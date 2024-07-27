import { type Token, TokenType } from './tokenType.ts'
import { uuid } from '../util.ts'

const Normal = 'normal'
const Raw = 'raw'
const Concat = 'concat'

type EmitNormal = typeof Normal
type EmitRaw = typeof Raw
type EmitConcat = typeof Concat
type EmitType = EmitNormal | EmitRaw | EmitConcat

export default class Parser {
    #tokens: Token[]
    #cur = 0
    #ctx = ''
    #env = ''
    #str = ''
    #builtin = ''
    #codes: string[]

    constructor(tokens: Token[]) {
        this.#tokens = tokens

        const id = uuid()
        this.#ctx = `ctx_${id}`
        this.#env = `env_${id}`
        this.#str = `str_${id}`
        this.#builtin = `builtin_${id}`
        this.#codes = []
    }

    #isEnd() {
        return this.#peek().type === TokenType.EOF
    }

    #advance() {
        if (!this.#isEnd()) {
            this.#cur++
        }
        return this.#previous();
    }

    #previous() {
        return this.#tokens[this.#cur - 1];
    }

    #check(type: TokenType) {
        if (this.#isEnd()) {
            return false
        }

        return this.#peek().type === type
    }

    #peek() {
        return this.#tokens[this.#cur]
    }

    #match(...types: TokenType[]) {
        for (const type of types) {
            if (this.#check(type)) {
                this.#advance()
                return true
            }
        }

        return false
    }

    #emit(content?: string, type: EmitType = Normal) {
        if (!content) {
            return
        }

        if (type === Normal) {
            this.#codes.push(content)
        }

        if (type === Raw) {
            this.#codes.push(`${this.#str} += \`${content}\`;\n`)
        }

        if (type === Concat) {
            this.#codes.push(`${this.#str} += ${content};\n`)
        }
    }

    #getIdentifierList(tokens:Token[]) {
        const list: string[] = []

        while (tokens.length) {
            const token = tokens[0]

            if (token.type === TokenType.IDENTIFIER) {
                if (token.text) {
                    list.push(token.text)
                }
            } else if (token.type !== TokenType.COMMA) {
                break
            }

            tokens.shift()
        }

        return list
    }

    #compileStatement(tokens: Token[]) {
        let codes = ''

        for (let i = 0; i < tokens.length; i++) {
            const { type, text } = tokens[i]

            switch (type) {
                case TokenType.STRING:
                    codes += `\`${text}\``
                    break
            }
        }

        return codes
    }

    /**
     * if string && identifier
     * @private
     */
    #compileIf() {
        const tokens = this.#peek().tokens

        if (tokens) {
            const codes = this.#compileStatement(tokens)
            this.#emit(`if(${codes}) {\n`)
        }
    }

    /**
     * for tempVar in iterable
     * for tempVar, tempIndex in iterable
     * @private
     */
    #compileFor() {
        const tokens = this.#peek().tokens

        if (!tokens) {
            return
        }

        const list = this.#getIdentifierList(tokens)
        const nextToken = tokens.shift()

        if (nextToken?.type !== TokenType.IN) {
            return
        }

        const token = tokens.shift()

        if (!token) {
            return
        }

        const id = token.text
        const builtin = this.#builtin
        this.#emit(`
        ;(() => {
            const length = ${builtin}.len(${id})
            const loop = {
                index: 0,
                revindex: 0,
                first: ${builtin}.first(${id}),
                last: ${builtin}.last(${id}),,
                length: length,
            }
            ${builtin}.iter(${id}, (v, i) => {
                loop.index = i;
                loop.revindex = length - i;
                const [${list.join(',')}] = v;
        `)
    }

    parse() {
        while (!this.#isEnd()) {
            const token = this.#peek()

            switch (token.type) {
                case TokenType.HTML:
                    this.#emit(token.text, Raw)
                    break

                case TokenType.COMMENT:
                    // do nothing
                    break

                case TokenType.TagIf:
                    this.#compileIf()
                    break

                case TokenType.TagEndIf:
                    this.#emit('}\n')
                    break

                case TokenType.TagFor:
                    this.#compileFor()
                    break

                case TokenType.TagEndFor:
                    this.#emit(`
                    })
                })();\n`)
                    break

                default:
                    console.log('TODO:', token.type)
            }

            this.#advance()
        }

        return `
function generatedTemplateFn(${this.#env}) {
    return function fn(${this.#ctx}) {
        let ${this.#str} = '';

        try {
            ${this.#codes.join('')}
        } catch(e) {
            console.log(e);
            ${this.#str} = '';
        }

        return ${this.#str};
    }
}`
    }
}
