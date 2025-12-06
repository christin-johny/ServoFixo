// backend/src/infrastructure/security/PassportConfig.ts
import passport from "passport";
import { CustomerMongoRepository } from "../database/repositories/CustomerMongoRepository";
import { Customer } from "../../domain/entities/Customer";
import { Email } from "../../../../shared/types/value-objects/ContactTypes";

const customerRepository = new CustomerMongoRepository();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL ?? `${process.env.BACKEND_ORIGIN ?? ""}/api/customer/auth/google/callback`;

  // require inside guard so app doesn't crash when envs are missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
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
            // If an existing customer exists but has no googleId, update it.
            // Make sure your repository has an update/save method — if not, add one.
            if (!customer.getGoogleId && !customer.getGoogleId?.()) {
              // Example: use repository.update(customerId, { googleId })
              if (typeof (customerRepository as any).update === "function") {
                await (customerRepository as any).update(customer.getId(), { googleId });
                customer = await customerRepository.findByEmail(email); // refresh
              } else {
                // Fallback: recreate Customer object with googleId and save if repository supports create/save
                // (adjust according to your repo)
              }
            }
          } else {
            // Create new customer
            const newCustomer = new Customer(
              "", // id will be created by repo
              name || "Google User",
              email as unknown as Email,
              "", // no password for oauth user
              undefined, // phone
              picture,
              undefined, // avatarUrl (if you have separate field)
              [], // addresses
              false, // suspended
              undefined, // additional flags
              {}, // additionalInfo
              googleId
            );
            customer = await customerRepository.create(newCustomer);
          }


          return done(null, customer);
        } catch (error) {
          console.error('[PASSPORT:VERIFY] error', error);

          return done(error, undefined);
        }
      }
    )
  );


// serialize / deserialize (adjust to your app's desired behaviour)
passport.serializeUser((user: any, done) => {
  done(null, (user && user._id) || user);
});

passport.deserializeUser(async (id: any, done) => {
  try {
    if (!id) return done(null, null);
    const user = await customerRepository.findById ? await (customerRepository as any).findById(id) : null;
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
