import { OAuth2Client } from "google-auth-library";
import { IGoogleAuthService, GoogleUserPayload } from "../../application/interfaces/services/IGoogleAuthService";

export class GoogleAuthService implements IGoogleAuthService {
  private _client: OAuth2Client;

  constructor(clientId: string) {
    this._client = new OAuth2Client(clientId);
  }

  async verifyToken(token: string): Promise<GoogleUserPayload> {
    const ticket = await this._client.verifyIdToken({
      idToken: token,
      audience: this._client._clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google Token Payload");
    }

    return {
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      picture: payload.picture,
    };
  }
}