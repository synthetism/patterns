import { Result, ValueObject } from "../../src/patterns";

interface EmailProps {
	value: string;
}

export class Email extends ValueObject<EmailProps> {
	private constructor(props: EmailProps) {
		super(props);
	}

	public static create(email: string): Result<Email> {
		if (!email || email.trim().length === 0) {
			return Result.fail("Email cannot be empty");
		}

		if (!Email.isValidEmail(email)) {
			return Result.fail("Email is not in valid format");
		}

		return Result.success(new Email({ value: email.toLowerCase() }));
	}

	private static isValidEmail(email: string): boolean {
		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		return emailRegex.test(email);
	}

	get value(): string {
		return this.props.value;
	}

	toString(): string {
		return this.props.value;
	}
}
