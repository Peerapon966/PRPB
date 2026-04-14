"use client";

import { useState, useRef } from "react";

import { TagFilter } from "@/components/blogs/TagFilter";
import { BlogItem } from "@/components/blogs/BlogItem";
import { Button } from "@/components/ui/button";

const BLOG_PER_REQUEST = Number(
  import.meta.env.PUBLIC_BLOG_ITEMS_PER_PAGE ?? 12,
);

export type BlogItemProps = {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishDate: string;
  tags: string[];
};

export type FetchBlogsProps = {
  page: number;
  searchText: string;
  selectedTags: string[];
  useAndLogic: boolean;
};

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogItemProps[]>([]);
  const [page, setPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [useAndLogic, setUseAndLogic] = useState<boolean>(false);
  const hasFetchedOnce = useRef<boolean>(false);
  const prevPage = useRef<number | null>(null);
  const prevSelectedTags = useRef<string[] | null>(null);
  const prevSearchText = useRef<string | null>(null);
  const prevUseAndLogic = useRef<boolean | null>(null);

  /* eslint-disable react/prop-types */
  function getQueryString(
    props: FetchBlogsProps = {
      page: 1,
      searchText: "",
      selectedTags: [],
      useAndLogic: false,
    },
  ): string {
    const limit = BLOG_PER_REQUEST;
    let queryString = `?select=*,publishDate:publish_date&order=publish_date.desc&limit=${limit}&offset=${limit * (props.page - 1)}`;
    if (props.searchText !== "")
      queryString += `&title=ilike.*${props.searchText}*`;
    if (props.selectedTags.length > 0) {
      props.useAndLogic
        ? (queryString += `&tags=cs.{${props.selectedTags.join(",")}}`) // contains (@>)
        : (queryString += `&tags=ov.{${props.selectedTags.join(",")}}`); // overlap (&&)
    }

    return queryString;
  }

  function getCountQueryString(props: FetchBlogsProps): string {
    let queryString = "?select=slug";
    if (props.searchText !== "") {
      queryString += `&title=ilike.*${props.searchText}*`;
    }
    if (props.selectedTags.length > 0) {
      queryString += props.useAndLogic
        ? `&tags=cs.{${props.selectedTags.join(",")}}`
        : `&tags=ov.{${props.selectedTags.join(",")}}`;
    }
    return queryString;
  }

  async function fetchTotalPages(props: FetchBlogsProps): Promise<number> {
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_ENDPOINT}/blogs_with_tags${getCountQueryString(props)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Range-Unit": "items",
          Range: "0-0",
          Prefer: "count=exact",
        },
      },
    );
    const contentRange = response.headers.get("content-range");
    const totalCount = Number(contentRange?.split("/")?.[1] ?? "0");
    console.group("content-range");
    console.table({ contentRange, totalCount });
    console.groupEnd();
    if (!Number.isFinite(totalCount) || totalCount <= 0) return 1;
    return Math.ceil(totalCount / BLOG_PER_REQUEST);
  }

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

  async function fetchBlogs(
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

    const nextMaxPage = await fetchTotalPages(props);
    setMaxPage(nextMaxPage);

    const normalizedPage = Math.min(props.page, nextMaxPage);
    const queryString = getQueryString({ ...props, page: normalizedPage });
    const response = await fetch(
      `${import.meta.env.PUBLIC_API_ENDPOINT}/blogs_with_tags${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const blogs = (await response.json()) as BlogItemProps[];
    hasFetchedOnce.current = true;
    if (normalizedPage !== page) {
      setPage(normalizedPage);
      setPageQueryParam(normalizedPage);
    }

    filterChanged
      ? setBlogs(blogs)
      : setBlogs((oldBlogs) => [...oldBlogs, ...blogs]);

    if (pageChanged) prevPage.current = normalizedPage;
    if (searchTextChanged) prevSearchText.current = props.searchText ?? "";
    if (selectedTagsChanged)
      prevSelectedTags.current = props.selectedTags ?? [];
    if (useAndLogicChanged)
      prevUseAndLogic.current = props.useAndLogic ?? false;
  }

  return (
    <div className="w-full min-w-[300px] max-w-[1440px] flex flex-col items-center mt-8">
      <TagFilter
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
