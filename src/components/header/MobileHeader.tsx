"use client";

import "@/styles/mobileHeader.css";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggleBtn } from "@/components/ui/themeToggleBtn";
import { useEffect, useRef } from "react";

export function MobileHeader() {
  const menus = [
    { menu: "Home", link: "/" },
    { menu: "Blogs", link: "/blogs" },
    { menu: "About", link: "/about" },
  ];
  const menuOverlay = useRef<HTMLDivElement | null>(null);
  const menuContainer = useRef<HTMLDivElement | null>(null);
  const themeToggleBtn = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMenuClick = (e: MouseEvent) => {
      if (!menuContainer.current?.classList.contains("active")) {
        e.preventDefault();
        menuContainer.current?.classList.add("active");
        menuContainer.current?.firstElementChild?.classList.add("hidden");
        themeToggleBtn.current?.classList.add("active");
        menuOverlay.current?.classList.add("active");
        disableScroll();
      }
    };

    const handleOverlayClick = () => {
      if (menuContainer.current?.classList.contains("active")) {
        menuContainer.current.classList.remove("active");
        menuContainer.current?.firstElementChild?.classList.remove("hidden");
        themeToggleBtn.current?.classList.remove("active");
        menuOverlay.current?.classList.remove("active");
        enableScroll();
      }
    };

    menuContainer.current?.addEventListener("click", handleMenuClick, {
      capture: true,
    });
    menuOverlay.current?.addEventListener("click", handleOverlayClick);

    return () => {
      menuContainer.current?.removeEventListener("click", handleMenuClick, {
        capture: true,
      });
      menuOverlay.current?.removeEventListener("click", handleOverlayClick);
      enableScroll();
    };
  }, []);

  function disableScroll() {
    document.body.classList.add("lock");
  }

  function enableScroll() {
    document.body.classList.remove("lock");
  }

  return (
    <div className="h-full w-full">
      <div ref={menuOverlay} className="menu-overlay bg-overlay/90"></div>
      <div className="menu-group">
        <div
          ref={themeToggleBtn}
          className="min-w-[48px] theme-toggle-btn-wrapper"
        >
          <ThemeToggleBtn />
        </div>
        <div
          ref={menuContainer}
          className="menu-container circle backdrop-filter backdrop-blur-[6px] min-w-[48px] relative"
        >
          <div className="absolute w-full h-full opacity-0 z-full"></div>
          {menus.map(({ menu, link }) => (
            <a
              key={menu}
              className={cn([
                buttonVariants({
                  variant: "secondary",
                }),
                "menu-item",
              ])}
              href={link}
            >
              {menu}
            </a>
          ))}
          <Button variant={"secondary"} className="menu-item about-me">
            <div className="flex items-center">
              <a
                href="/"
                className="prpb-icon font-semibold text-md"
                rel="noopener noreferrer nofollow"
              >
                PRPB
              </a>
            </div>
            <div className="flex items-center">
              <a
                href="https://github.com/Peerapon-Org/PRPB"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="mr-[.8rem] github-icon"
              >
                <svg
                  className="!w-full !h-full"
                  viewBox="0 0 48 48"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="48"
                    height="48"
                    fill="currentColor"
                    fillOpacity="0.01"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M19.183 45.4715C18.9896 45.2218 18.9896 42.9972 19.183 38.798C17.1112 38.8695 15.8022 38.7257 15.256 38.3666C14.4368 37.8279 13.6166 36.1666 12.8889 34.9958C12.1612 33.825 10.546 33.6399 9.8938 33.3782C9.24158 33.1164 9.07785 32.0495 11.691 32.8564C14.3042 33.6633 14.4316 35.8606 15.256 36.3744C16.0804 36.8882 18.0512 36.6634 18.9446 36.2518C19.8379 35.8402 19.7722 34.3077 19.9315 33.7006C20.1329 33.1339 19.423 33.0082 19.4074 33.0036C18.5353 33.0036 13.9537 32.0072 12.6952 27.5705C11.4368 23.1339 13.0579 20.234 13.9227 18.9874C14.4992 18.1563 14.4482 16.3851 13.7697 13.6736C16.2333 13.3588 18.1344 14.1342 19.4732 16C19.4745 16.0107 21.2283 14.9571 24 14.9571C26.7718 14.9571 27.7551 15.8153 28.514 16C29.2728 16.1847 29.8798 12.734 34.5666 13.6736C33.5881 15.5968 32.7686 18 33.3941 18.9874C34.0195 19.9748 36.4742 23.1146 34.9664 27.5705C33.9611 30.5412 31.9851 32.3522 29.0382 33.0036C28.7002 33.1114 28.5313 33.2854 28.5313 33.5254C28.5313 33.8855 28.9881 33.9248 29.6463 35.6116C30.085 36.7361 30.1167 39.9479 29.7413 45.2469C28.7904 45.489 28.0506 45.6515 27.5219 45.7346C26.5845 45.8819 25.5667 45.9645 24.5666 45.9964C23.5666 46.0283 23.2193 46.0247 21.8368 45.896C20.9151 45.8102 20.0305 45.6687 19.183 45.4715Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/peerapon-b-197172345"
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="linkedin-icon"
              >
                <svg
                  className="!w-full !h-full"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z"></path>
                </svg>
              </a>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
