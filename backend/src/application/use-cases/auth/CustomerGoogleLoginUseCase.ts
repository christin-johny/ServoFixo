// backend/src/application/use-cases/auth/CustomerGoogleLoginUseCase.ts
import { OAuth2Client } from 'google-auth-library';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { Customer } from '../../../domain/entities/Customer';
import { Email } from '../../../../../shared/types/value-objects/ContactTypes';

interface GoogleLoginRequest {
  token?: string;
  // If you call this use-case from your Passport callback, you can pass the customer object directly:
  customer?: any;
}

interface GoogleLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export class CustomerGoogleLoginUseCase {
  private googleClient: OAuth2Client;
  private clientId: string;

  constructor(
    private customerRepository: ICustomerRepository,
    private jwtService: JwtService,
    clientId: string
  ) {
    this.clientId = clientId;
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Accepts either:
   *  - { token: '<idToken>' }  (frontend flow where you verify idToken)
   *  - { customer: <Customer | plain object> } (passport flow where req.user already exists)
   */
  async execute(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      let customer: Customer | any = null;
      let picture: string | undefined;

      // 1) If token is provided -> verify the Google token and find/create customer
      if (request.token) {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: request.token,
          audience: this.clientId,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
          throw new Error('Invalid Google Token');
        }

        const { email, name, sub: googleId, picture: pic } = payload;
        picture = pic;

        customer = await this.customerRepository.findByEmail(email);

        if (customer) {
          // update googleId if missing
          if (typeof customer.getGoogleId === 'function' && !customer.getGoogleId()) {
            if (typeof (this.customerRepository as any).update === 'function') {
              await (this.customerRepository as any).update(customer.getId(), { googleId });
              customer = await this.customerRepository.findByEmail(email);
            } else {
              // recreate or set googleId locally (best-effort; repository should ideally support update)
              customer = new Customer(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPassword(),
                customer.getPhone(),
                customer.getAvatar?.() ?? undefined,
                undefined, // defaultZoneId
                customer.getAddresses ? customer.getAddresses() : [],
                customer.isSuspended ? customer.isSuspended() : false,
                undefined,
                customer.getAdditionalInfo ? customer.getAdditionalInfo() : {},
                googleId
              );
            }
          }
        } else {
          // create new customer
          customer = new Customer(
            '',
            name || 'Google User',
            email as unknown as Email,
            '', // no password for oauth user
            undefined,
            picture,
            undefined,
            [],
            false,
            undefined,
            {},
            googleId
          );
          customer = await this.customerRepository.create(customer);
        }
      } else if (request.customer) {
        // 2) If the controller (Passport) already provided a customer object, use it
        customer = request.customer;
        // If the passed customer has no avatar/picture property, try to read it if exists
        picture = (customer && (customer.getAvatar?.() || customer.avatar || customer.picture)) ?? undefined;
      } else {
        throw new Error('Either token or customer must be provided to Google login use-case.');
      }

      // final sanity
      if (!customer || !customer.getId && !customer._id && !customer.id) {
        // If the repository returned a plain object, normalize id accessors:
        const id = customer.getId ? customer.getId() : customer._id ?? customer.id;
        if (!id) throw new Error('Could not resolve customer id after Google login flow.');
      }

      const customerId = customer.getId ? customer.getId() : (customer._id ?? customer.id);

      // 3) Prepare JWT payload and generate tokens
      const jwtPayload: any = {
        sub: customerId,
        roles: ['customer'],
        type: 'customer',
      };

      const accessToken = await this.jwtService.generateAccessToken(jwtPayload);
      const refreshToken = await this.jwtService.generateRefreshToken({
        sub: customerId,
        roles: ['customer'],
        type: 'customer',
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: customerId,
          name: customer.getName ? customer.getName() : (customer.name ?? ''),
          email: customer.getEmail ? customer.getEmail() : (customer.email ?? ''),
          avatarUrl: picture,
        },
      };
    } catch (err: any) {
      // Bubble up with a clear message for debugging
      throw new Error(`CustomerGoogleLoginUseCase error: ${err.message || err}`);
    }
  }
}
