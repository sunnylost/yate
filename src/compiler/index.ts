import Lexer from './lexer.ts'
import Parser from './parser.ts'

export default function compile(source: string) {
    const parser = new Parser(new Lexer(source).scanAll())

    return parser.parse()
}
