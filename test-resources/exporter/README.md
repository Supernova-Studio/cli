![CSS Exporter](https://raw.githubusercontent.com/Supernova-Studio/exporters/main/exporters/css/resources/header.png)

# CSS Exporter

The CSS Exporter is a powerful package for converting your design system data into production-ready CSS. It facilitates a seamless transition from design to development, ensuring consistency and accuracy throughout the process. The CSS exporter has a variety of configuration options to make sure the CSS always fits your codebase.

## Exporter Features

This exporter package takes your design system tokens and converts them to CSS in various ways. Here are its key features:

- **Support for all Supernova token types:** Generates CSS from all token types, including colors, text styles, shadows, dimensions and more.
- **Branding support:** Can generate CSS for different brands you've defined in Supernova.
- **Theming support:** Can generate CSS for different themes you've defined in Supernova.
- **Customizable output:** Can be configured to generate CSS in variety of ways.
- **Customizable formatting:** Can be configured to generate each token using various formatting, like hex, rgb, camelCase and so on.
- **Comment support:** Can include descriptions for each token as code comments, if provided. Can also provide a disclaimer at the top of each file to prevent people from tinkering with the generated code manually.
- **File organization:** Can generate output in various ways, such as separate files for each token type, or a single file with all tokens.

## Example of Output

Given the following design system token (meta representation for brevity):

```typescript
const tokens = [{
    type: "color",
    name: "red",
    value: "#ff0000",
    description: "The reddest of reds"
}, {
    type: "color",
    name: "blue",
    value: "#0000ff",
}, {
    type: "color",
    name: "primary",
    value: "{primary}",
    description: "The main color used throughout the application"
}];
```

With configurations:

```json
{
    "showGeneratedFileDisclaimer": true,
    "disclaimer": "This file was automatically generated. Do not modify manually.",
    "showDescriptions": true,
    "useReferences": true,
    "tokenNameStyle": "kebabCase",
    "colorFormat": "hex",
    "indent": 2
}
```

The exporter would produce:

```css
/* This file was automatically generated. Do not modify manually. */

:root {
  /* The reddest of reds */
  --color-red: #ff0000;
  --color-blue: #0000ff;
  /* The main color used throughout the application. */
  --color-primary: var(--color-red);
}
```

## Configuration Options

Here is a list of all the configuration options this exporter provides:

- **showGeneratedFileDisclaimer:** Toggle to show a disclaimer indicating the file is auto-generated.
  
- **disclaimer:** Set the text of the aforementioned disclaimer.
  
- **generateIndexFile:** Decide whether an aggregate index file should be created.
  
- **generateEmptyFiles:** Choose if files with no styles should still be generated.
  
- **showDescriptions:** Display descriptions for each token as code comments.
  
- **useReferences:** Use references to other tokens instead of direct values where possible.
  
- **tokenNameStyle:** Define the naming convention of the exported tokens.
  
- **colorFormat:** Set the format in which colors are exported.
  
- **colorPrecision:** Determine the number of decimals for exported colors.
  
- **indent:** Set the number of spaces for indentation.
  
- **tokenPrefixes:** Prefix each token type with a specific identifier.
  
- **styleFileNames:** Name the generated style files based on token types.
  
- **indexFileName:** Name the generated index file.
  
- **baseStyleFilePath:** Define the directory path for style files.
  
- **baseIndexFilePath:** Define the directory path for the index file.
