import test from 'ava'
import Template from '../src/index.js'

const template = new Template()

test('for tag', (t) => {
    t.is(
        template.renderString('{% for item in items %}{{item}}{% endfor %}', {
            items: ['a', 'b', 'c']
        }),
        'abc'
    )
})
