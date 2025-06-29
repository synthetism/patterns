import type { IAsyncFileSystem } from '../filesystem/promises';
import  { ValueObject } from '../patterns';
import  { Result } from '../patterns/result';
import type { IUnit, IUnitOptions } from './unit';
/**
 * The foundational file interface - everything is a file
 * This interface can be extended to create specific file types
 * with additional capabilities as needed.
 * 
 * 
 */

export interface IFileUnitOptions extends IUnitOptions {
  name: string
  encoding: string;
  actions: string[];
  behaviours: string[];
  reletaionships: string[];
}


export interface IFileUnit extends IUnit {
  data: string;
  format: string;
}

export class FileUnit<U extends IFileUnit = IFileUnit> extends ValueObject<U> {

  private constructor(props: U) {
    super(props);
  }
  public static create<U>(props: U extends IFileUnit ? U : IFileUnit): Result<FileUnit<U extends IFileUnit ? U : IFileUnit>> {

    if(!props || typeof props.data !== 'string') {
      return Result.fail('Invalid file unit properties: data must be a string');
    }
    if(!props.format || typeof props.format !== 'string') {
      return Result.fail('Invalid file unit properties: format must be a string');
    }
    const unit = new FileUnit(props);
    return Result.success(unit);
  }

  public static fromJSON<U extends IFileUnit>(json: string): Result<FileUnit<U extends IFileUnit ? U : IFileUnit>> {
    try {
      const data = JSON.parse(json);
      return FileUnit.create(data);
    } catch (error) {
      console.error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
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

/**
 * Interface for file system operations
 * Generic over file type to allow for different file implementations
 */
export interface IFileUnitSystem {
  readFile(path: string): Promise<string>;
  writeFile(path: string, props: IFileUnit): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}




/**
 * Basic file system implementation
 * The foundation that everything builds on
 */
export class UnitFileSystem implements IFileUnitSystem {
  private name: string;

  constructor(
    private filesystem: IAsyncFileSystem,
    private options?: IUnitOptions,
  ) {
    this.name = options?.name || 'UnitSystem';
  }

  async readFile(path: string): Promise<string> {
    const file = await this.filesystem.readFile(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    const unit = FileUnit.fromJSON(file);

    if (unit.isFailure) {
      throw new Error(`Failed to create unit from file: ${unit.errorMessage}`);
    }

    return unit.value.data.toString();
  }

  async writeFile(path: string,  props: IFileUnit): Promise<void> {

    const fileUnit = FileUnit.create<IFileUnit>({
      data: props.data,
      format: props.format,
    });

    if (fileUnit.isFailure) {
      throw new Error(`Failed to create file unit: ${fileUnit.errorMessage}`);
    }

    
    if (fileUnit.isFailure) {
      throw new Error(`Failed to create unit from data: ${fileUnit.errorMessage}`);
    }

    this.filesystem.writeFile(path, fileUnit.value.toJSON());
  }

  async deleteFile(path: string): Promise<void> {
    this.filesystem.deleteFile(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.filesystem.exists(path);
  }
}
