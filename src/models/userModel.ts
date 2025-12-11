import { Document, InferSchemaType, model, Schema } from 'mongoose';
import validator from 'validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  GUIDE = 'guide',
  LEAD_GUIDE = 'lead_guide',
}

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  active: {
    type: Boolean,
    default: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (val: string) {
        // The "this" keyword points to the current doc on NEW document creation.
        // This only works on CREATE and SAVE!
        return val === this.password;
      },
      message: "Passwords don't match!",
    },
  },
});

export type UserData = InferSchemaType<typeof userSchema>;
export interface IUser extends Document, UserData {}

const User = model<IUser>('User', userSchema);

export default User;
