interface LinkProps {
  url: string;
  size?: number;
}

export function Link({ url, size }: LinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open link ${url} in a new tab`}
    >
      <div className="w-full h-28 border border-border rounded-lg flex">
        <div className="basis-1/5 flex justify-center items-center">
          <img
            src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=${size ?? 180}`}
            width="35%"
            alt="favicon"
            draggable="false"
            loading="lazy"
            fetchPriority="low"
          />
        </div>
        <div className="bg-red-600 basis-4/5"></div>
      </div>
    </a>
  );
}
