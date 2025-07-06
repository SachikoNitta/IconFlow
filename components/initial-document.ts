// Initial document content for the IconFlow Editor
export const initialDocumentContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to IconFlow Editor" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a rich text editor that lets you insert " },
        { type: "text", marks: [{ type: "strong" }], text: "SVG icons" },
        { type: "text", text: " directly into your content. Try the features below:" }
      ]
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Text Formatting" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "You can make text " },
        { type: "text", marks: [{ type: "strong" }], text: "bold" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "em" }], text: "italic" },
        { type: "text", text: ", or " },
        { type: "text", marks: [{ type: "code" }], text: "monospace" },
        { type: "text", text: " using the toolbar or keyboard shortcuts." }
      ]
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Icons in Action" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Express yourself with icons: " },
        { type: "icon", attrs: { iconName: "smile" } },
        { type: "text", text: " Show appreciation " },
        { type: "icon", attrs: { iconName: "thumbs-up" } },
        { type: "text", text: " Rate content " },
        { type: "icon", attrs: { iconName: "star" } },
        { type: "text", text: " Celebrate achievements " },
        { type: "icon", attrs: { iconName: "crown" } }
      ]
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Content Categories" }]
    },
    {
      type: "bullet_list",
      content: [
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Emotions: " },
                { type: "icon", attrs: { iconName: "smile" } },
                { type: "text", text: " " },
                { type: "icon", attrs: { iconName: "thumbs-up" } }
              ]
            }
          ]
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Food & Drink: " },
                { type: "icon", attrs: { iconName: "coffee" } }
              ]
            }
          ]
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Media: " },
                { type: "icon", attrs: { iconName: "music" } },
                { type: "text", text: " " },
                { type: "icon", attrs: { iconName: "camera" } }
              ]
            }
          ]
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Objects: " },
                { type: "icon", attrs: { iconName: "gift" } },
                { type: "text", text: " " },
                { type: "icon", attrs: { iconName: "crown" } },
                { type: "text", text: " " },
                { type: "icon", attrs: { iconName: "diamond" } }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Advanced Features" }]
    },
    {
      type: "ordered_list",
      content: [
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Real-time Export: " },
                { type: "text", text: "Toggle preview to see live JSON and HTML output" }
              ]
            }
          ]
        },
        {
          type: "list_item",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", marks: [{ type: "strong" }], text: "Keyboard Shortcuts: " },
                { type: "text", text: "Full support for standard editing shortcuts" }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Technical Details" }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Built with " },
        { type: "text", marks: [{ type: "code" }], text: "ProseMirror" },
        { type: "text", text: ", " },
        { type: "text", marks: [{ type: "code" }], text: "React" },
        { type: "text", text: ", and " },
        { type: "text", marks: [{ type: "code" }], text: "TypeScript" },
        { type: "text", text: ". Icons are stored as SVG data in JSON format for optimal performance and customization." }
      ]
    }
  ]
}