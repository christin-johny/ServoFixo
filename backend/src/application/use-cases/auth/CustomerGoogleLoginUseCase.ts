import { OAuth2Client } from "google-auth-library";
import redis from "../../../infrastructure/redis/redisClient";
import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { JwtService } from "../../../infrastructure/security/JwtService";
import { Customer } from "../../../domain/entities/Customer";
import { Email } from "../../../../../shared/types/value-objects/ContactTypes";

interface GoogleLoginRequest {
  token?: string;
  customer?: object;
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
  private _googleClient: OAuth2Client;
  private _clientId: string;

  constructor(
    private _customerRepository: ICustomerRepository,
    private _jwtService: JwtService,
    clientId: string
  ) {
    this._clientId = clientId;
    this._googleClient = new OAuth2Client(clientId);
  }

  async execute(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      let customer: Customer | null = null;
      let picture: string | undefined;

      if (request.token) {
        const ticket = await this._googleClient.verifyIdToken({
          idToken: request.token,
          audience: this._clientId,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
          throw new Error("Invalid Google Token");
        }

        const { email, name, sub: googleId, picture: pic } = payload;
        picture = pic;

        customer = await this._customerRepository.findByEmail(email);

        if (customer) {
          if (!customer.getGoogleId()) {
            customer = new Customer(
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
            await this._customerRepository.update(customer);
          }
        } else {
          customer = new Customer(
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

          customer = await this._customerRepository.create(customer);
        }
      } else if (request.customer) {
        const rawCust = request.customer as any;
        customer = rawCust;
        picture = rawCust.avatarUrl || rawCust.picture;
      } else {
        throw new Error(
          "Either token or customer must be provided to Google login use-case."
        );
      }

      if (!customer) throw new Error("Customer resolution failed.");

      const customerId = customer.getId();
      const jwtPayload: any = {
        sub: customerId,
        type: "customer",
      };

      const accessToken = await this._jwtService.generateAccessToken(jwtPayload);
      const refreshToken = await this._jwtService.generateRefreshToken({
        sub: customerId,
        type: "customer",
      });
      const ttlSeconds = parseInt(
        process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
        10
      );

      try {
        await redis.set(
          `refresh:${refreshToken}`,
          String(customerId),
          "EX",
          ttlSeconds
        );
      } catch (err) {
        console.error("Failed to store refresh token in redis:", err);
      }

      return {
        accessToken,
        refreshToken,
        user: {
          id: customerId,
          name: customer.getName(),
          email: typeof customer.getEmail === 'function' ? (customer.getEmail() as any) : customer.getEmail(),
          avatarUrl: picture,
        },
      };
    } catch (err: any) {
      throw new Error(
        `CustomerGoogleLoginUseCase error: ${err.message || err}`
      );
    }
  }
}