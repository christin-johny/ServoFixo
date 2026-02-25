import { ProcessPaymentDto } from "../../../dto/webhook/ProcessPaymentDto";

 
export interface IProcessPaymentUseCase {
  execute(input: ProcessPaymentDto): Promise<void>;
}