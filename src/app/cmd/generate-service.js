module.exports = {
    overwrite: true,
    schema: {
        'http://localhost:30001/graphql': {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    },
    // documents: './src/graphql/*.graphql',
    generates: {
        'src/app/commons/types.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-apollo-angular',
            ],
            config: {
                skipTypename: true,
                skipTypeNameForRoot: true,
                scalars: {ID: 'string' | 'number'},
                namingConvention: 'change-case-all#upperCaseFirst',
            },
        }
    },
}
