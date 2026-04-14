import { Tag } from "@/components/blogs/Tag";
import { type BlogItemProps } from "@/components/blogs/BlogList";

export function BlogItem({
  title,
  description,
  slug,
  publishDate,
  tags,
}: BlogItemProps) {
  return (
    <div className="relative">
      <div className="flex absolute top-0 left-2 mt-1">
        {tags.map((tag) => (
          <div key={slug + tag} className="ml-1 mr-1">
            <Tag value={tag} themeLock />
          </div>
        ))}
      </div>
      <a href={`/blog/${slug}`} aria-label={`Open blog ${title}`}>
        <div>
          <div>
            <img
              src={`${import.meta.env.PUBLIC_SITE_URL + import.meta.env.PUBLIC_IMAGE_ASSET_PREFIX}/${slug}/thumbnail.png`}
              alt={title + " thumbnail"}
              className="rounded-tl-3xl select-none"
              draggable="false"
              loading="eager"
              fetchPriority="high"
              height={320}
              width={640}
            />
          </div>
          <div className="px-2 py-2">
            <div className="text-md leading-snug mb-2">{title}</div>
            <div className="text-xs leading-tight mb-2 font-light">
              {description}
            </div>
            <div className="text-xs font-light">{publishDate}</div>
          </div>
        </div>
      </a>
    </div>
  );
}
