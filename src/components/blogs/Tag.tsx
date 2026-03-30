import { Button } from "../ui/button";

export type TagProps = {
  name: string;
  category: string;
  subcategory?: string;
  themeLock?: boolean;
};

export function Tag({ name, category, subcategory, themeLock }: TagProps) {
  return (
    <a
      href={
        subcategory
          ? `/blogs?category=${category}&subcategory=${subcategory}`
          : `/blogs?category=${category}`
      }
      rel="noopener noreferrer nofollow"
    >
      <Button
        size="default"
        variant={themeLock ? "tag" : "default"}
        className="h-auto text-sm sm:text-xs rounded-2xl select-none"
      >
        {name}
      </Button>
    </a>
  );
}
