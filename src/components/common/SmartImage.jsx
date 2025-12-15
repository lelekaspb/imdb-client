import { resolveImage } from "../../constants/images";

export default function SmartImage({
  src,
  tmdbPath,
  type = "title",
  name = "",
  size = "card",
  tmdbSize,
  onClick,
  style,
  className,
  alt,
  ...rest
}) {
  return (
    <img
      src={resolveImage({ src, tmdbPath, type, name, size, tmdbSize })}
      alt={alt || name}
      onClick={onClick}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = resolveImage({ type, name, size });
      }}
      style={style}
      className={className}
      {...rest}
    />
  );
}
