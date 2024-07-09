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
