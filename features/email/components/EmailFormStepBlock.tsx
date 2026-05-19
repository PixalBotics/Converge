"use client";

import type { ReactNode } from "react";
import {
  EmailFormStep,
  EmailFormStepBody,
  EmailFormStepDescription,
  EmailFormStepHeader,
  EmailFormStepNumber,
  EmailFormStepTitle,
} from "../styles/email-configuration.styled";

export function EmailFormStepBlock({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <EmailFormStep>
      <EmailFormStepHeader>
        <EmailFormStepNumber aria-hidden>{step}</EmailFormStepNumber>
        <div>
          <EmailFormStepTitle variant="mediumLarge" component="h3">
            {title}
          </EmailFormStepTitle>
          {description ? (
            <EmailFormStepDescription variant="small">{description}</EmailFormStepDescription>
          ) : null}
        </div>
      </EmailFormStepHeader>
      <EmailFormStepBody>{children}</EmailFormStepBody>
    </EmailFormStep>
  );
}
