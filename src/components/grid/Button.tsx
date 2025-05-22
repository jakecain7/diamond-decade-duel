
import React from "react";
import { Button as BaseButton, ButtonProps } from "@/components/ui/button";

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const Button = ({ children, className, ...props }: CustomButtonProps) => {
  return (
    <BaseButton 
      className={`${className}`}
      {...props}
    >
      {children}
    </BaseButton>
  );
};

export default Button;
