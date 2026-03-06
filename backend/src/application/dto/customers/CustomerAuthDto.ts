
export interface UpdateCustomerRequestDto {
  name?: string;
  phone?: string;
  suspended?: boolean;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface CustomerProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | undefined;
    avatarUrl: string;
  };
}

export interface IUploadAvatarFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}
 