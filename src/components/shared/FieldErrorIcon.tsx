import React from 'react';

interface FieldErrorIconProps {
  ariaLabel?: string;
}

export const FieldErrorIcon: React.FC<FieldErrorIconProps> = ({
  ariaLabel = 'Campo obrigatório não preenchido',
}) => (
  <span
    className="field-error-icon"
    role="img"
    aria-label={ariaLabel}
    title="Preencha corretamente este campo"
  >
    <span className="field-error-icon__mark">!</span>
  </span>
);
