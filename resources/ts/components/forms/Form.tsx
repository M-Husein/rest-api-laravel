import { forwardRef } from 'react';
// import cx from 'classnames';

export const Form = forwardRef(
  (
    {
      fieldsetClass,
      disabled,
      children,
      ...etc
    }: any,
    ref
  ) => {
    return (
      <form
        {...etc}
        ref={ref}
      >
        <fieldset
          className={fieldsetClass}
          disabled={disabled}
        >
          {children}
        </fieldset>
      </form>
    );
  }
);
