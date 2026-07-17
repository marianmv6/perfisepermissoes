import React from 'react';
import { RequiredFieldMarker } from './RequiredFieldMarker';

interface FormFieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormFieldLabel: React.FC<FormFieldLabelProps> = ({ htmlFor, children, required = false }) => (
  <label htmlFor={htmlFor} className="form-field__label">
    <span className="form-field__label-text">{children}</span>
    {required ? <RequiredFieldMarker /> : null}
  </label>
);
