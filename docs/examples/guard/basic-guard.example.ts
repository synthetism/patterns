  // Validate with type-specific guards
 import { Guard, Result } from '@synet/patterns';


function validateProductData(): Result<void> {

    const name = 'Product Name';
    const price = 19.99;
    const quantity = 5; 
    const nameResult = Guard.String.nonEmpty(name, 'name');
    const priceResult = Guard.Number.positive(price, 'price');
    const quantityResult = Guard.Number.min(quantity, 0, 'quantity');

    const validationResult = Guard.combine([nameResult, priceResult, quantityResult]);

    if (validationResult.isFailure) {
    return Result.fail(validationResult.errorMessage || 'Validation failed');
    }

    return Result.success(undefined);
}

 // Proceed with valid data...
