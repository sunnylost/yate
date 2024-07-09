import test from 'ava'
import Template from '../src/index.js'

const template = new Template()

test('builtin filter', (t) => {
    t.is(
        template.renderString('{{ a | capitalize }}', {
            a: 'small'
        }),
        'Small'
    )
})

test('custom filter', (t) => {
    template.addFilter('showFirst', (value) => value[0])

    t.is(
        template.renderString('{{ a | showFirst }}', {
            a: 'small'
        }),
        's'
    )
})
