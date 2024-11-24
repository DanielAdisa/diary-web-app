'use client';

import ReactQuill, { Quill } from 'react-quill';
import { forwardRef } from 'react';

type CustomReactQuillProps = React.ComponentProps<typeof ReactQuill>;

// ForwardRef to pass the ref correctly to ReactQuill
const CustomReactQuill = forwardRef<ReactQuill, CustomReactQuillProps>((props, ref) => {
  return <ReactQuill {...props} ref={ref} />;
});

CustomReactQuill.displayName = 'CustomReactQuill'; // For debugging with forwardRef

export default CustomReactQuill;
