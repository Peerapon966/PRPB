import { Button } from "@/components/ui/button";

export type TagProps = {
  value: string;
  themeLock?: boolean;
};

export function Tag({ value, themeLock }: TagProps) {
  return (
    <a
      href={`/blogs?tag=${value}`}
      rel="noopener noreferrer nofollow"
      aria-label={`Open list of blogs with tag = ${value} in a new tab`}
    >
      <Button
        size="default"
        variant={themeLock ? "tag" : "default"}
        className="h-auto text-sm sm:text-xs rounded-2xl select-none"
      >
        {value}
      </Button>
    </a>
  );
}
