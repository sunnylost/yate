module.exports = {
	root: true,
	env: {
		node: true,
		es6: true
	},
	parser: 'babel-eslint',
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	plugins: ['prettier'],
	rules: {
		'prettier/prettier': 'error'
	}
}
