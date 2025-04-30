import mongoose from 'mongoose';
import { Password } from '../services/password';
// properties needed for createing user
interface UserAttrs {
  email: string;
  password: string;
}
//properties a user documents have
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}
//properties a user model have
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password') as string);
    this.set('password', hashed);
  }
  done();
});
userSchema.statics.build = async (attrs: UserAttrs) => {
  return await User.create(attrs);
};
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
