"use client";

import { useState, useRef } from "react";

import { TagFilter } from "@/components/blogs/TagFilter";
import { BlogItem } from "@/components/blogs/BlogItem";
import { Button } from "../ui/button";

const BLOG_PER_REQUEST = 12;

export type BlogItemProps = {
  title: string;
  description?: string;
  publishDate: string;
  category: string;
  subcategories?: string[];
  slug: string;
  thumbnail: string;
};

export type FetchBlogsProps = {
  category: string;
  subcategory: string;
  lastBlog?: BlogItemProps;
};

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogItemProps[]>([]);
  const [lastBlog, setLastBlog] = useState<BlogItemProps>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const prevCategory = useRef<string | null>(null);
  const prevSubcategory = useRef<string | null>(null);

  /* eslint-disable react/prop-types */
  /* eslint-disable @typescript-eslint/no-unused-expressions */
  function getQueryString(props: FetchBlogsProps): string {
    let queryString = "";

    if (props?.category) {
      queryString
        ? (queryString += `&cat=${props.category}`)
        : (queryString = `?cat=${props.category}`);
    }

    if (props?.subcategory) {
      queryString
        ? (queryString += `&sub_cat=${props.subcategory}`)
        : (queryString = `?sub_cat=${props.subcategory}`);
    }

    if (props?.lastBlog) {
      queryString
        ? (queryString += `&last_pub_date=${props.lastBlog.publishDate}&last_slug=${props.lastBlog.slug}`)
        : (queryString = `?last_pub_date=${props.lastBlog.publishDate}&last_slug=${props.lastBlog.slug}`);
    }

    return queryString;
  }

  async function fetchBlogs(
    props: FetchBlogsProps = { category: "", subcategory: "" },
  ) {
    const categoryChanged = props.category !== prevCategory.current;
    const subcategoryChanged = props.subcategory !== prevSubcategory.current;
    const filterChanged = categoryChanged || subcategoryChanged;

    // users click the 'Apply' button without changing the filter
    if (!props.lastBlog && !filterChanged) return;

    const queryString = getQueryString(props);
    const response = await fetch(
      `${import.meta.env.SITE}/api/blogs${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const { blogs } = (await response.json()) as { blogs: BlogItemProps[] };

    filterChanged
      ? setBlogs(blogs)
      : setBlogs((oldBlogs) => [...oldBlogs, ...blogs]);

    setHasMore(!(blogs.length < BLOG_PER_REQUEST));
    setLastBlog(blogs[blogs.length - 1]);

    if (categoryChanged) prevCategory.current = props.category;
    if (subcategoryChanged) prevSubcategory.current = props.subcategory;
  }

  return (
    <div className="w-full min-w-[300px] max-w-[1440px] flex flex-col items-center mt-8">
      <TagFilter
        category={category}
        setCategory={setCategory}
        setSubcategory={setSubcategory}
        fetchBlogs={fetchBlogs}
      />
      <div
        className="w-full mt-8 px-4 grid gap-x-6 gap-y-6 justify-center"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
      >
        {blogs.map((blog, idx) => (
          <BlogItem key={idx} {...blog} />
        ))}
      </div>
      {hasMore && (
        <div className="my-8">
          <Button
            onClick={() => {
              fetchBlogs({
                category,
                subcategory,
                lastBlog,
              });
            }}
          >
            More
          </Button>
        </div>
      )}
    </div>
  );
}
