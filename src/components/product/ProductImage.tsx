import Image, { type ImageProps } from "next/image";

/** next/image that serves local SVG placeholders as-is (they can't go through the optimiser). */
export function ProductImage(props: ImageProps & { src: string }) {
  return <Image {...props} alt={props.alt} unoptimized={props.src.endsWith(".svg")} />;
}
