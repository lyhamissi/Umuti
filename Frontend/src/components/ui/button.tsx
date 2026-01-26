import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 hover:border-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/25 dark:shadow-primary/10 dark:hover:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-destructive/90 hover:border-destructive/90 shadow-md hover:shadow-destructive/25",
        outline:
          "border-2 border-primary/60 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:border-primary/50 dark:hover:border-primary dark:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/80 hover:border-primary/30 dark:border-secondary dark:hover:border-primary/40",
        ghost:
          "hover:bg-accent/80 hover:text-accent-foreground border-2 border-transparent hover:border-primary/20 dark:hover:border-primary/30",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "gradient-primary text-primary-foreground border-2 border-primary/80 shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] dark:border-primary/60 dark:hover:shadow-primary/20",
        glass:
          "bg-card/80 backdrop-blur-sm border-2 border-border text-foreground hover:bg-card hover:border-primary/40 shadow-md dark:border-border dark:hover:border-primary/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
