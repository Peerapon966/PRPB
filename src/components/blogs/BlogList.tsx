"use client";

import { useState, useEffect, useRef } from "react";

import { TagFilter } from "@/components/blogs/TagFilter";
import { BlogItem } from "@/components/blogs/BlogItem";
import { Button } from "@/components/ui/button";

const BLOG_PER_REQUEST = Number(
  import.meta.env.PUBLIC_BLOG_ITEMS_PER_PAGE ?? 12,
);

export type BlogDetail = {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  tags: string[];
  thumbnail?: boolean;
};

export type BlogItemProps = BlogDetail & {
  slug: string;
};

export type BlogIndexData = {
  tags: string[];
  blogs: Record<string, BlogDetail>;
};

export type FetchBlogsProps = {
  page: number;
  searchText: string;
  selectedTags: string[];
  useAndLogic: boolean;
};

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogItemProps[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [useAndLogic, setUseAndLogic] = useState<boolean>(false);
  const allBlogs = useRef<BlogItemProps[]>([]);
  const hasFetchedOnce = useRef<boolean>(false);
  const prevPage = useRef<number | null>(null);
  const prevSelectedTags = useRef<string[] | null>(null);
  const prevSearchText = useRef<string | null>(null);
  const prevUseAndLogic = useRef<boolean | null>(null);

  useEffect(() => {
    async function fetchIndexData() {
      const response = await fetch(
        import.meta.env.PUBLIC_INDEX_FILE ?? "/data/index.json",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = (await response.json()) as BlogIndexData;
      const blogsList: BlogItemProps[] = Object.entries(data.blogs).map(
        ([slug, blog]) => ({
          slug,
          ...blog,
        }),
      );
      allBlogs.current = blogsList.toSorted((a, b) =>
        b.publishDate.localeCompare(a.publishDate),
      );
      setTags(data.tags);
    }
    fetchIndexData().catch((error: unknown) => {
      console.error("Failed to load blog index:", error);
    });
  }, []);

  function setPageQueryParam(nextPage: number) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", String(nextPage));
    const nextQueryString = searchParams.toString();
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}${nextQueryString ? `?${nextQueryString}` : ""}`,
    );
  }

  /* eslint-disable react/prop-types */
  function fetchBlogs(
    props: FetchBlogsProps = {
      page: 1,
      searchText: "",
      selectedTags: [],
      useAndLogic: false,
    },
  ) {
    const pageChanged = props.page !== (prevPage.current ?? 1);
    const searchTextChanged =
      props.searchText !== (prevSearchText.current ?? "");
    const selectedTagsChanged =
      JSON.stringify(props.selectedTags) !==
      JSON.stringify(prevSelectedTags.current ?? []);
    const useAndLogicChanged =
      props.useAndLogic !== (prevUseAndLogic.current ?? null);
    const filterChanged =
      pageChanged ||
      selectedTagsChanged ||
      searchTextChanged ||
      useAndLogicChanged;

    // Allow exactly one initial fetch on first load, even with empty params.
    if (!hasFetchedOnce.current && !filterChanged) {
      hasFetchedOnce.current = true;
    } else if (!filterChanged) {
      return;
    }

    const filteredBlogs = allBlogs.current.filter((blog) => {
      const matchesSearch =
        props.searchText === "" ||
        blog.title.toLowerCase().includes(props.searchText.toLowerCase());
      const matchesTags =
        props.selectedTags.length === 0 ||
        (props.useAndLogic
          ? props.selectedTags.every((tag) => blog.tags.includes(tag))
          : props.selectedTags.some((tag) => blog.tags.includes(tag)));
      return matchesSearch && matchesTags;
    });

    const totalCount = filteredBlogs.length;
    const nextMaxPage =
      totalCount <= 0 ? 1 : Math.ceil(totalCount / BLOG_PER_REQUEST);
    setMaxPage(nextMaxPage);

    const normalizedPage = Math.min(props.page, nextMaxPage);
    const offset = BLOG_PER_REQUEST * (normalizedPage - 1);
    const paginatedBlogs = filteredBlogs.slice(
      offset,
      offset + BLOG_PER_REQUEST,
    );

    hasFetchedOnce.current = true;
    if (normalizedPage !== page) {
      setPage(normalizedPage);
      setPageQueryParam(normalizedPage);
    }

    setBlogs(paginatedBlogs);

    prevPage.current = normalizedPage;
    if (searchTextChanged) prevSearchText.current = props.searchText ?? "";
    if (selectedTagsChanged)
      prevSelectedTags.current = props.selectedTags ?? [];
    if (useAndLogicChanged)
      prevUseAndLogic.current = props.useAndLogic ?? false;
  }

  return (
    <div className="w-full min-w-[300px] max-w-[1440px] flex flex-col items-center mt-8">
      <TagFilter
        tags={tags}
        page={page}
        setPage={setPage}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        searchText={searchText}
        setSearchText={setSearchText}
        useAndLogic={useAndLogic}
        setUseAndLogic={setUseAndLogic}
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
      <div className="mt-8 mb-2 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: maxPage }, (_, index) => index + 1).map(
          (pageNo) => (
            <Button
              key={pageNo}
              type="button"
              variant={pageNo === page ? "default" : "outline"}
              onClick={() => {
                if (pageNo === page) return;
                setPage(pageNo);
                setPageQueryParam(pageNo);
                fetchBlogs({
                  page: pageNo,
                  searchText,
                  selectedTags,
                  useAndLogic,
                });
              }}
            >
              {pageNo}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
