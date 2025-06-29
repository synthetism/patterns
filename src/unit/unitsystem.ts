import type { IAsyncFileSystem } from '../filesystem/promises';
import   { Unit, type IUnitOptions } from './unit';

/**
 * The foundational file interface - everything is a file
 * This interface can be extended to create specific file types
 * with additional capabilities as needed.
 * 
 * 
 */



export interface IUnitSystem<U> {

  readFile(path: string): Promise<string>;
  writeFile(path: string, props: U): Promise<void>;
  deleteFile(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

/**
 * Interface for file system operations
 * Generic over file type to allow for different file implementations



export interface IUnitOptions {
  name?: string
  [x: string]: unknown
}



export interface IFileUnit {
  data: string;
  format: string;
}

/**
 * Basic file system implementation
 * The foundation that everything builds on
 */



export class UnitSystem implements IUnitSystem<Unit> {
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
    const unit = Unit.fromJSON(file);

    if (unit.isFailure) {
      throw new Error(`Failed to create unit from file: ${unit.errorMessage}`);
    }

    return unit.value.data.toString();
  }

  async writeFile(path: string,  props: Unit): Promise<void> {

    const fileUnit = Unit.create({
      data: props.data,
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
