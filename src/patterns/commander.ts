/**
 * Interface for all command objects
 */
export interface Command {
  /**
   * Executes the command
   */
  execute(): void;
}

/**
 * Interface for commands that can be undone
 */
export interface UndoableCommand extends Command {
  /**
   * Undoes the command, restoring the previous state
   */
  undo(): void;
}

/**
 * Manages the execution of commands and keeps track of command history
 */
export class CommandInvoker {
  private history: UndoableCommand[] = [];

  /**
   * Executes a command
   */
  execute(command: Command): void {
    command.execute();

    if (this.isUndoable(command)) {
      this.history.push(command);
    }
  }

  /**
   * Undoes the most recently executed command
   * @returns true if a command was undone, false if there was no command to undo
   */
  undo(): boolean {
    const command = this.history.pop();
    if (command) {
      command.undo();
      return true;
    }
    return false;
  }

  /**
   * Clears the command history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Returns the number of undoable commands in history
   */
  historyLength(): number {
    return this.history.length;
  }

  /**
   * Type guard to check if a command is undoable
   */
  private isUndoable(command: Command): command is UndoableCommand {
    return (
      "undo" in command &&
      typeof (command as UndoableCommand).undo === "function"
    );
  }
}
