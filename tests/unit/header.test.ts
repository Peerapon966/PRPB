import { it, expect, describe, beforeAll, beforeEach } from "vitest";
import { globSync } from "glob";
import path from "node:path";

type Frontmatter = {
  layout: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
  description: string;
  slug: string;
  thumbnail: boolean;
};

// Get all blog (.mdx) files
const mdxFiles = globSync("./src/pages/blog/*.mdx");

// All currently available tags, used as a reference
let availableTags: string[] = [];
beforeAll(async () => {
  const response = await fetch(
    `${import.meta.env.PUBLIC_API_ENDPOINT}/tags?select=name`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const fetchedTags = (await response.json()) as { name: string }[];
  availableTags = fetchedTags.map((tag) => tag.name);
}, 10000);

mdxFiles.forEach((filePath) => {
  const fileName = path.basename(filePath);
  describe(fileName, () => {
    let frontmatter: Frontmatter;
    beforeEach(async () => {
      const module = await import(path.resolve(filePath));
      frontmatter = module.frontmatter;
    });

    it("should have valid slug", () => {
      expect(frontmatter.slug).toEqual(fileName.replace(".mdx", ""));
    });

    it("should use available tags", () => {
      expect(availableTags).containSubset(frontmatter.tags);
    });
  });
});
