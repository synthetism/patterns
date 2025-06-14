import { Result } from "../../../src/patterns/result";
import { ValueObject } from "../../../src/patterns/value-object";
import type { Mapper } from "../../../src/patterns/mapper";

export interface PostModel {
	id?: string;
	title: string;
	createdAt: Date;
}

// Post Value Objects
export class PostTitle extends ValueObject<{ value: string }> {
	private constructor(props: { value: string }) {
		super(props);
	}

	public static create(title: string): Result<PostTitle> {
		if (!title || title.trim().length === 0) {
			return Result.fail("Post title cannot be empty");
		}

		if (title.length > 100) {
			return Result.fail("Post title cannot be longer than 100 characters");
		}

		return Result.success(new PostTitle({ value: title }));
	}

	get value(): string {
		return this.props.value;
	}
}

// Domain Entity
export class Post {
	public readonly id?: string;
	public readonly title: PostTitle;
	public readonly createdAt: Date;

	private constructor(props: {
		id?: string;
		title: PostTitle;
		createdAt: Date;
	}) {
		this.id = props.id;
		this.title = props.title;
		this.createdAt = props.createdAt;
	}

	public static create(props: {
		id?: string;
		title: string;
		createdAt: Date;
	}): Result<Post> {
		const titleOrError = PostTitle.create(props.title);

		if (titleOrError.isFailure) {
			return Result.fail(titleOrError.errorMessage || "Invalid post title");
		}

		return Result.success(
			new Post({
				id: props.id,
				title: titleOrError.value,
				createdAt: props.createdAt,
			}),
		);
	}
}

// Mapper
export class PostMapper implements Mapper<Post, PostModel> {
	toDomain(raw: PostModel): Result<Post> {
		return Post.create({
			id: raw.id,
			title: raw.title,
			createdAt: raw.createdAt,
		});
	}

	toPersistence(domain: Post): PostModel {
		return {
			id: domain.id,
			title: domain.title.value,
			createdAt: domain.createdAt,
		};
	}
}
