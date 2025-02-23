---
title: "How To Use Document Fields"
description: "Learn how to configure Keystone’s highly customizable Rich Text editor. The Document field is built with Slate and stores your content as JSON-structured data."
---

The [`document`](../fields/document) field type is a highly customizable rich text editor that lets content creators quickly and easily edit content in your system.

It's built with [Slate](https://docs.slatejs.org/), stores your content as JSON-structured data, and lets you do things like:

- Configure the types of formatting used in your documents
- Easily render the document in your application
- Insert relationships to other items in your Keystone database
- Define your own custom editor blocks based on React Components

To see the document field in action, try out the [demo](./document-field-demo).

## Configuration

The document field provides a number of different formatting options, all of which can be configured.
To get started with a fully featured editor experience, you can turn on all of the built-in options.

```typescript
import { list } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';

export const lists = {
  Post: list({
    fields: {
      content: document({
        formatting: true,
        dividers: true,
        links: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
        ],
      }),
    },
  }),
};
```

This has enabled all of the **formatting** options, enabled inline **links**, section **dividers**, and both 2 and 3 column **layouts**.

We can disable any of these features by simply omitting the option from our configuration.

### Formatting

Setting `formatting: true` turns on all the formatting options for the document.
If you need more fine-grained control over which options are enabled, you can explicitly list the features you want, e.g.

```typescript
content: document({
  formatting: {
    inlineMarks: {
      bold: true,
      italic: true,
      underline: true,
      strikethrough: true,
      code: true,
      superscript: true,
      subscript: true,
      keyboard: true,
    },
    listTypes: {
      ordered: true,
      unordered: true,
    },
    alignment: {
      center: true,
      end: true,
    },
    headingLevels: [1, 2, 3, 4, 5, 6],
    blockTypes: {
      blockquote: true,
      code: true
    },
    softBreaks: true,
  },
}),
```

All the features set to `true` will be enabled in your document field.
To disable a specific feature you can simply omit it from the configuration.

If you want to enable all the options in a particular sub-group, you can set the group to `true`.
For example, to enable all `listType` options you could set `listType: true`.

You can experiment with the different configuration settings in the [document field demo](./document-field-demo).

## Querying

Each document field will generate a type within your GraphQL schema. The example above of a `content` field in the `Post` list would generate the type:

```graphql
type Post_content_DocumentField {
  document(hydrateRelationships: Boolean! = false): JSON!
}
```

To query the content we can run the following GraphQL query, which will return the JSON representation of the content in `posts.content.document`.

```graphql
query {
  posts {
    content {
      document
    }
  }
}
```

We will discuss the `hydrateRelationships` option [below](#inline-relationships).

The document data is stored as JSON.
You can use the [document field demo](./document-field-demo) to interactively explore how data is stored when you make changes in the document editor.

## Rendering

To render the document in a React app, use the `@keystone-6/document-renderer` package.

```tsx
import { DocumentRenderer } from '@keystone-6/document-renderer';

<DocumentRenderer document={document} />;
```

The `DocumentRenderer` component accepts the `JSON` representation of the document returned by the GraphQL API.

### Overriding the default renderers

The `DocumentRenderer` has built in renderers for all the different types of data stored in the JSON formatted data.
If you need to override these defaults, you can do so by providing your own renderers to `DocumentRenderer`.

```tsx
import { DocumentRenderer, DocumentRendererProps } from '@keystone-6/document-renderer';

const renderers: DocumentRendererProps['renderers'] = {
  // use your editor's autocomplete to see what other renderers you can override
  inline: {
    bold: ({ children }) => {
      return <strong>{children}</strong>;
    },
  },
  block: {
    paragraph: ({ children, textAlign }) => {
      return <p style={{ textAlign }}>{children}</p>;
    },
  },
};

<DocumentRenderer document={document} renderers={renderers} />;
```

## Inline Relationships

The document field can also have inline relationships which reference other items in your system.
For example, you might want to include twitter-style mentions of other users in a blog application.
We can achieve this with the `relationships` option to the document field.

```tsx
import { config, list } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';
import { text } from '@keystone-6/core/fields';

export default config({
  lists: {
    Post: list({
      fields: {
        content: document({
          relationships: {
            mention: {
              listKey: 'Author',
              label: 'Mention',
              selection: 'id name',
            },
          },
        }),
      },
    }),
    Author: list({
      fields: {
        name: text(),
      }
    }),
  },
});
```

When you add an inline relationship to your document field, it becomes accessible in the Admin UI behind the `+` icon.
This menu uses the `label` specified in the relationship config.

![The Admin UI showing the relationship label behind the plus menu icon](/assets/guides/document-fields/inline-relationship-label.png)

You can also access the relationship directly using the `/` command and then starting to type the label.

![The Admin UI showing use of slash (/) to select the inline relationship](/assets/guides/document-fields/inline-relationship-slash.png)

You can then select an item from the list specified by `listKey` from the inline select component in the document editor.

![The Admin UI showing the select field used to choose a related item](/assets/guides/document-fields/inline-relationship-select.png)

{% hint kind="tip" %}
**Tip**: The select component will use the [`ui.labelField`](../config/lists#ui) of the related list in its options list.
Make sure you have this value configured to make finding related items easier for your users.
{% /hint %}

### Querying inline relationships

The document field stores the `id` of the related item in its data structure.
If you query for the document, the inline relationship block will include the ID as `data.id`.

```JSON
...
  {
    "type": "relationship",
    "data": {
      "id": "ckqk4hkcg0030f5mu6le6xydu"
    },
    "relationship": "mention",
    "children": [{ "text": "" }]
  },
...
```

This is generally not very useful if you want to render the item in your document.
To obtain more useful data, we can pass the `hydrateRelationships: true` option to our query.

```graphql
query {
  posts {
    content {
      document(hydrateRelationships: true)
    }
  }
}
```

This will add a `data.label` value, based on the related item's label field, and a `data.data` value, which is populated with the data indicated by the `selection` config option.

```JSON
...
  {
    "type": "relationship",
    "data": {
      "id": "ckqk4hkcg0030f5mu6le6xydu",
      "label": "Alice",
      "data": {
        "id": "ckqk4hkcg0030f5mu6le6xydu",
        "name": "Alice"
      }
    },
    "relationship": "mention",
    "children": [{ "text": "" }
  },
...
```

{% hint kind="warn" %}
**Null data:** It is possible to add an inline relationship in the document editor without actually selecting a related item. In these cases, the value of `data` will be `null`.
{% /hint %}

{% hint kind="warn" %}
**Dangling references:** The data for relationships are stored as IDs within the JSON data structure of the document.
If an item in your database is deleted, the document field will not have any knowledge of this, and you will be left with a dangling reference in your document data.
In other instances the person querying for the document may not have read access to the related item.
In both these cases the `data.label` and `data.data` values will be `undefined`.
{% /hint %}

### Rendering inline relationships

The `DocumentRenderer` has a rudimentary renderer built in for inline relationships which simply returns the `data.label` (or `data.id` if `hydrateRelationships` is `false`) inside a `<span>` tag.
This is unlikely to be what you want, so you will need to define a custom renderer for your relationship.

A custom renderer for our `mention` relationship might look like:

```typescript
import { DocumentRenderer, DocumentRendererProps } from '@keystone-6/document-renderer';

const renderers: DocumentRendererProps['renderers'] = {
  inline: {
    relationship({ relationship, data }) {
      if (relationship === 'mention') {
        if (data === null || data.data === undefined) {
          return <span>[unknown author]</span>
        } else {
          return <Link href={`/author/${data.data.id}`}>{data.data.name}</Link>;
        }
      }
      return null;
    },
  },
};

<DocumentRenderer document={document} renderers={renderers} />;
```

The `relationship` argument lets you write renderers for each of the different relationships defined in your document.
The `data` argument is provided directly from the query, and we can use the properies of `data.data` to render our mentions as links to the author's page.

{% hint kind="warn" %}
**Missing data:** Make sure your renderer checks for `data === null` (no item selected) and `data.data === undefined` (selected item not found) and handles these cases appropriately.
{% /hint %}

## Component Blocks

Component blocks let you add custom blocks to the editor that can accept unstructured content and render a form that renders arbitrary React components for input.

To add component blocks, you need to create a file somewhere and export component blocks from there

`component-blocks.tsx`

```tsx
import React from 'react';
import { NotEditable, component, fields } from '@keystone-6/fields-document/component-blocks';

// naming the export componentBlocks is important because the Admin UI
// expects to find the components like on the componentBlocks export
export const componentBlocks = {
  quote: component({
    preview: (props) => {
      return (
        <div
          style={{
            borderLeft: '3px solid #CBD5E0',
            paddingLeft: 16,
          }}
        >
          <div style={{ fontStyle: 'italic', color: '#4A5568' }}>{props.fields.content.element}</div>
          <div style={{ fontWeight: 'bold', color: '#718096' }}>
            <NotEditable>— </NotEditable>
            {props.fields.attribution.element}
          </div>
        </div>
      );
    },
    label: 'Quote',
    schema: {
      content: fields.child({
        kind: 'block',
        placeholder: 'Quote...',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
        links: 'inherit',
      }),
      attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
    },
    chromeless: true,
  }),
};
```

You need to import the `componentBlocks` and pass it to the document field along with the path to the file with the component blocks to `ui.views`.

`keystone.ts`

```ts
import { config, list } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';
import { componentBlocks } from './component-blocks';

export default config({
  lists: {
    ListName: list({
      fields: {
        fieldName: document({
          ui: {
            views: './component-blocks'
          },
          componentBlocks,
        }),
      },
    }),
  },
});
```
{% summary %}
In the `examples/document-field-customisation` example, the Quote, Notice, Hero and Checkbox List items are
written as component blocks.
{% /summary %}

### Fields

There are a variety of fields you can configure.

#### Child Fields

Child fields allow you to embed an editable region inside of a component block preview.

They can either have `kind: 'inline'`, or `kind: 'block'`.
This refers to **what elements can be inside of them**.
`kind: 'inline'` child fields can only contain text with marks/links/inline relationships.
`kind: 'block'` child fields contain block-level elements such as paragraph, lists, etc.

They require a placeholder which is shown when there is no text inside the child field.
The placeholder is required though it can be an empty string if it'll be clear to editors that the location of the child field is editable.

By default, child fields can only contain plain text, if you'd like to enable other features of the document editor inside a child field, you can enable the features similarly to enabling them in the document field config.
Unlike the document field config though, these options accept `'inherit'` instead of `true`, this is because if `'inherit'` is set then that feature will be enabled **if it's also enabled at the document field config level** so you can't enable features in a child field but not in the rest of the document field.

In the preview, child fields appear as React nodes that should be rendered.
Note that you **must** render child fields in the preview.
If they are not rendered, you will receive errors.

```tsx
import { NotEditable, component, fields } from '@keystone-6/fields-document/component-blocks';

component({
  preview: (props) => {
    return (
      <div
        style={{
          borderLeft: '3px solid #CBD5E0',
          paddingLeft: 16,
        }}
      >
        <div style={{ fontStyle: 'italic', color: '#4A5568' }}>{props.fields.content.element}</div>
        <div style={{ fontWeight: 'bold', color: '#718096' }}>
          <NotEditable>— </NotEditable>
          {props.fields.attribution.element}
        </div>
      </div>
    );
  },
  label: 'Quote',
  schema: {
    content: fields.child({
      kind: 'block',
      placeholder: 'Quote...',
      formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
      links: 'inherit',
    }),
    attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
  },
  chromeless: true,
})
```

> Note: You have to be careful to wrap `NotEditable` around other elements in the preview but you cannot wrap it around a child field.

#### Form Fields

`@keystone-6/core/component-blocks` ships with a set of form fields for common purposes:

- `fields.text({ label: '...', defaultValue: '...' })`
- `fields.integer({ label: '...', defaultValue: '...' })`
- `fields.url({ label: '...', defaultValue: '...' })`
- `fields.select({ label: '...', options: [{ label:'A', value:'a' }, { label:'B', value:'b' }] defaultValue: 'a' })`
- `fields.checkbox({ label: '...', defaultValue: false })`

You can write your own form fields that conform to this API.

```ts
type FormField<Value, Options> = {
  kind: 'form';
  Input(props: {
    value: Value;
    onChange(value: Value): void;
    autoFocus: boolean;
    /**
     * This will be true when validate has returned false and the user has attempted to close the form
     * or when the form is open and they attempt to save the item
     */
    forceValidation: boolean;
  }): ReactElement | null;
  /**
   * The options are config about the field that are available on the
   * preview props when rendering the toolbar and preview component
   */
  options: Options;
  defaultValue: Value;
  /**
   * validate will be called in two cases:
   * - on the client in the editor when a user is changing the value.
   *   Returning `false` will block closing the form
   *   and saving the item.
   * - on the server when a change is received before allowing it to be saved
   *   if `true` is returned
   * @param value The value of the form field. You should NOT trust
   * this value to be of the correct type because it could come from
   * a potentially malicious client
   */
  validate(value: unknown): boolean;
};
```

#### Object Fields

To nest a group of component block fields, you can use `fields.object`

```tsx
import { fields } from '@keystone-6/fields-document/component-blocks';

fields.object({
  a: fields.text({ label: 'A' }),
  b: fields.text({ label: 'B' }),
});
```

#### Relationship Fields

To use relationship fields on component blocks, you need to add a relationship field and provide a list key, label and options selection.
In the form, it will render a relationship select like the relationship field on lists.
Similarly to inline relationships, they will be hydrated with this selection if `hydrateRelationships: true` is provided when fetching.

{% hint kind="warn" %}
We recently updated the config API for inline relationships in component blocks. If you’re using a version prior to 2022-03-25 please [read this](https://github.com/keystonejs/keystone/releases/tag/2022-03-25) upgrade guidance.
{% /hint %}

```tsx
import { fields } from '@keystone-6/fields-document/component-blocks';

...
  someField: fields.relationship({
    label: 'Authors',
    listKey: 'Author',
    selection: 'id name posts { title }',
    many: true,
  });
...
```

> Note: Like inline relationships, relationship fields on component blocks are not stored like relationship fields on lists, they are stored as ids in the document structure.

### Objects

```tsx
import { fields } from '@keystone-6/fields-document/component-blocks';

fields.object({
  text: fields.text({ label: 'Text' }),
  child: fields.placeholder({ placeholder: 'Content...' }),
});
```

### Conditional Fields

You can conditionally show different fields with `fields.conditional`, they require a form field with a value that is either a string or a boolean as the discriminant and an object of fields for the values.

```tsx
import { fields } from '@keystone-6/fields-document/component-blocks';

fields.conditional(fields.checkbox({ label: 'Show Call to action' }), {
  true: fields.object({
    url: fields.url({ label: 'URL' }),
    content: fields.child({ kind: 'inline', placeholder: 'Call to Action' }),
  }),
  false: fields.empty(),
});
```

> You might find `fields.empty()` useful which stores and renders nothing if you want to have a field in one case and nothing anything in another

### Array Fields

Array fields allow you to store an array of another component block field type.

```tsx
import { fields } from '@keystone-6/fields-document/component-blocks';

fields.array(fields.object({
  isComplete: fields.checkbox({ label: 'Is Complete' }),
  content: fields.child({ kind: 'inline', placeholder: '' }),
}))
```

### Chromeless

If you want to hide the default UI around your component block, you can set `chromeless: true`. This removes the border, toolbar, and generated form.

```jsx
quote: component({
  preview: ({ attribution, content }) => {
    ...
  },
  label: 'Quote',
  schema: {
    ...
  },
  chromeless: true,
}),
```

You can see the differences between each below:

![Quote component blocks demonstrating chrome, and chromeless styling](/assets/guides/document-fields/chomeless-example-docs-demo.png)

In the [document editor demo](/docs/guides/document-field-demo), the Notice and Quote blocks are chromeless, but the Hero block has the standard chrome styling.

### Rendering Component blocks

#### Typing props for rendering component blocks

If you're using TypeScript, you can infer the props types for component with `InferRenderersForComponentBlocks` from `@keystone-6/fields-document/component-blocks`.

```tsx
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { InferRenderersForComponentBlocks } from '@keystone-6/fields-document/component-blocks';
import { componentBlocks } from '../path/to/your/custom/views';

const componentBlockRenderers: InferRenderersForComponentBlocks<typeof componentBlocks> = {
  someComponentBlock: props => {
    // props will be inferred from your component blocks
  },
};

<DocumentRenderer document={document} componentBlocks={componentBlockRenderers} />;
```

## Related resources

{% related-content %}
{% well
heading="Example: Document Field"
href="https://github.com/keystonejs/keystone/tree/main/examples/document-field"
target="_blank" %}
Illustrates how to configure `document` fields in your Keystone system and render their data in a frontend application. Builds on the Blog starter project.
{% /well %}
{% well
heading="Example: Document Field Customisation"
href="https://github.com/keystonejs/keystone/tree/main/examples/document-field-customisation" %}
Example to demonstrate customisation of Keystone's document field and document renderer.
{% /well %}
{% well
heading="Document Field Demo"
href="/docs/guides/document-field-demo" %}
Test drive the many features of Keystone’s Document field on this website.
{% /well %}
{% /related-content %}
