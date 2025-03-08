import js from "@eslint/js";

// Single pass detection of file types
const detectedFileTypes = new Set(
  process.argv.slice(2).map(file => file.split('.').pop())
);

const hasFile = (ext) => detectedFileTypes.has(ext);
const hasAstroFiles = hasFile('astro');
const hasMdxFiles = hasFile('mdx');
const hasSvelteFiles = hasFile('svelte');
const hasTsFiles = hasFile('ts') || hasFile('tsx');

const getTsConfig = async () => {
  const tseslint = await import('typescript-eslint');
  
  return tseslint.configs.recommended.map(config => {
    // If files property is missing, add it
    if (!config.files) {
      return {
        ...config,
        files: ['**/*.ts', '**/*.tsx']
      };
    }
    return config;
  }).concat([
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            "vars": "none",
            "args": "after-used",
            "caughtErrors": "none",
            "ignoreRestSiblings": false
          }
        ],
        "@typescript-eslint/prefer-as-const": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unnecessary-type-constraint": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/prefer-namespace-keyword": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-empty-object-type": "off",
      }
    }
  ]);
};

const getAstroConfig = async () => {
  const eslintPluginAstro = await import('eslint-plugin-astro');
  
  return eslintPluginAstro.configs.recommended.map(config => {
    // If files property is missing, add it
    if (!config.files) {
      return {
        ...config,
        files: ['**/*.astro']
      };
    }
    return config;
  });
};

const getMdxConfig = async () => {
  const mdx = await import('eslint-plugin-mdx');
  return [
    {
      ...mdx.flat,
      processor: mdx.createRemarkProcessor({
        lintCodeBlocks: true,
        languageMapper: {},
      }),
    },
    {
      ...mdx.flatCodeBlocks,
      rules: {
        ...mdx.flatCodeBlocks.rules,
        "prettier/prettier": "off"
      },
    }
  ];
};

const getSvelteConfig = async () => {
  const eslintPluginSvelte = await import('eslint-plugin-svelte');
  
  return eslintPluginSvelte.configs['flat/recommended'].map(config => {
    // If files property is missing, add it
    if (!config.files) {
      return {
        ...config,
        files: ['**/*.svelte']
      };
    }
    return config;
  }).concat({
    files: [ "**/*.svelte" ],
    rules: {
      "svelte/no-at-html-tags": "off",
      "svelte/no-target-blank": "off",
      "svelte/valid-compile": [
        "error",
        {
          "ignoreWarnings": true
        }
      ]
    }
  });
};

export default [
  js.configs.recommended,
  {
      rules: {
          "no-undef": "off",
          "no-fallthrough": "off",
          "no-mixed-spaces-and-tabs": "off",
          "no-redeclare": "off",
          "no-with": "off",
          "no-prototype-builtins": "off",
          "no-misleading-character-class": "off",
          "no-async-promise-executor": "off",
          "no-import-assign": "off",
          "no-sparse-arrays": "off",
          "no-useless-escape": "off",
          "no-empty": [
              "error",
              { "allowEmptyCatch": true }
          ],
          "no-unused-vars": [
              "warn",
              {
                  "vars": "none",
                  "args": "after-used",
                  "caughtErrors": "none",
                  "ignoreRestSiblings": false
              }
          ],
          "no-warning-comments": ["warn", {
              terms: ["todo", "fixme", "xxx"],
              location: "start"
          }]
      },
  },
  ...(hasTsFiles 
    ? await getTsConfig() 
    : []),
  ...(hasAstroFiles 
    ? await getAstroConfig() 
    : []),
  ...(hasMdxFiles 
    ? await getMdxConfig()
    : []),
  ...(hasSvelteFiles 
    ? await getSvelteConfig()
    : [])
];
