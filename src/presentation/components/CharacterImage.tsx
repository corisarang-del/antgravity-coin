import Image from "next/image";

interface CharacterImageProps {
  alt: string;
  src: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function CharacterImage({
  alt,
  src,
  className,
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
}: CharacterImageProps) {
  return (
    <Image
      alt={alt}
      className={className}
      height={768}
      priority={priority}
      sizes={sizes}
      src={src}
      width={1024}
    />
  );
}
