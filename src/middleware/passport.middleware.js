import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import User from '../models/user.model';

dotenv.config();

module.exports = async function(passport) {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET_KEY,
      },
      (jwt_payload, done) => {
        User.findOne({ _id: jwt_payload.sub }, (error, user) => {
          if (error) {
            return done(error, false);
          }
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      },
    ),
  );
};
