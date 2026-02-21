import passport from "passport";
import { CustomerMongoRepository } from "../database/repositories/CustomerMongoRepository";
import { Customer } from "../../domain/entities/Customer";
import { Email } from "../../domain/value-objects/ContactTypes";

const customerRepository = new CustomerMongoRepository();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ??
  `${process.env.BACKEND_ORIGIN ?? ""}/api/customer/auth/google/callback`;

const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

passport.use(
  new GoogleStrategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleCallbackUrl,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        let customer = await customerRepository.findByEmail(email);

        if (customer) {
          if (!customer.getGoogleId()) {
            const updatedCustomer = new Customer(
              customer.getId(),
              customer.getName(),
              customer.getEmail(),
              customer.getPassword(),
              customer.getPhone(),
              customer.getAvatarUrl(),
              customer.getDefaultZoneId(),
              customer.isSuspended(),
              customer.getAdditionalInfo(),
              googleId,
              customer.getCreatedAt(),
              new Date(),
              customer.getIsDeleted()
            );

            await customerRepository.update(updatedCustomer);
            customer = updatedCustomer;
          }
        } else {
          const newCustomer = new Customer(
            "",
            name || "Google User",
            email as unknown as Email,
            "",
            undefined,
            picture,
            undefined,
            false,
            {},
            googleId,
            new Date(),
            new Date(),
            false
          );

          customer = await customerRepository.create(newCustomer);
        }

        return done(null, customer);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  const id = user.getId ? user.getId() : user._id || user.id;
  done(null, id);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    if (!id) return done(null, null);
    const user = await customerRepository.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;