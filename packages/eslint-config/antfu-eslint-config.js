import antfu from '@antfu/eslint-config'

export const eslintConfig = antfu({
  type:"lib",
  stylistics: {
    indent: 2,
    semi: true,
    quotes: 'double',
  },
  rules: {
    'ts/explicit-function-return-type': 0,
    'no-console': 0,
    'perfectionist/sort-imports': ['error', {
      type: 'line-length',
      internalPattern: ['^@ui/.+', '^@charts/.+', '^@/.+'],
    }],
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: ['README.md'],
      },
    ],
  },
  ignores: [
    "**/docs.md"
  ]
})
