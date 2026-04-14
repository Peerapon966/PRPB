"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { type FetchBlogsProps } from "@/components/blogs/BlogList";
import { cn } from "@/lib/utils";

type TagOption = {
  value: string;
  label: string;
};

type FetchTagResponseItem = {
  id: number;
  name: string;
};

type TagFilterProps = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  useAndLogic: boolean;
  setUseAndLogic: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBlogs: (props: FetchBlogsProps) => void;
};

const FormSchema = z.object({
  page: z.number(),
  selectedTags: z.array(z.string()),
  searchText: z.string(),
  useAndLogic: z.boolean(),
});

export function TagFilter({
  page,
  setPage,
  selectedTags,
  setSelectedTags,
  searchText,
  setSearchText,
  useAndLogic,
  setUseAndLogic,
  fetchBlogs,
}: TagFilterProps) {
  const [allTagOptions, setAllTagOptions] = useState<TagOption[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [debouncedTagSearch, setDebouncedTagSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      page: 1,
      selectedTags: [],
      searchText: "",
      useAndLogic: false,
    },
  });

  const filteredOptions = useMemo(() => {
    const keyword = debouncedTagSearch.trim().toLowerCase();
    if (!keyword) return allTagOptions;

    return allTagOptions.filter((option) => {
      return option.label.toLowerCase().includes(keyword);
    });
  }, [allTagOptions, debouncedTagSearch]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    fetchBlogs({
      page: data.page,
      selectedTags: data.selectedTags,
      searchText: data.searchText,
      useAndLogic: data.useAndLogic,
    });
  }

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch(
        `${import.meta.env.PUBLIC_API_ENDPOINT}/tags?select=id,name`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const fetchedTags = (await response.json()) as FetchTagResponseItem[];
      const mappedTags = fetchedTags.map((tag) => ({
        value: tag.name,
        label: tag.name,
      }));
      setAllTagOptions(mappedTags);
    }
    fetchTags();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedTagSearch(tagSearch);
    }, 300);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [tagSearch]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const queryPage = Number(urlSearchParams.get("page") ?? "1");
    const pageFromQuery = Number.isFinite(queryPage) && queryPage > 0
      ? queryPage
      : 1;
    const querySearchText = urlSearchParams.get("search") ?? "";
    const selectedTagValues = urlSearchParams.getAll("tag");
    const validSelectedTagValues = selectedTagValues.filter((value) =>
      allTagOptions.some((option) => option.value === value),
    );

    form.setValue("page", pageFromQuery);
    form.setValue("searchText", querySearchText);
    form.setValue("selectedTags", validSelectedTagValues);
    form.setValue("useAndLogic", useAndLogic);
    setPage(pageFromQuery);
    setSearchText(querySearchText);
    setSelectedTags(validSelectedTagValues);
    form.handleSubmit(onSubmit)();
  }, [allTagOptions]);

  useEffect(() => {
    form.setValue("page", page);
    form.setValue("selectedTags", selectedTags);
    form.setValue("searchText", searchText);
    form.setValue("useAndLogic", useAndLogic);
  }, [form, page, searchText, selectedTags, useAndLogic]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-7xl px-4 select-none [&_*]:transition-none"
      >
        <div className="w-full bg-transparent p-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto] items-start">
            <FormField
              control={form.control}
              name="selectedTags"
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <div ref={dropdownRef}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      onClick={() => setIsDropdownOpen((open) => !open)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setIsDropdownOpen((open) => !open);
                        }
                      }}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                    >
                      {field.value.length > 0 ? (
                        <div className="flex flex-1 flex-wrap items-center gap-1 py-0.5 pr-2">
                          {field.value.map((selectedValue) => {
                            const option = allTagOptions.find(
                              (item) => item.value === selectedValue,
                            );
                            return (
                              <span
                                key={selectedValue}
                                className="inline-flex items-center rounded-md bg-tag px-2 py-1 text-xs leading-none text-tag-foreground"
                              >
                                {option?.label ?? selectedValue}
                                <button
                                  type="button"
                                  className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-sm text-sm leading-none text-tag-foreground/90 hover:bg-tag-foreground/15 hover:text-tag-foreground"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const nextSelected = field.value.filter(
                                      (value) => value !== selectedValue,
                                    );
                                    field.onChange(nextSelected);
                                    setSelectedTags(nextSelected);
                                  }}
                                  aria-label={`Remove ${option?.label ?? selectedValue}`}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="flex min-h-5 items-center text-muted-foreground">
                          Select tags
                        </span>
                      )}
                      <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                        ▼
                      </span>
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute left-0 top-11 z-20 w-full rounded-md border bg-background p-2 shadow-md">
                        <Input
                          value={tagSearch}
                          onChange={(event) => setTagSearch(event.target.value)}
                          placeholder="Search tags..."
                          className="mb-2"
                        />
                        <div className="scrollbar-hide max-h-56 space-y-1 overflow-y-auto pr-1">
                          {filteredOptions.length === 0 && (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No tags found
                            </div>
                          )}
                          {filteredOptions.map((option) => {
                            const checked = field.value.includes(option.value);
                            return (
                              <label
                                key={option.value}
                                className={cn(
                                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent",
                                  checked && "bg-accent/80",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const nextSelected = checked
                                      ? field.value.filter(
                                          (value) => value !== option.value,
                                        )
                                      : [...field.value, option.value];
                                    field.onChange(nextSelected);
                                    setSelectedTags(nextSelected);
                                  }}
                                  className="h-4 w-4 shrink-0"
                                />
                                <span className="truncate">{option.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="searchText"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Search blogs..."
                        className="h-11 pr-9"
                        value={field.value}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          setSearchText(event.target.value);
                        }}
                      />
                      {field.value.trim() !== "" && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          onClick={() => {
                            field.onChange("");
                            setSearchText("");
                          }}
                          aria-label="Clear text search"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full flex-row justify-end gap-2 lg:w-auto">
              <Button type="submit" className="h-11 flex-1 lg:flex-none">
                Apply
              </Button>
              <Button
                type="reset"
                variant="outline"
                className="h-11 flex-1 lg:flex-none"
                onClick={() => {
                  form.reset({
                    selectedTags: [],
                    searchText: "",
                    useAndLogic: false,
                  });
                  setSelectedTags([]);
                  setSearchText("");
                  setUseAndLogic(false);
                  setTagSearch("");
                  setIsDropdownOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          <FormField
            control={form.control}
            name="useAndLogic"
            render={({ field }) => (
              <FormItem className="mt-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => {
                      field.onChange(event.target.checked);
                      setUseAndLogic(event.target.checked);
                    }}
                    className="h-4 w-4"
                  />
                  Match all selected tags (AND)
                </label>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
