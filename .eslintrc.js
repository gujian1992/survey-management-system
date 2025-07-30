module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 2021,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'vue/multi-word-component-names': 'off',
        'vue/require-default-prop': 'off',
        // 自定义规则，强制要求修改时添加 MODIFY 标记
        'spaced-comment': ['error', 'always', {
            'markers': ['MODIFY:']
        }],
        // 强制要求函数和类方法必须有注释
        'require-jsdoc': ['error', {
            'require': {
                'FunctionDeclaration': true,
                'MethodDefinition': true,
                'ClassDeclaration': true,
                'ArrowFunctionExpression': false,
                'FunctionExpression': false
            }
        }]
    }
} 