import test from 'ava'
import Template from '../src/index'

test('for tag', t => {
	let template = new Template()

	t.is(
		template.renderString(`{% for item in items %}{{item}}{% endfor %}`, {
			items: ['a', 'b', 'c']
		}),
		'abc'
	)
})
