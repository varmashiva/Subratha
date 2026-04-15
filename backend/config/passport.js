import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5001/api/auth/google/callback', 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const picture = photos[0].value;

        let user = await User.findOne({ 
          $or: [
            { googleId: id },
            { email: email }
          ]
        });

        const adminEmails = [
          'gj123.gani@gmail.com',
          'hello@subratha.com',
          'shivavarma336@gmail.com'
        ];
        
        const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

        if (user) {
          user.googleId = id;
          user.picture = picture;
          user.role = role;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          googleId: id,
          name: displayName,
          email: email,
          picture: picture,
          role: role
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
