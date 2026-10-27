import { it, expect, describe, beforeAll } from "vitest";
import { globSync } from "glob";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  type BlogDetail,
  type BlogIndexData,
} from "@/components/blogs/BlogList";

// Get all blog (.mdx) files
const mdxFiles = globSync("./src/pages/blog/*.mdx");

// All currently available tags and blogs from index file
let availableTags: string[] = [];
let indexedBlogs: Record<string, BlogDetail> = {};
beforeAll(() => {
  const indexFilePath = path.join(
    process.cwd(),
    import.meta.env.PUBLIC_INDEX_FILE ?? "/data/index.json",
  );
  const indexData = JSON.parse(
    readFileSync(indexFilePath, "utf-8"),
  ) as BlogIndexData;
  availableTags = indexData.tags;
  indexedBlogs = indexData.blogs;
});

describe("index file blogs", () => {
  it("should use available tags", () => {
    Object.values(indexedBlogs).forEach((blog) => {
      expect(availableTags).containSubset(blog.tags);
    });
  });
});

mdxFiles.forEach((filePath) => {
  const fileName = path.basename(filePath);
  const slug = fileName.replace(".mdx", "");
  describe(fileName, () => {
    it("should exist in index file", () => {
      expect(indexedBlogs).toHaveProperty(slug);
    });
  });
});
