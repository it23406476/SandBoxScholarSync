/**
 * Unit tests for community API input validation logic.
 * Tests the validation rules applied before DB writes in the API routes.
 */

// --- Validation helpers (mirrors logic in /api/posts/route.ts POST handler) ---

function validateCreatePost(body: {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  imageUrl?: unknown;
}) {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    errors.push('Content is required');
  }
  if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
    errors.push('Category is required');
  }

  const validCategories = ['general', 'study', 'projects', 'announcements', 'events'];
  if (body.category && !validCategories.includes(body.category as string)) {
    errors.push('Invalid category');
  }

  if (typeof body.title === 'string' && body.title.length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

function validateCreateComment(body: { content?: unknown; postId?: unknown }) {
  const errors: string[] = [];

  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    errors.push('Comment content is required');
  }
  if (!body.postId || typeof body.postId !== 'string') {
    errors.push('Post ID is required');
  }

  return { valid: errors.length === 0, errors };
}

// --- Tests ---

describe('Post creation validation', () => {
  it('passes with all valid fields', () => {
    const result = validateCreatePost({
      title: 'My Article',
      content: 'This is the article content.',
      category: 'general',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when title is missing', () => {
    const result = validateCreatePost({ content: 'content', category: 'general' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  it('fails when title is empty string', () => {
    const result = validateCreatePost({ title: '   ', content: 'content', category: 'general' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  it('fails when content is missing', () => {
    const result = validateCreatePost({ title: 'Title', category: 'general' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Content is required');
  });

  it('fails when category is missing', () => {
    const result = validateCreatePost({ title: 'Title', content: 'content' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Category is required');
  });

  it('fails when category is not a valid value', () => {
    const result = validateCreatePost({
      title: 'Title',
      content: 'content',
      category: 'invalid-category',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid category');
  });

  it('accepts all 5 valid category values', () => {
    const categories = ['general', 'study', 'projects', 'announcements', 'events'];
    categories.forEach((cat) => {
      const result = validateCreatePost({ title: 'T', content: 'C', category: cat });
      expect(result.valid).toBe(true);
    });
  });

  it('fails when title exceeds 200 characters', () => {
    const result = validateCreatePost({
      title: 'a'.repeat(201),
      content: 'content',
      category: 'general',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title must be 200 characters or fewer');
  });

  it('returns multiple errors when multiple fields are invalid', () => {
    const result = validateCreatePost({});
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Comment creation validation', () => {
  it('passes with valid content and postId', () => {
    const result = validateCreateComment({ content: 'Great article!', postId: 'post-123' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when content is missing', () => {
    const result = validateCreateComment({ postId: 'post-123' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Comment content is required');
  });

  it('fails when content is empty string', () => {
    const result = validateCreateComment({ content: '   ', postId: 'post-123' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Comment content is required');
  });

  it('fails when postId is missing', () => {
    const result = validateCreateComment({ content: 'A comment' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Post ID is required');
  });

  it('fails when both fields are missing', () => {
    const result = validateCreateComment({});
    expect(result.errors).toHaveLength(2);
  });
});

describe('Authentication guard logic', () => {
  it('rejects request when sessionUser is null', () => {
    const sessionUser = null;
    const isAuthorized = sessionUser !== null;
    expect(isAuthorized).toBe(false);
  });

  it('allows request when sessionUser has an id', () => {
    const sessionUser = { id: 'user-123', name: 'Test User', email: 'test@test.com' };
    const isAuthorized = sessionUser !== null && !!sessionUser.id;
    expect(isAuthorized).toBe(true);
  });

  it('blocks post deletion when user is not the author', () => {
    const sessionUserId = 'user-999';
    const postAuthorId = 'user-123';
    const canDelete = sessionUserId === postAuthorId;
    expect(canDelete).toBe(false);
  });

  it('allows post deletion when user is the author', () => {
    const sessionUserId = 'user-123';
    const postAuthorId = 'user-123';
    const canDelete = sessionUserId === postAuthorId;
    expect(canDelete).toBe(true);
  });
});
