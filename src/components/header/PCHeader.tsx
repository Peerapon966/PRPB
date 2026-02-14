"use client";

import { ThemeToggleBtn } from "@/components/ui/themeToggleBtn";
import { redirectHandler } from "@/lib/redirectHandler";

export function PCHeader() {
  const menus = [
    { menu: "Home", link: "/" },
    { menu: "Blogs", link: "/blogs" },
    { menu: "About", link: "/about" },
  ];

  return (
    <div className="absolute h-full w-full">
      <div className="sticky z-full top-0 px-48 h-[3.3rem] backdrop-filter backdrop-blur-[20px] border-b">
        <div className="flex mx-auto my-1/2 h-full items-center justify-between max-w-[1600px]">
          <a
            href="/"
            rel="noopener noreferrer nofollow"
            className="flex items-center justify-center h-full shrink-0 font-semibold select-none"
          >
            PRPB
          </a>
          <div className="flex h-full">
            {menus.map(({ menu, link }) => (
              <a
                key={menu}
                href={link}
                onClick={redirectHandler}
                className="text-md bg-transparent h-full px-8 flex items-center justify-center hover:bg-secondary transition-all duration-500 ease-menu select-none"
              >
                {menu}
              </a>
            ))}
          </div>
          <div className="shrink-0">
            <ThemeToggleBtn size="sm" />
          </div>
        </div>

        {/* <div className=""></div> */}
        {/* <Input type="search" /> */}
      </div>
    </div>
  );
}
