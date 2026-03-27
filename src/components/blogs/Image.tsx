interface ImageProps {
  slug: string;
  filename: string;
  altText?: string;
}

export function Image({ slug, filename, altText }: ImageProps) {
  const imageSrc: string = `${import.meta.env.PUBLIC_SITE_URL + import.meta.env.IMAGE_ASSET_PREFIX}/${slug}/${filename}`;
  return (
    <a
      className="!opacity-100"
      href={imageSrc}
      target="_blank"
      rel="noopener noreferrer"
    >
      <p>
        <img src={imageSrc} alt={altText ?? ""} draggable="false" />
      </p>
    </a>
  );
}
