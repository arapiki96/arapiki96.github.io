import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "body" },
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
        }),
        body: fields.markdoc({
          label: "Body",
          extension: "md",
        }),
        draft: fields.checkbox({
          label: "Draft",
          description: "Hide this post from the blog index and build.",
        }),
      },
    }),
  },
});
