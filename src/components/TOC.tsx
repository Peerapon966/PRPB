import { useRef, type JSX } from "react";

type Headings = {
  depth: number;
  slug: string;
  text: string;
}[];

export function TOC({ headings }: { headings: Headings }) {
  const navBar = useRef<HTMLDivElement | null>(null);
  const navBtn = useRef<HTMLDivElement | null>(null);
  const floorDepth = headings[0].depth;
  const onClickHandler = () => {
    navBar.current?.classList.toggle("!w-0");
    navBtn.current?.classList.toggle("!hidden");
    navBtn.current?.firstElementChild?.classList.toggle("rotate-180");
  };
  const generateTOC = (
    headings: Headings,
    currentDepth: number,
  ): JSX.Element => {
    let exhausted = false;
    return (
      <>
        <ul
          className={`list-none ${currentDepth <= 2 ? "-translate-x-4" : ""}`}
        >
          {headings.map(({ depth, slug, text }, idx) => {
            if (exhausted) return;
            if (depth < currentDepth) {
              exhausted = true;
              return;
            }
            if (depth === currentDepth)
              return (
                <li key={slug + "list"} className="py-1">
                  <a
                    key={slug + "anchor"}
                    href={"#" + slug}
                    className="text-wrap block bg-background hover:bg-muted px-2 py-1"
                    onClick={onClickHandler}
                  >
                    {text}
                  </a>
                  {headings[idx + 1]?.depth > currentDepth &&
                    generateTOC(
                      headings.slice(idx + 1),
                      headings[idx + 1].depth,
                    )}
                </li>
              );
          })}
        </ul>
      </>
    );
  };

  return (
    <nav className="h-full flex items-center text-sm">
      <div
        ref={navBtn}
        onClick={onClickHandler}
        className="w-7 py-4 rounded-l-xl hover:cursor-pointer select-none border-y border-l border-r border-r-background bg-background relative left-[2px] xs:block 2xl:hidden"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div
        ref={navBar}
        className="relative overflow-y-scroll h-full pt-[3.3rem] bg-background flex flex-col items-center !w-0 w-full xs:w-[340px] 2xl:!w-[340px] border-l scrollbar-hide"
      >
        <div className="py-6 text-lg font-semibold">Table of content</div>
        <div className="pr-8 py-6">
          {generateTOC(
            headings.map((heading) => {
              if (heading.depth < floorDepth)
                return { ...heading, depth: floorDepth };
              return heading;
            }),
            floorDepth,
          )}
        </div>
        <div
          onClick={onClickHandler}
          className="2xl:hidden absolute w-7 right-0 top-1/2 -translate-y-1/2 py-4 hover:cursor-pointer select-none border-y border-l border-r border-r-background rounded-l-xl bg-background"
        >
          <svg
            className="w-full h-full rotate-180"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </nav>
  );
}
