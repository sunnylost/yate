export default {
    exprStart: '{{',
    exprEnd: '}}',
    stmtStart: '{%',
    stmtEnd: '%}',
    commentStart: '{#',
    commentEnd: '#}',
    text: 'text',
    stmt: 'statement',
    expr: 'expression',
    comment: 'comment'
}

export enum TokenType {
    BOF,
    HTML,
    COMMENT,
    ExpressionStart,
    ExpressionEnd,
    TagIf,
    TagIfEnd,
    TagFor,
    TagForEnd,
    TagSet,
    TagBlock,
    TagImport,
    TagInclude,
    TagFilter,
    TagCall,
    TagRaw,
    EOF
}

export const Tags = [
    'if',
    'for',
    'set',
    'block',
    'import',
    'include',
    'filter',
    'call',
    'raw'
] as const

export type Token = {
    type: TokenType
    text?: string
    start: number
    end: number
}
