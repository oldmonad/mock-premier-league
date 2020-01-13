import dotenv from 'dotenv';

dotenv.config();

const { ADMIN_PASSWORD, NON_ADMIN_PASSWORD } = process.env;

export const mockUser = {
  name: 'Johnny',
  email: 'johnny@gmail.com',
  password: 'password',
};

export const mockUser2 = {
  name: 'Johnny2',
  email: 'johnny2@gmail.com',
  password: 'password',
};

export const signUpMock = {
  name: 'Johnny Signup',
  email: 'johnnysignup@gmail.com',
  password: 'password',
};

export const loginMock = {
  email: 'johnnysignup@gmail.com',
  password: 'password',
};

export const invalidLoginMock = {
  email: 'johnnyisinvalid@gmail.com',
  password: 'password',
};

export const emptySignupNameField = {
  name: '',
  email: 'johnnysignup@gmail.com',
  password: 'password',
};

export const invalidSignupEmailInput = {
  name: 'johnnyisinvalid@gmail.com',
  email: '',
  password: 'password',
};

export const invalidSignupPasswordInput = {
  name: 'johnnyisinvalid',
  email: 'johnnysignup@gmail.com',
  password: '',
};

export const allSignupFieldsEmpty = {
  name: '',
  email: '',
  password: '',
};

export const invalidLoginEmailInput = {
  email: '',
  password: 'password',
};

export const invalidLoginPasswordInput = {
  email: 'johnnysignup@gmail.com',
  password: '',
};

export const allLoginFieldsEmpty = {
  email: '',
  password: '',
};

export const testAdminUser = {
  name: 'Test admin user',
  email: 'testadmin@admin.com',
  password: 'password',
};

export const secondTestAdminUser = {
  name: 'Test2 admin user',
  email: 'testadmin2@admin.com',
  password: 'password',
};

export const loginTestAdminUser = {
  email: 'testadmin@admin.com',
  password: 'password',
};

export const nonAdminUser = {
  name: 'Test normal user',
  email: 'testnormal@normal.com',
  password: 'password',
};

export const loginNonAdminUser = {
  email: 'testnormal@normal.com',
  password: 'password',
};
