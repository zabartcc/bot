module.exports = {
    root: true,
    ignorePatterns: ['.eslintrc.js'],
    extends: [
        'airbnb',
        'airbnb-typescript'
    ],
    env: {
        node : true,
		es6 : true
	},
    parserOptions: {
        ecmaVersion: 8,
        sourceType: "module",
        ecmaFeatures: {
			impliedStrict: true
        },
        project: "./tsconfig.json"
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.ts']
            }
        }
    },
    rules: {
        "no-console": process.env.NODE_ENV === 'production' ? 2 : 0,
        "no-debugger": process.env.NODE_ENV === 'production' ? 2 : 0,
        "@typescript-eslint/indent": [2, "tab"],
        "no-tabs": 0,
        "max-len": 0,
        "keyword-spacing": 0,
        "@typescript-eslint/keyword-spacing": 0,
        "no-extend-native": 0, 
        "func-names": 0,
        "@typescript-eslint/space-before-function-paren": 0,
        "no-restricted-syntax": 0,
        "no-mixed-operators": 0
    }
}
