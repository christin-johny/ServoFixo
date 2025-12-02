import { OAuth2Client } from 'google-auth-library';
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository';
import { JwtService } from '../../../infrastructure/security/JwtService';
import { Customer } from '../../../domain/entities/Customer';
import { Email } from '../../../../../shared/types/value-objects/ContactTypes';

interface GoogleLoginRequest {
  token: string;
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

  constructor(
    private customerRepository: ICustomerRepository,
    private jwtService: JwtService,
    clientId: string
  ) {
    this.googleClient = new OAuth2Client(clientId);
  }

  async execute(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: request.token,
      audience: this.googleClient._clientId,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Invalid Google Token');
    }

    const { email, name, sub: googleId, picture } = payload;

    let customer = await this.customerRepository.findByEmail(email);

    if (customer) {
      // Update googleId if not present
      if (!customer.getGoogleId()) {
          customer = new Customer(
            customer.getId(),
            customer.getName(),
            customer.getEmail(),
            customer.getPassword(),
            customer.getPhone(),
            undefined, // avatar
            undefined, // defaultZoneId
            [], // addresses
            false, // suspended
            undefined, // suspendReason
            {}, // additionalInfo
            googleId
          );
      }
    } else {
      // Create new customer
      customer = new Customer(
        '', 
        name || 'Google User',
        email as unknown as Email, 
        '', 
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

    const jwtPayload: any = { // Use 'any' or import JwtPayload to be safe, but let's match the interface
      sub: customer.getId(),
      roles: ['customer'],
      type: 'customer',
    };

    const accessToken = await this.jwtService.generateAccessToken(jwtPayload);

    const refreshToken = await this.jwtService.generateRefreshToken({
      sub: customer.getId(),
      roles: ['customer'],
      type: 'customer',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: customer.getId(),
        name: customer.getName(),
        email: customer.getEmail(),
        avatarUrl: picture, // Use google picture or customer avatar
      },
    };
  }
}
