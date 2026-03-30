interface LinkProps {
  url: string;
  size?: number;
}

export function Link({ url, size }: LinkProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <div className="w-full h-28 border border-border rounded-lg flex">
        <div className="basis-1/5 flex justify-center items-center">
          <img
            src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=${size ?? 180}`}
            width="50%"
          />
        </div>
        <div className="bg-red-600 basis-4/5"></div>
      </div>
    </a>
  );
}
