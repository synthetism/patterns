import type { IAsyncFileSystem } from '../filesystem/promises';
import  { ValueObject } from '../patterns';
import  { Result } from '../patterns/result';
/**
 * The foundational file interface - everything is a file
 * This interface can be extended to create specific file types
 * with additional capabilities as needed.
 * 
 * 
 */
export interface IUnit {
  data: string;
}

export interface UnitProps {
  data: string;
}

export interface IFileUnit {
  data: string;
  format: string;
}


export class Unit<U extends IUnit> extends ValueObject<U> {


  private constructor(props: U) {
    super(props);
  }
  public static create(
    data: string,
  ): Result<IUnit> {

    const unit = new Unit({ data });
    return Result.success(unit);
  }

  public static fromJSON(json: string): Result<IUnit> {
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

export class FileUnit extends Unit<IFileUnit> {

  private constructor(props: IFileUnit) {
    super(props);

  }

  public static create(
    data: string,
    format: string,
  ): Result<FileUnit> {
    const fileUnit = new FileUnit({ data, format });
    return Result.success(fileUnit);
  }

  get format(): string {
    return this.props.format;
  }
}
/**
 * Interface for file system operations
 * Generic over file type to allow for different file implementations
 */
export interface IUnitSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}


export interface UnitOptions {
  name?: string
  [x: string]: unknown
}


/**
 * Basic file system implementation
 * The foundation that everything builds on
 */
export class AbstractUnitSystem implements Partial<IAsyncFileSystem>, IUnitSystem {
  private name: string;

  constructor(
    private filesystem: IAsyncFileSystem,
    private options?: UnitOptions,
  ) {
    this.name = options?.name || 'UnitSystem';
  }


  async readFile(path: string): Promise<string> {
    const file = await this.filesystem.readFile(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    const unit = Unit.fromJSON(file);

    if (unit.isFailure) {
      throw new Error(`Failed to create unit from file: ${unit.errorMessage}`);
    }

    return unit.value.data;
  }

  async writeFile(path: string, data: string): Promise<void> {

    const unit = Unit.create(data);
    if (unit.isFailure) {
      throw new Error(`Failed to create unit from data: ${unit.errorMessage}`);
    }

    this.filesystem.writeFile(path, unit.value.toJSON());
  }

  async deleteFile(path: string): Promise<void> {
    this.filesystem.deleteFile(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.filesystem.exists(path);
  }
}
