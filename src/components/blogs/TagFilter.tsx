"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FetchBlogsProps } from "./BlogList";

type Tags = {
  categories: string[];
  subcategories: Record<string, string[]>;
};

type TagFilterProps = {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  setSubcategory: React.Dispatch<React.SetStateAction<string>>;
  fetchBlogs: (props: FetchBlogsProps) => void;
};

const FormSchema = z.object({
  category: z.string(),
  subcategory: z.string(),
});

export function TagFilter({
  category,
  setCategory,
  setSubcategory,
  fetchBlogs,
}: TagFilterProps) {
  const [tags, setTags] = useState<Tags>();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      category: "",
      subcategory: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    fetchBlogs({
      category: data.category,
      subcategory: data.subcategory,
    });
  }

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch(`${import.meta.env.SITE_URL}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { categories, subcategories } = (await response.json()) as Tags;
      setTags({ categories, subcategories });
    }
    fetchTags();
  }, []);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const category = urlSearchParams.get("category") ?? "";
    const subcategory = urlSearchParams.get("subcategory") ?? "";
    const isValidCategory = ((category: string): category is string => {
      return tags?.categories.includes(category) || category === ""
        ? true
        : false;
    })(category);
    const isValidSubcategory = ((
      subcategory: string,
    ): subcategory is string => {
      return (tags?.subcategories[category] ?? []).includes(subcategory) ||
        (category && !subcategory)
        ? true
        : false;
    })(subcategory);

    if (isValidCategory) {
      form.setValue("category", category);
      setCategory(category);
    }
    if (isValidSubcategory) {
      setSubcategory(subcategory);
      form.setValue("subcategory", subcategory);
      // set subcategory field value 2nd time
      setTimeout(() => form.setValue("subcategory", subcategory), 100);
    }

    // Do not fetch the blogs if the category is invalid
    // Ignore subcategory if the subcategory is invalid
    if (isValidCategory) form.handleSubmit(onSubmit)();
  }, [tags]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col sm:flex-row justify-center items-center select-none"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="w-5/6 mb-4 sm:w-1/3 sm:mb-0 sm:mr-4">
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setCategory(value);
                  form.resetField("subcategory");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tags?.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subcategory"
          render={({ field }) => (
            <FormItem className="w-5/6 mb-6 sm:w-1/3 sm:mb-0 sm:mr-4 select-none">
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={category === ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {category !== "" &&
                    tags?.subcategories[category].map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="justify-self-start select-none">
          <Button type="submit" className="mr-12 sm:mr-4">
            Apply
          </Button>
          <Button
            type="reset"
            onClick={() => {
              form.reset();
              setCategory("");
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  );
}
