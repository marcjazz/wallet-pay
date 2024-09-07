import React from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';

export default function Login() {
  const validationSchema = Yup.object({
    email: Yup.string().email('False email address').required('Required'),
    password: Yup.string().required('Required').min(3),
    //   .min(3, 'Must be at least 3 characters'),
  });

  const initialValues = {
    email: '',
    password: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <Box component="form">
      {/* <FormControl defaultValue="" required>
        <FormLabel>Name</FormLabel>
        <TextField
          {...formik.getFieldProps('email')}
          name="email"
          // label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          // helperText={formik.touched.email && formik.errors.email}
        />
      </FormControl> */}

      {/* <TextField
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      /> */}
      <TextField
        name="password"
        label="Password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
    </Box>
  );
}
