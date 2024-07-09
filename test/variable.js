import test from 'ava'
import Template from '../src/index.js'

const template = new Template()

test('variable', (t) => {
    t.is(
        template.renderString('{{ name }}', {
            name: 'test'
        }),
        'test'
    )
})

test('variable object', (t) => {
    t.is(
        template.renderString('{{ obj.test }}', {
            obj: {
                test: true
            }
        }),
        'true'
    )
})

test('variable object, use bracket', (t) => {
    t.is(
        template.renderString(`{{ obj["test"] }}`, {
            obj: {
                test: 10
            }
        }),
        '10'
    )
})

test('variable array', (t) => {
    t.is(
        template.renderString('{{ list[1].name }}', {
            list: [
                {
                    name: 'Jack'
                },
                {
                    name: 'Fish'
                }
            ]
        }),
        'Fish'
    )
})
