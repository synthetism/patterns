import { Result } from '../patterns/result';
import { ValueObject } from '../patterns/value-object';
/**
 * The foundational file interface - everything is a file
 * This interface can be extended to create specific file types
 * with additional capabilities as needed.
 * 
 * 
 */

export interface IUnit {
  data: string;
  [x: string]: unknown
}

export interface IUnitOptions {
  name?: string
  [x: string]: unknown
}



export class Unit extends ValueObject<IUnit> {


  private constructor(props: IUnit) {
    super(props);
  }
  public static create<U>(props: IUnit): Result<Unit> {

    const unit = new Unit(props);
    return Result.success(unit);
  }

  public static fromJSON(json: string): Result<Unit> {
    try {
      const data = JSON.parse(json);
      return Unit.create(data);
    } catch (error) {
      
      return Result.fail(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public toJSON(): string {
     try {
    return JSON.stringify(this.props.data);
    } catch (error) {
      throw new Error(`Failed to serialize unit to JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  get data(): string {
    return this.props.data;
  }

}