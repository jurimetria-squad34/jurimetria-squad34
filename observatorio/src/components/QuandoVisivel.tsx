import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  alturaMinima: number;
}

export default function QuandoVisivel({ children, alturaMinima }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: visivel ? undefined : alturaMinima }}>
      {visivel ? children : null}
    </div>
  );
}