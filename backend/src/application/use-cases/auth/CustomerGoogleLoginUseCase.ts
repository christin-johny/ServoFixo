import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IJwtService, JwtPayload } from "../../interfaces/IJwtService";  
import { IGoogleAuthService } from "../../interfaces/IGoogleAuthService";  
import { ICacheService } from "../../interfaces/ICacheService";  
import { Customer } from "../../../domain/entities/Customer";
import { Email } from "../../../domain/value-objects/ContactTypes";
import { ILogger } from "../../interfaces/ILogger";
import { S3UrlHelper } from "../../../infrastructure/storage/S3UrlHelper";

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
  constructor(
    private readonly _customerRepository: ICustomerRepository,
    private readonly _jwtService: IJwtService,
    private readonly _googleAuthService: IGoogleAuthService,  
    private readonly _cacheService: ICacheService, 
    private readonly _logger: ILogger
  ) {}

  async execute(request: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      let customer: Customer | null = null;
      let picture: string | undefined;

      if (request.token) { 
        const googlePayload = await this._googleAuthService.verifyToken(request.token);
        
        const { email, name, googleId, picture: pic } = googlePayload;
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
        const rawCust = request.customer as any  ;
        customer = rawCust;
        picture = rawCust.avatarUrl || rawCust.picture;
      } else {
        throw new Error(
          "Either token or customer must be provided to Google login use-case."
        );
      }

      if (!customer) throw new Error("Customer resolution failed.");

      const customerId = customer.getId();
      const jwtPayload: JwtPayload = {
        sub: customerId,
        type: "customer",
      };

      const accessToken = await this._jwtService.generateAccessToken(
        jwtPayload
      );
      const refreshToken = await this._jwtService.generateRefreshToken({
        sub: customerId,
        type: "customer",
      });
      const ttlSeconds = parseInt(
        process.env.JWT_REFRESH_EXPIRES_SECONDS ?? String(7 * 24 * 60 * 60),
        10
      );

      try { 
        await this._cacheService.set(
          `refresh:${refreshToken}`,
          String(customerId),
          ttlSeconds
        );
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this._logger.error("Failed to store refresh token in cache:", errorMessage);
      }

      return {
        accessToken,
        refreshToken,
        user: {
          id: customerId,
          name: customer.getName(),
          email:
            typeof customer.getEmail === "function"
              ? (customer.getEmail() as string)
              : customer.getEmail(),
          avatarUrl: S3UrlHelper.getFullUrl(customer.getAvatarUrl() || picture),
        },
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      this._logger.error(
        "Google Login Error",
        errorMessage
      );

      throw new Error(
        `CustomerGoogleLoginUseCase error: ${errorMessage}`
      );
    }
  }
}