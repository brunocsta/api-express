import passport from "passport";
import Strategy from "passport-discord";
import { DiscordUser } from "../mongoose/schemas/discord-user.mjs";

passport.serializeUser((user, done) => {
  console.log(`Inside Serialize User:`);
  console.log(user);
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await DiscordUser.findById(id);
    return findUser ? done(null, findUser) : done(null, null);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy(
    {
      clientID: "1269040535432073308",
      clientSecret: "XKCTAqhZpiSzXTSZYfJANcrMOQLVABg8",
      callbackURL: "http://localhost:3000/api/auth/discord/redirect",
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToke, profile, done) => {
      let findUser;
      try {
        findUser = await DiscordUser.findOne({ discordID: profile.id });
      } catch (error) {
        return done(error, null);
      }

      try {
        if (!findUser) {
          const newUser = new DiscordUser({
            username: profile.username,
            discordID: profile.id,
          });
          const newSavedUser = await newUser.save();
          return done(null, newSavedUser);
        }
        return done(null, findUser);
      } catch (error) {
        console.log(error);
        return done(error, null);
      }
    }
  )
);
