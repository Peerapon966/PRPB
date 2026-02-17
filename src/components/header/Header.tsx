import { MobileHeader } from "@/components/header/MobileHeader";
import { PCHeader } from "@/components/header/PCHeader";
import { useEffect, useState, type JSX } from "react";

export function Header() {
  const breakpoint = 1024; // tailwind 'lg' resolution
  const [header, setHeader] = useState<JSX.Element | null>(null);

  useEffect(() => {
    setHeader(window.innerWidth < breakpoint ? <MobileHeader /> : <PCHeader />);
    const query = matchMedia(`(min-width: ${breakpoint}px)`);
    query.addEventListener("change", (e) => {
      setHeader(e.matches ? <PCHeader /> : <MobileHeader />);
    });
  }, []);

  return header;
}
