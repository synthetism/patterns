import { describe, it, expect } from "vitest";
import { Email } from "./examples/value-objects/email";
import { Post } from "./examples/value-objects/post";

describe("Value Object Pattern", () => {
	describe("Post Value Object", () => {
		it("should create valid Post entity", () => {
			const postOrError = Post.create({
				id: "123",
				title: "My First Post",
				createdAt: new Date("2025-01-01"),
			});

			expect(postOrError.isSuccess).toBe(true);
			expect(postOrError.value.id).toBe("123");
			expect(postOrError.value.title.value).toBe("My First Post");
			expect(postOrError.value.createdAt).toBeInstanceOf(Date);
		});

		it("should reject post with invalid title", () => {
			const emptyTitlePost = Post.create({
				id: "123",
				title: "",
				createdAt: new Date(),
			});

			const longTitlePost = Post.create({
				id: "123",
				title: "a".repeat(101), // 101 chars
				createdAt: new Date(),
			});

			expect(emptyTitlePost.isFailure).toBe(true);
			expect(longTitlePost.isFailure).toBe(true);
		});
	});

	describe("Email Value Object", () => {
		it("should create a valid email", () => {
			const emailOrError = Email.create("test@example.com");

			expect(emailOrError.isSuccess).toBe(true);
			expect(emailOrError.value.value).toBe("test@example.com");
		});

		it("should reject invalid emails", () => {
			const invalidEmails = [
				"",
				"not-an-email",
				"@missing-local-part.com",
				"missing-domain@",
				"missing-domain-part@domain",
				"spaces in@email.com",
			];

			for (const invalid of invalidEmails) {
				const result = Email.create(invalid);
				expect(result.isFailure).toBe(true);
			}
		});

		it("should convert emails to lowercase", () => {
			const mixedCaseEmail = "TeSt@ExAmPlE.CoM";
			const email = Email.create(mixedCaseEmail);

			expect(email.isSuccess).toBe(true);
			expect(email.value.value).toBe("test@example.com");
		});

		it("should compare emails correctly", () => {
			const email1 = Email.create("test@example.com").value;
			const email2 = Email.create("test@example.com").value;
			const email3 = Email.create("different@example.com").value;

			expect(email1.equals(email2)).toBe(true);
			expect(email1.equals(email3)).toBe(false);
		});

		it("should handle null/undefined in equals method", () => {
			const email = Email.create("test@example.com").value;

			expect(email.equals(undefined)).toBe(false);

			// For testing with null, create a type-safe approach
			const nullEmail: Email | null = null;
			expect(email.equals(nullEmail)).toBe(false);

			const unknownValue: unknown = null;
			expect(email.equals(unknownValue as Email)).toBe(false);
		});

		it("should provide string representation", () => {
			const email = Email.create("test@example.com").value;

			expect(email.toString()).toBe("test@example.com");
		});
	});
});
