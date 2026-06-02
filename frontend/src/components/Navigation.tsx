import type { SuluNavItem } from "@/lib/sulu";

interface Props {
  items: SuluNavItem[];
}

export default function Navigation({ items }: Props) {
  if (!items.length) return null;

  return (
    <nav style={{ display: "flex", gap: "1.5rem" }}>
      {items.map((item) => (
        <a key={item.id} href={item.url}>
          {item.title}
        </a>
      ))}
    </nav>
  );
}
