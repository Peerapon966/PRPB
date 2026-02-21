import { useRef, type JSX } from "react";

type Headings = {
  depth: number;
  slug: string;
  text: string;
}[];

export function TOC({ headings }: { headings: Headings }) {
  const overlay = useRef<HTMLDivElement | null>(null);
  const navBar = useRef<HTMLDivElement | null>(null);
  const navBtn = useRef<HTMLDivElement | null>(null);
  const floorDepth = headings[0].depth;

  // 500 ms timeout is a temporary fix to deal with iOS26 liquid glass Safari bottom address bar bg-color paint delay when opening the TOC
  // TODO: properly fix this later when have time
  const onClickHandler = () => {
    overlay.current?.classList.toggle("active");
    navBtn.current?.firstElementChild?.classList.toggle("rotate-180");
    setTimeout(() => {
      overlay.current?.classList.toggle("!z-10");
    }, 500);

    if (overlay.current?.classList.contains("active")) {
      setTimeout(() => {
        navBar.current?.classList.remove("invisible");
      }, 500);
      document.body.classList.add("lock");
    } else {
      document.body.classList.remove("lock");
      navBar.current?.classList.add("invisible");
    }
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
    <>
      <div
        ref={overlay}
        onClick={onClickHandler}
        className="menu-overlay bg-overlay/90 xl:hidden"
      ></div>
      <nav className="fixed max-w-[300px] right-0 bottom-0 flex flex-row-reverse items-center text-sm z-20">
        <div
          ref={navBtn}
          onClick={onClickHandler}
          className="w-7 py-4 rounded-l-xl hover:cursor-pointer select-none border-y border-l border-r border-r-background bg-background relative left-[2px] xs:block xl:hidden z-[1020]"
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
          className="relative break-word overflow-y-scroll h-dvh pt-4 lg:pt-[3.3rem] translate-x-7 bg-background flex flex-col items-center invisible xl:visible border-l scrollbar-hide z-[1010]"
        >
          <div className="py-6 text-lg font-semibold">Table of content</div>
          <div className="pr-8 ml-2 h-[75vh] lg:h-[80vh] overflow-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {generateTOC(
              headings.map((heading) => {
                if (heading.depth < floorDepth)
                  return { ...heading, depth: floorDepth };
                return heading;
              }),
              floorDepth,
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
