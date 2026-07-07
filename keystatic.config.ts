import { config, fields, collection } from "@keystatic/core";

// Keep in sync with BEATS in src/content.config.ts
const beatOptions = [
  { label: "Foreign affairs", value: "Foreign affairs" },
  { label: "Infrastructure", value: "Infrastructure" },
  { label: "Politics", value: "Politics" },
  { label: "Transport", value: "Transport" },
  { label: "Defence", value: "Defence" },
  { label: "General", value: "General" },
];

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

    // "Now" — curated BusinessDesk reporting for the Work page.
    work: collection({
      label: "Work — BusinessDesk (Now)",
      slugField: "title",
      path: "src/content/work/*",
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        url: fields.url({
          label: "Article URL",
          validation: { isRequired: true },
        }),
        beat: fields.select({
          label: "Beat",
          options: beatOptions,
          defaultValue: "Infrastructure",
        }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
      },
    }),

    // "Before" — earlier politics reporting at The Post & Stuff.
    politics: collection({
      label: "Work — Politics (Before)",
      slugField: "title",
      path: "src/content/politics/*",
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        url: fields.url({
          label: "Article URL",
          validation: { isRequired: true },
        }),
        beat: fields.select({
          label: "Beat",
          options: beatOptions,
          defaultValue: "Politics",
        }),
        outlet: fields.select({
          label: "Outlet",
          options: [
            { label: "The Post", value: "The Post" },
            { label: "Stuff", value: "Stuff" },
          ],
          defaultValue: "The Post",
        }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
      },
    }),
  },
});
