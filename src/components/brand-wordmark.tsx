import type { HTMLAttributes } from "react";
import { BRAND } from "@/config/brand";

type BrandWordmarkProps = HTMLAttributes<HTMLSpanElement> & {
  accentClassName?: string;
  withPeriod?: boolean;
};

export function BrandWordmark({
  accentClassName = "text-primary",
  withPeriod = true,
  ...props
}: BrandWordmarkProps) {
  const [first, ...rest] = BRAND.name.split(" ");

  return (
    <span {...props}>
      {first}
      <span className={accentClassName}>
        {` ${rest.join(" ")}`}
        {withPeriod ? "." : ""}
      </span>
    </span>
  );
}
