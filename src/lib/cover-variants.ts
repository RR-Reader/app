// lib/cover-variants.ts
import { cva, type VariantProps } from "class-variance-authority";

export const coverVariants = cva(
  "aspect-[3/4] object-cover transition-all duration-200",
  {
    variants: {
      style: {
        rounded: "rounded-lg",
        square: "rounded-none",
        border: "rounded-lg border-2",
        shadow: "rounded-lg shadow-lg hover:shadow-xl",
      },
      type: {
        image: "",
        viewMore:
          "bg-card hover:text-primary hover:bg-card/40 flex items-center justify-center border-dashed",
      },
    },
    compoundVariants: [
      {
        style: "border",
        type: "image",
        class: "border-border",
      },
      {
        style: "border",
        type: "viewMore",
        class: "border-border",
      },
    ],
    defaultVariants: {
      style: "rounded",
      type: "image",
    },
  },
);

export const viewMoreVariants = cva(
  "bg-card hover:text-primary hover:bg-card/40 flex aspect-[3/4] items-center justify-center border border-dashed object-cover transition-all",
  {
    variants: {
      style: {
        rounded: "rounded-lg",
        square: "rounded-none",
        border: "rounded-lg border-2 border-dashed border",
        shadow: "rounded-lg shadow-lg hover:shadow-xl",
      },
    },
    defaultVariants: {
      style: "rounded",
    },
  },
);

export type CoverVariants = VariantProps<typeof coverVariants>;
export type ViewMoreVariants = VariantProps<typeof viewMoreVariants>;
