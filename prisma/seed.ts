import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database... 🌱');
  const seededPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create Academic Modules
  const itpm = await prisma.module.upsert({
    where: { code: 'IT3040' },
    update: {},
    create: { code: 'IT3040', name: 'IT Project Management' },
  });

  const dsa = await prisma.module.upsert({
    where: { code: 'IT3010' },
    update: {},
    create: { code: 'IT3010', name: 'Data Science & Analytics' },
  });

  // 2. Create Test Students
  const student1 = await prisma.user.upsert({
    where: { email: 'sams@student.sliit.lk' },
    update: {
      password: seededPassword,
    },
    create: {
      name: 'Sams Senarath',
      email: 'sams@student.sliit.lk',
      role: 'STUDENT',
      password: seededPassword,
      points: 500,
      badges: JSON.stringify(['Beta Tester']),
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'kamal@student.sliit.lk' },
    update: {
      password: seededPassword,
    },
    create: {
      name: 'Kamal Perera',
      email: 'kamal@student.sliit.lk',
      role: 'STUDENT',
      password: seededPassword,
      points: 200,
    },
  });

  // 3. Create Test Lecturer
  const lecturer = await prisma.user.upsert({
    where: { email: 'sarah@lecturer.sliit.lk' },
    update: {
      password: seededPassword,
    },
    create: {
      name: 'Dr. Sarah',
      email: 'sarah@lecturer.sliit.lk',
      role: 'LECTURER',
      password: seededPassword,
      points: 1000,
      badges: JSON.stringify(['Verified Educator']),
    },
  });

  // 4. Create Multiple Questions to Test "Smart Search" and "Ranking"

  // Question A: The original one (High Bounty)
  const q1 = await prisma.question.create({
    data: {
      title: 'When is the final ITPM Project Submission?',
      content: 'Does anyone know the exact deadline for the final 6-week sprint deployment?',
      tags: JSON.stringify(['deadline', 'deployment', 'itpm']),
      bounty: 50,
      upvotes: 2,
      authorId: student1.id,
      moduleId: itpm.id,
    },
  });

  // Question B: Similar keywords to test Duplicate Detection
  await prisma.question.create({
    data: {
      title: 'How do we deploy the final assignment?',
      content: 'Are we supposed to use Vercel or Render for the deployment?',
      tags: JSON.stringify(['deployment', 'vercel']),
      bounty: 0,
      upvotes: 10, // High upvotes to test ranking
      authorId: student2.id,
      moduleId: itpm.id,
    },
  });

  // Question C: DSA Module Question
  await prisma.question.create({
    data: {
      title: 'Help with Python Pandas assignment',
      content: 'I keep getting a KeyError when merging two dataframes. Any tips?',
      tags: JSON.stringify(['python', 'pandas', 'error']),
      bounty: 20,
      upvotes: 0,
      authorId: student1.id,
      moduleId: dsa.id,
    },
  });

  // 5. Create a Lecturer Verified Answer
  await prisma.answer.create({
    data: {
      content:
        'The final submission link will close on Friday at 11:59 PM. Please ensure your Vercel links are active.',
      upvotes: 5,
      isVerified: true, // This is what gives it the 5x multiplier in your algorithm!
      authorId: lecturer.id,
      questionId: q1.id,
    },
  });

  // 6. Create Detailed Community Posts with Lengthy Content

  const post1 = await prisma.post.create({
    data: {
      title: 'Mastering React Hooks: A Comprehensive Guide for 2024',
      content: `React Hooks have fundamentally transformed the way we write React components. Since their introduction in React 16.8, hooks have become the standard approach for managing state, side effects, and component logic in functional components. In this comprehensive guide, I will walk through every built-in hook, common patterns, and advanced techniques that will elevate your React development skills.

## useState: The Foundation of State Management

The useState hook is the most fundamental hook in React. It allows you to add state to functional components without converting them to class components. The hook returns an array with two elements: the current state value and a function to update it.

When working with useState, it is important to understand that state updates are asynchronous. React batches state updates for performance reasons, which means the new state value is not immediately available after calling the setter function. This is a common source of bugs for beginners who try to read the state value right after updating it.

A lesser-known feature of useState is the functional updater form. Instead of passing a new value directly, you can pass a function that receives the previous state as an argument. This is essential when the new state depends on the previous state, such as incrementing a counter or toggling a boolean. Using the functional updater ensures you always work with the most recent state value, even when multiple updates are batched together.

For expensive initial state computations, you can pass a function to useState that will only be executed during the initial render. This prevents the expensive computation from running on every re-render, which is a significant performance optimization.

## useEffect: Managing Side Effects

The useEffect hook lets you perform side effects in function components. Side effects include data fetching, subscriptions, manual DOM manipulations, and anything that interacts with the world outside of React's rendering cycle.

Understanding the dependency array is crucial for using useEffect correctly. The dependency array tells React when to re-run the effect. An empty dependency array means the effect runs only once after the initial render. Omitting the dependency array entirely means the effect runs after every render. Including specific values means the effect runs when those values change.

One of the most common mistakes with useEffect is not including all dependencies in the dependency array. React's exhaustive-deps lint rule helps catch these issues, but many developers suppress the warnings instead of fixing the underlying problem. Missing dependencies can lead to stale closures, where the effect captures old values and never sees updated ones.

Cleanup functions are another critical aspect of useEffect. If your effect sets up a subscription, timer, or any resource that needs to be cleaned up, you should return a cleanup function from the effect. React will call this cleanup function before the component unmounts and before re-running the effect on subsequent renders. Failing to clean up can cause memory leaks and unexpected behavior.

## useCallback and useMemo: Performance Optimization

The useCallback hook memoizes a function so that it maintains the same reference across re-renders, as long as its dependencies do not change. This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary re-renders.

The useMemo hook memoizes the result of an expensive computation. Like useCallback, it takes a dependency array and only recomputes the memoized value when one of the dependencies changes. This is particularly useful for filtering large lists, complex calculations, or transforming data that would be expensive to recompute on every render.

However, it is important not to overuse these hooks. Memoization itself has a cost — React needs to compare dependencies on every render. Only use useCallback and useMemo when you have identified an actual performance problem through profiling. Premature optimization with these hooks can actually make your application slower.

## useRef: Beyond the DOM

While useRef is commonly known for accessing DOM elements directly, it has broader applications. A ref is essentially a mutable container that persists across re-renders without causing re-renders when its value changes. This makes it perfect for storing values that need to persist but should not trigger UI updates.

Common use cases for useRef include storing previous state values, keeping track of animation frame IDs, holding WebSocket connections, and maintaining any mutable value that does not affect rendering. The key distinction from useState is that changing a ref does not cause the component to re-render.

## useReducer: Complex State Logic

For state that involves multiple sub-values or when the next state depends on the previous one in complex ways, useReducer provides a more structured approach than useState. It follows the Redux pattern with a reducer function and dispatched actions.

The useReducer hook is particularly useful when you have complex state transitions that would be difficult to express with multiple useState calls. It centralizes the state logic in a single reducer function, making it easier to test and reason about. The pattern also makes it straightforward to add new state transitions without cluttering the component with additional setter functions.

## Custom Hooks: Reusable Logic

One of the most powerful aspects of hooks is the ability to create custom hooks. Custom hooks allow you to extract component logic into reusable functions. A custom hook is simply a function whose name starts with "use" and that may call other hooks.

Good custom hooks encapsulate a specific piece of functionality, such as fetching data, handling forms, or managing browser APIs. They should have clear inputs and outputs, and they should not be too granular or too broad. The best custom hooks feel like built-in hooks — they solve a common problem with a simple API.

## Conclusion

Mastering React Hooks is essential for modern React development. Start with the basics of useState and useEffect, then gradually incorporate the more advanced hooks as your needs grow. Always prioritize correctness over optimization, and remember that the best code is code that your team can understand and maintain. Happy coding!`,
      category: 'general',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      authorId: student1.id,
      attachments: JSON.stringify([]),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Database Design Fundamentals: From Normalization to Indexing',
      content: `A well-designed database is the backbone of any scalable application. Poor database design leads to data redundancy, inconsistency, and performance bottlenecks that become increasingly difficult to fix as your application grows. In this article, I will cover the fundamental principles of relational database design, from normalization to indexing strategies, with practical examples that you can apply to your own projects.

## Why Database Design Matters

Many developers jump straight into writing queries without thinking carefully about their schema design. This approach works for small prototypes but quickly breaks down as data volume and user count increase. A poorly designed schema can lead to slow queries, data anomalies, and painful migration processes.

The cost of fixing a bad database design grows exponentially over time. What might take an hour to fix during the design phase could take weeks to address in production, especially when you need to migrate existing data. Investing time in proper database design upfront saves enormous amounts of time and resources in the long run.

## Understanding Normalization

Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. The process involves dividing large tables into smaller, related tables and defining relationships between them using foreign keys.

### First Normal Form (1NF)

A table is in First Normal Form if every column contains atomic (indivisible) values and each row is unique. This means no repeating groups or arrays within a single column. For example, instead of storing multiple phone numbers in a single comma-separated column, you should create a separate phone numbers table with one number per row.

### Second Normal Form (2NF)

A table is in Second Normal Form if it is in 1NF and every non-key attribute is fully dependent on the entire primary key. This primarily affects tables with composite primary keys. If an attribute depends on only part of the composite key, it should be moved to its own table.

For example, consider an OrderDetails table with columns (OrderID, ProductID, ProductName, Quantity, UnitPrice). The ProductName depends only on ProductID, not on the combination of OrderID and ProductID. To achieve 2NF, you would move ProductName to a separate Products table.

### Third Normal Form (3NF)

A table is in Third Normal Form if it is in 2NF and no non-key attribute depends on another non-key attribute. This eliminates transitive dependencies. For instance, if you have columns (EmployeeID, DepartmentID, DepartmentName), DepartmentName depends on DepartmentID rather than directly on EmployeeID. The solution is to move DepartmentName to a separate Departments table.

### Beyond 3NF: BCNF and Higher

Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF that handles certain edge cases where a table is in 3NF but still has anomalies. In practice, most applications aim for 3NF or BCNF, as higher normal forms (4NF, 5NF, 6NF) are rarely needed and can complicate the schema unnecessarily.

## When to Denormalize

While normalization is essential for data integrity, there are legitimate reasons to denormalize in certain situations. Read-heavy applications often benefit from denormalized data because it reduces the number of joins needed for common queries, which significantly improves read performance.

Denormalization is a trade-off: you gain read performance at the cost of increased storage and more complex write operations. When you denormalize, you must ensure that updates are propagated to all copies of the data, either through application logic or database triggers.

Common denormalization patterns include materialized views, pre-computed aggregate columns, and duplicate columns across related tables. The key is to denormalize deliberately and document your reasons, rather than accidentally creating a denormalized schema through poor design.

## Indexing Strategies

Indexes are data structures that dramatically speed up data retrieval at the cost of additional storage and slower write operations. Understanding how to create effective indexes is one of the most impactful skills for database performance optimization.

### B-Tree Indexes

The default index type in most relational databases is the B-tree index. B-trees are balanced tree structures that maintain sorted data and allow searches, insertions, and deletions in logarithmic time. They are effective for equality comparisons, range queries, and ORDER BY operations.

When creating a B-tree index, column order matters significantly. A composite index on (last_name, first_name) can efficiently serve queries that filter on last_name alone, or on both last_name and first_name. However, it cannot efficiently serve queries that filter only on first_name. This is known as the leftmost prefix rule.

### Partial Indexes

Partial indexes index only a subset of rows in a table based on a conditional expression. They are useful when you frequently query a specific subset of data. For example, if you have an orders table and most queries filter for unpaid orders, you can create a partial index on the status column where status equals "unpaid". This index is smaller and faster to maintain than a full index on the status column.

### Covering Indexes

A covering index includes all the columns needed to satisfy a query, so the database can return results directly from the index without accessing the table. This is known as an index-only scan and can be dramatically faster than a regular index scan followed by a table lookup.

## Foreign Keys and Referential Integrity

Foreign key constraints ensure that relationships between tables remain consistent. When you define a foreign key, the database enforces that every value in the foreign key column references an existing primary key in the parent table.

The ON DELETE and ON UPDATE actions determine what happens when a referenced row is modified. CASCADE automatically deletes or updates related rows, SET NULL sets the foreign key to NULL, and RESTRICT prevents the operation if related rows exist. Choosing the right action depends on your business logic and data requirements.

## Conclusion

Database design is a foundational skill that every backend developer should master. By understanding normalization, knowing when to denormalize, and applying effective indexing strategies, you can build databases that are both correct and performant. Remember that database design is not a one-time activity — as your application evolves, your schema should evolve with it through careful migration planning.`,
      category: 'study',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=600&h=400&fit=crop',
      authorId: lecturer.id,
      attachments: JSON.stringify([]),
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Getting Started with TypeScript: From JavaScript to Type Safety',
      content: `TypeScript has become the de facto standard for building large-scale JavaScript applications. By adding static type checking on top of JavaScript, TypeScript catches bugs at compile time that would otherwise surface at runtime. In this guide, I will walk you through the transition from JavaScript to TypeScript, covering the essential concepts, practical patterns, and common pitfalls that beginners encounter.

## Why TypeScript Matters

JavaScript is a dynamically typed language, which means variable types are determined at runtime. While this flexibility makes JavaScript easy to get started with, it also means that type-related bugs can only be discovered when the code actually runs. In a large codebase, this leads to runtime errors that are difficult to diagnose and fix.

TypeScript addresses this problem by adding optional static typing to JavaScript. The TypeScript compiler checks your code for type errors before it runs, catching many common bugs during development rather than in production. Studies have shown that TypeScript can prevent approximately 15% of the bugs that would otherwise make it into production code.

Beyond error prevention, TypeScript provides superior developer experience through intelligent code completion, inline documentation, and automated refactoring support in modern editors. This makes working in a large codebase significantly more productive and less error-prone.

## Basic Types

TypeScript provides several built-in types that cover the most common data shapes in JavaScript:

The primitive types include string, number, and boolean. These work exactly as you would expect from JavaScript. TypeScript also has null and undefined types, and the strictNullChecks compiler option ensures you handle these cases explicitly.

Arrays can be typed using the syntax type[] or Array<type>. For example, number[] represents an array of numbers. Tuples provide a way to express arrays with fixed lengths and known types at each position, such as [string, number] for a key-value pair.

The enum type allows you to define a set of named constants. Numeric enums assign incrementing numbers to each member, while string enums assign string values. String enums are generally preferred because they are more self-documenting in logs and debugging output.

The any type opts out of type checking for a value. While it can be useful as a temporary escape hatch, overusing any defeats the purpose of TypeScript. The unknown type is a type-safe alternative to any — it represents any value but requires you to narrow the type before using it.

## Interfaces and Type Aliases

Interfaces and type aliases are the two primary ways to define object shapes in TypeScript. Interfaces use the interface keyword and support declaration merging, which means multiple declarations with the same name are automatically merged. This makes interfaces ideal for defining the shape of API responses and object literals.

Type aliases use the type keyword and can represent any type, not just object shapes. They support unions, intersections, conditional types, and mapped types. While interfaces and type aliases are largely interchangeable for simple object types, type aliases are more flexible for advanced type programming.

Choosing between them is largely a matter of preference and consistency. Many teams adopt the convention of using interfaces for object shapes and type aliases for everything else. The important thing is to be consistent within your codebase.

## Generics

Generics allow you to write functions, classes, and interfaces that work with multiple types while maintaining type safety. Instead of specifying a concrete type, you use a type parameter that is determined when the function or class is used.

The classic example is an identity function that returns whatever value is passed in. Without generics, you would have to use any, which loses type information. With generics, you can write function identity<T>(arg: T): T, which preserves the type through the function.

Generic constraints allow you to restrict the types that a type parameter can accept. By using the extends keyword, you can require that the type parameter has certain properties or implements a certain interface. This provides flexibility while still enforcing minimum requirements.

## Union and Intersection Types

Union types allow a value to be one of several types. You create a union type using the pipe operator (|). For example, string | number means the value can be either a string or a number. Union types are particularly useful for function parameters that accept multiple types, or for variables that can hold different shapes of data.

Intersection types combine multiple types into one. You create an intersection type using the ampersand operator (&). The resulting type has all the properties of each constituent type. Intersections are commonly used with generic constraints and to compose types from smaller pieces.

## Type Guards and Narrowing

When working with union types, TypeScript needs to know which specific type a value is before you can access type-specific properties or methods. Type guards are runtime checks that narrow the type within a conditional block.

The typeof operator works for primitive types, instanceof works for class instances, and the "in" operator checks for property existence. You can also define custom type guard functions that return a type predicate, which tells the compiler exactly what type the value is after the check.

## Practical Tips for Migration

Migrating an existing JavaScript project to TypeScript can be done gradually. Start by renaming .js files to .ts and fixing the resulting type errors. Use any temporarily for complex types you have not yet figured out, but track these with a TODO comment so you can come back and replace them with proper types.

Enable strict mode in your tsconfig.json as early as possible. While it may produce more errors initially, it catches the most important type issues. The noImplicitAny and strictNullChecks options are particularly valuable for preventing common JavaScript bugs.

## Conclusion

TypeScript is a powerful tool that brings type safety and improved developer experience to JavaScript development. The learning curve is real, but the investment pays dividends in fewer bugs, better documentation, and more confident refactoring. Start with the basics, be consistent in your conventions, and gradually explore the more advanced features as you become comfortable with the fundamentals.`,
      category: 'general',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      authorId: student2.id,
      attachments: JSON.stringify([]),
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Cybersecurity in Modern Web Applications: A Practical Defense Guide',
      content: `Security should never be an afterthought in web development. Every year, thousands of web applications are compromised due to preventable vulnerabilities. From injection attacks to broken authentication, the OWASP Top Ten provides a roadmap of the most critical security risks. In this article, I will cover the most important web security vulnerabilities and provide practical strategies for defending against them in your applications.

## The Threat Landscape

Web applications face a diverse range of threats. Attackers may seek to steal user data, hijack sessions, deface websites, or use your infrastructure to launch further attacks. Understanding the threat landscape is the first step toward building secure applications.

The most common attack vectors include injection attacks, broken authentication, cross-site scripting (XSS), insecure direct object references, and misconfigured security headers. Each of these vulnerabilities has well-understood prevention strategies, yet they continue to appear in production applications due to oversight, time pressure, or lack of awareness.

## SQL Injection: The Persistent Threat

SQL injection remains one of the most dangerous web vulnerabilities. It occurs when user input is concatenated directly into SQL queries without proper sanitization or parameterization. An attacker can inject malicious SQL code to read, modify, or delete data from the database.

The defense against SQL injection is straightforward: always use parameterized queries or prepared statements. These mechanisms separate SQL code from data, making injection impossible. Modern ORMs like Prisma, TypeORM, and Sequelize use parameterized queries by default, which provides automatic protection.

If you must construct queries dynamically, use the query builder methods provided by your ORM or database library rather than string concatenation. Additionally, apply the principle of least privilege to database accounts — the application database user should only have the permissions it needs, not full admin access.

## Cross-Site Scripting (XSS)

XSS attacks occur when an application includes untrusted data in a web page without proper validation or escaping. This allows attackers to inject malicious scripts that execute in the browsers of other users. There are three main types of XSS attacks: stored, reflected, and DOM-based.

Stored XSS is the most severe form. The malicious script is persisted in the application's storage (typically the database) and served to every user who views the affected page. This can happen in comment sections, user profiles, or any feature that accepts and displays user-generated content.

Reflected XSS occurs when user input is immediately returned in the response without proper escaping. This typically requires the victim to click a crafted link that includes the malicious payload in the URL or POST data.

DOM-based XSS happens entirely on the client side when JavaScript reads untrusted data from the DOM and writes it back without sanitization. This can occur with URL fragments, document.referrer, or any source of untrusted data that flows into the DOM.

Prevention strategies include output encoding (escaping HTML entities, JavaScript strings, and URL parameters), Content Security Policy headers, and using modern frameworks that automatically escape output. React, for example, escapes all values by default in JSX, which prevents most XSS attacks.

## Authentication and Session Management

Broken authentication vulnerabilities allow attackers to compromise user accounts through credential stuffing, brute force attacks, or session hijacking. Strong authentication requires multiple layers of defense.

Passwords must be hashed using a strong, slow algorithm like bcrypt, scrypt, or Argon2. Never use MD5, SHA-1, or SHA-256 for password hashing — these are fast algorithms designed for data integrity, not password protection. Always include a unique salt for each password to prevent rainbow table attacks.

Multi-factor authentication (MFA) adds a critical second layer of security. Even if an attacker obtains a user's password, they cannot access the account without the second factor. Implement MFA using TOTP (Time-based One-Time Password) or WebAuthn for the best balance of security and usability.

Session management requires secure cookie settings: HttpOnly flag prevents JavaScript access, Secure flag ensures cookies are only sent over HTTPS, SameSite attribute prevents cross-site request forgery, and appropriate expiration limits the window of opportunity for session hijacking.

## Cross-Site Request Forgery (CSRF)

CSRF attacks trick authenticated users into making unwanted requests to the application. Since browsers automatically include cookies with requests, an attacker can craft a malicious page that submits a form to your application using the victim's credentials.

The standard defense is to include a unique, unpredictable token in every state-changing request. This CSRF token must be verified on the server side. Modern frameworks like Next.js, Django, and Rails provide built-in CSRF protection that you should always enable.

The SameSite cookie attribute provides additional protection. Setting SameSite=Strict or SameSite=Lax prevents the browser from sending cookies with cross-site requests, which effectively blocks most CSRF attacks. The Lax setting is recommended for most applications as it balances security with usability.

## Security Headers

HTTP security headers instruct browsers to apply additional security protections. The most important headers include Content-Security-Policy (controls which resources the page can load), X-Content-Type-Options (prevents MIME type sniffing), X-Frame-Options (prevents clickjacking), and Strict-Transport-Security (enforces HTTPS connections).

Implementing these headers is one of the easiest and most impactful security improvements you can make. Most headers can be added in a few lines of middleware configuration. Tools like securityheaders.com can scan your site and recommend specific improvements.

## Conclusion

Web security is a continuous process, not a one-time checklist. Stay informed about new vulnerabilities, regularly audit your code, and make security a part of your development culture. The strategies outlined in this article provide a strong foundation, but security requirements evolve as threats evolve. Always be learning, always be testing, and always be improving your defenses.`,
      category: 'announcements',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=600&h=400&fit=crop',
      authorId: lecturer.id,
      attachments: JSON.stringify([]),
    },
  });

  const post5 = await prisma.post.create({
    data: {
      title: 'Building Scalable Systems: Architecture Patterns for Growing Applications',
      content: `Every successful application eventually faces the challenge of scale. What works for a hundred users often breaks under the weight of thousands or millions. In this article, I will explore the fundamental architecture patterns that enable applications to grow gracefully, from monoliths to microservices, and from synchronous calls to event-driven communication.

## Starting with a Monolith

Most applications begin as monoliths — a single deployable unit containing all the application logic. This is not a bad thing. Monoliths are simple to develop, test, and deploy. They avoid the distributed systems complexity that comes with microservices. For small teams and early-stage products, a monolith is often the right choice.

The key to a successful monolith is maintaining clean internal boundaries. Even within a single codebase, organize your code into well-defined modules with clear interfaces between them. This discipline pays off when you eventually need to extract a service, because the boundaries are already established.

Signs that your monolith is becoming unwieldy include deployment bottlenecks (one team's changes require another team's review), tangled dependencies that make it hard to understand the impact of changes, and slow test suites that delay feedback. These symptoms suggest it may be time to consider decomposition.

## The Microservices Approach

Microservices decompose an application into small, independently deployable services, each owning a specific business capability. Each service has its own database, which eliminates shared database schemas as a coupling point. Services communicate through well-defined APIs, typically REST or gRPC over HTTP.

The benefits of microservices include independent deployment and scaling, technology diversity (each service can use the most appropriate language and framework), fault isolation (a failure in one service does not bring down the entire system), and organizational scalability (teams can own and operate services independently).

However, microservices introduce significant complexity. Distributed systems are inherently harder to debug, monitor, and test. Network calls between services are slower and less reliable than in-process calls. Data consistency across services requires careful coordination through patterns like sagas and eventual consistency. The operational overhead of running many services requires robust infrastructure and DevOps practices.

## Event-Driven Architecture

Event-driven architecture (EDA) decouples services through asynchronous event communication. Instead of services calling each other directly, they publish events to a message broker (such as Kafka, RabbitMQ, or AWS SNS/SQS) and consume events from it. This pattern enables loose coupling and real-time data flow.

The event sourcing pattern takes EDA further by storing all state changes as an immutable sequence of events. Instead of storing the current state of an entity, you store every event that led to the current state. This provides a complete audit trail and enables rebuilding state from any point in time.

Challenges with EDA include event ordering (ensuring events are processed in the correct order), idempotency (handling duplicate events gracefully), and eventual consistency (accepting that data may be temporarily inconsistent across services). These challenges are manageable with proper design, but they require a shift in thinking from the immediate consistency guarantees of a monolith.

## Caching Strategies

Caching is one of the most effective techniques for improving application performance. By storing frequently accessed data in a fast-access layer, you can dramatically reduce database load and response times. However, caching introduces the challenge of keeping cached data fresh and consistent with the source of truth.

Client-side caching (browser cache, service workers) reduces server load and improves perceived performance. CDN caching serves static assets and cacheable API responses from edge locations close to users. Application-level caching (Redis, Memcached) stores computed results or frequently accessed database rows. Database-level caching (query cache, buffer pool) reduces disk I/O for repeated queries.

The cache-aside pattern is the most common caching approach. The application checks the cache first, and if the data is not found, it fetches from the database and populates the cache for future requests. This pattern is simple and works well for read-heavy workloads. For write-heavy workloads, the write-through pattern updates both the cache and the database simultaneously.

## Database Scaling

Vertical scaling (adding more CPU, RAM, and storage to a single database server) is the simplest approach but has practical and financial limits. Horizontal scaling distributes data across multiple servers using sharding or partitioning.

Read replicas distribute read queries across multiple database copies, which is effective for read-heavy workloads. Write operations still go to the primary database and are asynchronously replicated to the replicas. This introduces eventual consistency for read queries, which your application must handle gracefully.

Sharding distributes data across multiple database instances based on a shard key. Each shard holds a subset of the data, and the application or a routing layer directs queries to the appropriate shard. Choosing a good shard key is critical — it should distribute data evenly and minimize cross-shard queries.

## Conclusion

There is no one-size-fits-all architecture. The right approach depends on your team size, traffic patterns, business requirements, and operational maturity. Start simple, measure everything, and evolve your architecture based on real needs rather than hypothetical scale. The best architecture is one that your team can build, operate, and debug effectively.`,
      category: 'projects',
      imageUrl: 'https://images.unsplash.com/photo-1551434674-e9b7c289f8a7?w=600&h=400&fit=crop',
      authorId: student1.id,
      attachments: JSON.stringify([]),
    },
  });

  const post6 = await prisma.post.create({
    data: {
      title: 'Upcoming Tech Fest 2024: Call for Presentations and Workshops',
      content: `We are thrilled to announce the annual Tech Fest 2024, organized by the Student Computing Society in collaboration with the Faculty of Computing! This year's event promises to be bigger and better than ever, with keynote speakers from leading tech companies, hands-on workshops, and a 24-hour hackathon. Read on for all the details and how you can get involved.

## Event Overview

Tech Fest 2024 will be held over three days, from March 15th to March 17th, at the Main Auditorium and adjacent workshop rooms. The event is open to all undergraduate and postgraduate students across the faculty. Last year, we welcomed over 500 participants, and this year we are aiming for 800.

The theme for this year is "Building the Future: From Code to Impact." We want to highlight how technology is not just about writing code, but about creating meaningful change in society. Whether you are interested in artificial intelligence, web development, cybersecurity, or data science, there is something for you at Tech Fest 2024.

## Call for Presentations

We are now accepting presentation proposals from students and faculty members. Each presentation slot is 30 minutes, including a 5-minute Q&A session. We welcome talks on any technology-related topic, including but not limited to:

- Emerging programming languages and frameworks
- Machine learning and artificial intelligence applications
- Cloud computing and DevOps practices
- Mobile application development
- Open source contributions and community building
- Career advice and industry trends
- Ethical considerations in technology

To submit a proposal, send an email to techfest@students.sliit.lk with your presentation title, a 200-word abstract, and a brief speaker bio. The deadline for submissions is February 20th. Selected speakers will be notified by February 28th.

## Workshop Sessions

In addition to presentations, we are offering hands-on workshop sessions. These 90-minute interactive sessions allow participants to learn practical skills with guidance from experienced facilitators. Workshop rooms are equipped with workstations, but participants are encouraged to bring their own laptops.

Confirmed workshops include an Introduction to Docker and Containerization, Building Real-Time Applications with WebSockets, Getting Started with Flutter for Cross-Platform Mobile Development, and a Data Visualization Masterclass using Python and D3.js.

If you would like to facilitate a workshop, please submit your proposal using the same email address. Include the workshop title, a detailed outline of what participants will build or learn, prerequisites, and maximum capacity.

## 24-Hour Hackathon

The highlight of Tech Fest is always the hackathon. This year, teams of up to four members will have 24 hours to build a working prototype that addresses a real-world problem. The theme will be revealed at the start of the hackathon to ensure a level playing field.

Prizes include cash awards for the top three teams, internship interview opportunities with sponsoring companies, and one-year subscriptions to premium developer tools. All participants receive certificates of participation and exclusive Tech Fest merchandise.

Registration for the hackathon opens on March 1st and is limited to 50 teams on a first-come, first-served basis. Register early to secure your spot. Teams can be formed across different departments and year groups.

## Industry Networking

New for this year, we are hosting an industry networking session on the final day of Tech Fest. Representatives from over 20 tech companies will be available to discuss internship opportunities, graduate positions, and industry trends. This is an excellent opportunity to make connections and learn about career paths directly from professionals.

Students are encouraged to bring printed copies of their resumes and prepare a brief introduction about themselves and their interests. Dress code is smart casual. The networking session runs from 2:00 PM to 5:00 PM on March 17th.

## How to Register

General registration for Tech Fest 2024 is free for all students. Simply visit the registration portal at techfest.sliit.lk and sign in with your student email. You will receive a confirmation email with your unique QR code, which you must present at the registration desk on the day of the event.

We look forward to seeing you at Tech Fest 2024. Let us build the future together!`,
      category: 'events',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
      authorId: student2.id,
      attachments: JSON.stringify([]),
    },
  });

  const post7 = await prisma.post.create({
    data: {
      title: 'Effective Study Techniques: How to Retain More and Study Less',
      content: `Many students spend long hours studying yet feel like they retain very little. The problem is rarely a lack of effort — it is a lack of effective technique. Cognitive science has given us powerful insights into how memory works, and applying these insights can dramatically improve your learning efficiency. In this article, I will cover the evidence-based study techniques that top students use to retain more information in less time.

## The Problem with Passive Studying

Passive studying includes re-reading notes, highlighting text, and watching lecture recordings at 2x speed. These methods feel productive because they are familiar and comfortable. However, research consistently shows that passive review produces very shallow learning. The information enters your short-term memory but is quickly forgotten because your brain never had to work hard to retrieve it.

The key insight from cognitive science is that **struggle is necessary for learning**. When your brain has to work to recall or apply information, it strengthens the neural pathways associated with that knowledge. Easy studying does not produce lasting learning.

## Active Recall: The Most Powerful Technique

Active recall, also called retrieval practice, is the process of actively trying to remember information without looking at your notes. Instead of re-reading a chapter, you close the book and write down everything you can remember. Instead of reviewing flashcards passively, you cover the answer and force yourself to retrieve it.

The testing effect, one of the most replicated findings in educational psychology, shows that retrieving information from memory is far more effective for long-term retention than re-reading the same material. A single test session produces better retention than three additional study sessions of passive review.

To apply active recall, try the blank page method: after studying a topic, take a blank sheet of paper and write everything you can recall from memory. Then check your notes to see what you missed. Focus your next study session on the gaps, and repeat the process.

## Spaced Repetition: Fighting the Forgetting Curve

Hermann Ebbinghaus discovered that we forget information at a predictable rate — roughly half of newly learned information is forgotten within a day, and most of the rest within a week. However, each time you successfully recall information, the forgetting rate slows down significantly.

Spaced repetition exploits this phenomenon by scheduling reviews at increasing intervals. Instead of cramming all your review into a single session, you space it out over days and weeks. The first review might happen the day after initial learning, the second review three days later, the third review a week after that, and so on.

Apps like Anki and RemNote implement spaced repetition algorithms that automatically schedule your reviews at optimal intervals. If you consistently use a spaced repetition system for your course material, you can maintain high retention rates with just 20 to 30 minutes of daily review.

## The Pomodoro Technique for Focus

The Pomodoro Technique breaks your study time into focused 25-minute blocks separated by 5-minute breaks. After four Pomodoros, you take a longer break of 15 to 30 minutes. This approach works because it makes large tasks feel manageable, prevents mental fatigue, and creates a sense of urgency that reduces procrastination.

During each Pomodoro, commit to working on a single task with no distractions. Put your phone in another room, close social media tabs, and use a site blocker if necessary. The break is equally important — use it to genuinely rest, not to check your phone.

## Interleaving: Mixing Topics for Better Learning

Blocked practice involves studying one topic intensively before moving to the next. Interleaved practice involves mixing multiple topics within a single study session. Although blocked practice feels more productive because you build momentum on a single topic, research shows that interleaved practice produces significantly better long-term retention and transfer.

For example, instead of spending two hours on calculus and then two hours on statistics, alternate between problems from different topics every 20 to 30 minutes. This forces your brain to distinguish between different concepts and retrieval cues, which builds more flexible and durable knowledge.

## Elaborative Interrogation and Self-Explanation

Elaborative interrogation involves asking yourself "why" and "how" questions as you study. Instead of simply accepting a fact, ask why it is true and how it connects to what you already know. This encourages deeper processing and creates more meaningful connections in your memory.

Self-explanation is similar: as you work through a problem or read a passage, explain the reasoning to yourself in your own words. If you cannot explain it clearly, it is a signal that your understanding has gaps that need to be addressed.

## Conclusion

Effective studying is about working smarter, not harder. Replace passive review with active recall, space your repetitions to fight forgetting, use the Pomodoro Technique to maintain focus, and mix topics to build flexible understanding. These techniques require more mental effort than passive re-reading, but that effort is precisely what makes them work.`,
      category: 'study',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
      authorId: student2.id,
      attachments: JSON.stringify([]),
    },
  });

  const post8 = await prisma.post.create({
    data: {
      title: 'From Idea to Deployment: How We Built Our Final Year Project in 12 Weeks',
      content: `Our final year project began as a vague idea — something about helping students find study partners — and ended 12 weeks later as a fully deployed web application with 200 registered users. The journey was challenging, rewarding, and full of lessons that no textbook could have taught us. In this article, I want to share the exact process we followed, the mistakes we made, and the decisions that made the difference between a project that shipped and one that did not.

## Week 1-2: Defining the Problem

The biggest mistake most student projects make is starting to code before the problem is clearly defined. We spent the first two weeks not writing a single line of code. Instead, we interviewed 20 students about their study habits, pain points, and how they currently find study partners.

The insights were surprising. Students did not primarily want a matching algorithm — they wanted a way to find people studying the same specific topic at the same time, not just the same module. This led us to design around real-time availability and topic tagging rather than the profile-based matching we had originally envisioned.

We wrote a one-page problem statement, defined our target user persona, and agreed on three core features that we would build no matter what: a real-time availability indicator, a topic-based search, and a simple messaging system. Everything else was a nice-to-have.

## Week 3-4: Technology Stack and Architecture

With a clear problem definition, we chose our technology stack based on three criteria: familiarity, ecosystem maturity, and deployment simplicity. We settled on Next.js for the full stack framework, PostgreSQL with Prisma for the database, and Vercel for deployment.

The most important architectural decision was to use WebSockets for real-time presence. We evaluated both Socket.IO and Pusher. We chose Pusher because it handled the infrastructure complexity for us, leaving us free to focus on the application logic. In retrospect, this was the right call — the weeks we saved on infrastructure allowed us to polish the user experience instead.

We drew the database schema on a whiteboard, reviewed it as a team, and only then created the Prisma schema file. This upfront design work saved us from three schema migrations that would have been needed otherwise.

## Week 5-8: Core Development Sprint

With the architecture decided, we divided the work into vertical slices — each feature was built end-to-end by one developer. This meant each person owned the database model, API route, and UI for their assigned feature. We avoided the common trap of splitting work horizontally (one person does all the backend, another all the frontend), which creates bottlenecks and integration headaches.

We used GitHub Projects to track tasks and held daily 15-minute standups to surface blockers early. The rule was simple: if you are blocked for more than two hours, you raise it in the standup. This prevented the silent blocking that derails so many projects.

The biggest technical challenge was implementing the real-time availability feature. Users needed to appear offline immediately when they closed their browser, even without a logout action. We solved this with a combination of browser unload events and a server-side heartbeat timeout — if the server did not receive a heartbeat within 30 seconds, it marked the user as offline.

## Week 9-10: Testing and Bug Fixing

We set aside two full weeks for testing, which felt excessive at the time but proved essential. We wrote end-to-end tests using Playwright for the three critical user flows: registering and setting up a profile, searching for study partners, and sending a message. These tests caught two critical bugs that manual testing had missed.

User testing with five real students revealed three usability issues that our team had been blind to because we knew the system too well. The onboarding flow was confusing, the search results were not sorted intuitively, and the messaging interface did not make it clear when a message had been sent. All three were fixed within a day once identified.

## Week 11-12: Deployment and Polish

Deploying to Vercel was straightforward with Next.js, but we underestimated the work required to configure the production environment. Environment variables, email configuration, and database connection pooling each required careful attention.

We used Neon for our PostgreSQL database because it provided a generous free tier and automatic connection pooling through PgBouncer, which is essential for serverless deployments where each request may open a new database connection.

## Key Lessons

Building something real in a constrained time frame teaches lessons that lectures cannot. Define the problem before writing code. Choose simplicity over cleverness in your technology decisions. Build vertically, not horizontally. Surface blockers early. Test with real users. And most importantly — ship something, even if it is not perfect.

The version we deployed at week 12 was not the system we imagined at week one. It was better, because it was shaped by real user feedback and hard-won technical decisions.`,
      category: 'projects',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
      authorId: student1.id,
      attachments: JSON.stringify([]),
    },
  });

  const post9 = await prisma.post.create({
    data: {
      title: 'Important: Updated Submission Guidelines for SE3040 Assignment 2',
      content: `Dear students, please read this announcement carefully as it contains important updates to the submission requirements for Assignment 2 of SE3040 Applied Software Engineering. Several students have asked questions about the submission format and grading criteria, and I want to address all of them in one place to ensure everyone has the same information.

## Deadline Extension

Following the feedback received during last week's Q&A session, the submission deadline for Assignment 2 has been extended by five days. The new deadline is Friday, May 3rd at 11:59 PM. This extension is final and no further extensions will be granted, as the marking process must begin the following Monday.

Please do not wait until the last day to submit. The submission portal has strict time limits and does not account for network issues or last-minute technical difficulties on your end. Submit at least 24 hours before the deadline to be safe.

## Updated Submission Format

The submission format has been updated based on feedback that the original instructions were unclear. You must now submit a single ZIP file containing:

1. A PDF report following the provided template (maximum 15 pages, excluding appendices)
2. The complete source code in a folder named exactly \`src\`
3. A \`README.md\` file with clear setup and running instructions
4. A folder named \`screenshots\` containing at least five screenshots of your running application

The ZIP file must be named using the format \`StudentID_Assignment2.zip\`. Files that do not follow this naming convention will not be accepted by the automated grading system.

## Grading Criteria Update

The grading rubric has been updated to place more emphasis on code quality and documentation. The updated weightings are as follows: functionality (35%), code quality and design patterns (25%), documentation and report (25%), and testing evidence (15%).

The testing evidence requirement is new. You must include a section in your report describing the tests you performed, with screenshots or test output as evidence. Manual testing is acceptable, but automated tests (unit tests or integration tests) will be awarded bonus marks of up to 5%.

## Plagiarism Policy Reminder

I want to remind all students that plagiarism detection software will be run on all submissions. Using code from online sources is acceptable provided it is properly cited and constitutes no more than 20% of your total codebase. Code sharing between students is not permitted under any circumstances. Each student's submission must represent their own independent work.

If you are struggling with the assignment, please attend office hours or post in the Q&A forum. I am happy to provide guidance without doing the work for you.

## Frequently Asked Questions

**Can I use frameworks not covered in lectures?** Yes, you may use any framework or library as long as you can demonstrate understanding of it during the viva.

**Is a live deployment required?** A live deployment is not required but is strongly encouraged as it demonstrates additional technical capability and will be considered in the bonus marking.

**Can I work on this in pairs?** Assignment 2 is an individual assessment. Pair submissions will receive zero marks for both students.

If you have questions not addressed here, post them in the Q&A forum and I will respond within 24 hours on weekdays. Good luck with your submissions.`,
      category: 'announcements',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop',
      authorId: lecturer.id,
      attachments: JSON.stringify([]),
    },
  });

  const post10 = await prisma.post.create({
    data: {
      title: 'SLIIT AI & Data Science Society: Monthly Meetup Recap — April 2024',
      content: `Last Saturday's monthly meetup of the SLIIT AI and Data Science Society was our most well-attended session yet, with over 80 students and faculty members joining us in the Innovation Lab. For those who could not attend, here is a detailed recap of everything that was covered, along with links to resources shared by the presenters.

## Opening Keynote: The State of AI in Sri Lanka

The session opened with a keynote by Dr. Priya Ratnasingham from the Department of Information Technology, who gave an insightful overview of the current state of artificial intelligence adoption in Sri Lanka. She highlighted that while global AI investment grew by 60% last year, Sri Lanka's tech sector is still in the early stages of integrating AI into production systems.

Dr. Ratnasingham identified the three biggest barriers to AI adoption locally: the shortage of data engineering talent, the lack of high-quality labeled datasets in Sinhala and Tamil, and the absence of clear regulatory frameworks for AI-driven decisions in sensitive domains like healthcare and finance. She concluded with an optimistic note, pointing to several startups that are building AI-powered products specifically for the South Asian market.

## Technical Talk: Building Your First NLP Pipeline

The main technical session was delivered by Ashan Wickramasinghe, a final year Computer Science student who built an NLP pipeline for analyzing student feedback as his undergraduate research project. His presentation was one of the most practical and accessible talks we have had at a meetup.

Ashan walked through the complete pipeline from raw text collection to model deployment using Python, Hugging Face Transformers, and FastAPI. He covered tokenization, fine-tuning a pre-trained BERT model on a custom dataset, evaluating model performance with precision and recall metrics, and deploying the model as a REST API on a free-tier cloud instance.

Several attendees asked about the compute requirements for training and fine-tuning. Ashan explained that fine-tuning a BERT model on a small dataset (around 10,000 examples) requires roughly 4 to 8 hours on a free Google Colab GPU, which is entirely feasible for a student project. The slides and code repository from his presentation have been shared in our Discord server.

## Workshop: Exploratory Data Analysis with Pandas and Seaborn

The afternoon workshop was led by committee member Dilini Fernando, who guided participants through a hands-on EDA exercise using a real dataset of student academic performance. Participants used Jupyter notebooks to load, clean, and visualize the data, identifying patterns and anomalies that might not be obvious from summary statistics alone.

Key techniques covered included handling missing values with imputation strategies, detecting and treating outliers, creating correlation heatmaps, and building distribution plots to understand feature distributions before modeling. The workshop emphasized that EDA is not a box to check before modeling — it is an ongoing dialogue with your data that continues throughout a project.

The notebook from the workshop is available on our GitHub repository. You are encouraged to extend it with your own analysis and share your findings in our Discord channel.

## Upcoming Events

Our next meetup will focus on computer vision with a hands-on session on object detection using YOLOv8. We will also be hosting a Kaggle competition study group starting in two weeks, where teams will work on a machine learning competition together with mentorship from experienced members.

The society is also organizing a data hackathon in collaboration with a local fintech company in June. Details will be announced on our Instagram page and in the Discord server. Teams of two to four members will compete to build the best predictive model on a real financial dataset, with prizes including cloud credits, books, and internship interview opportunities.

To join the society or stay updated on events, follow us on Instagram at @sliit_ai_ds or join our Discord server using the link pinned in the community channel. We welcome students from all departments and all levels of experience.`,
      category: 'events',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
      authorId: student2.id,
      attachments: JSON.stringify([]),
    },
  });

  // 7. Create Comments on Posts
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This is exactly what I needed! Thanks for the clear explanation.',
      authorId: student2.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Great article! Do you have any recommendations for state management libraries?',
      authorId: student1.id,
      postId: post1.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      content: 'I would recommend Redux for larger projects, or Zustand for simpler cases.',
      authorId: lecturer.id,
      postId: post1.id,
    },
  });

  const comment4 = await prisma.comment.create({
    data: {
      content: 'Excellent breakdown of database fundamentals. Very helpful for my project!',
      authorId: student2.id,
      postId: post2.id,
    },
  });

  const comment5 = await prisma.comment.create({
    data: {
      content: 'Could you elaborate more on index optimization?',
      authorId: student1.id,
      postId: post2.id,
    },
  });

  const comment6 = await prisma.comment.create({
    data: {
      content: "TypeScript definitely has a learning curve, but it's worth the investment!",
      authorId: lecturer.id,
      postId: post3.id,
    },
  });

  // 8. Create Additional Comments
  const comment7 = await prisma.comment.create({
    data: {
      content: 'I have been using useReducer for our form state and it has simplified the code significantly. Great recommendation!',
      authorId: student2.id,
      postId: post1.id,
    },
  });

  const comment8 = await prisma.comment.create({
    data: {
      content: 'The section on indexing strategies was incredibly helpful. I never understood partial indexes before this.',
      authorId: student1.id,
      postId: post2.id,
    },
  });

  const comment9 = await prisma.comment.create({
    data: {
      content: 'TypeScript saved us from so many runtime errors during our final year project. Highly recommend making the switch early!',
      authorId: student1.id,
      postId: post3.id,
    },
  });

  const comment10 = await prisma.comment.create({
    data: {
      content: 'We implemented CSP headers on our project and it blocked several XSS attempts during testing. Essential security measure.',
      authorId: student2.id,
      postId: post4.id,
    },
  });

  const comment11 = await prisma.comment.create({
    data: {
      content: 'The event-driven architecture section really opened my eyes. We are considering Kafka for our next project.',
      authorId: student2.id,
      postId: post5.id,
    },
  });

  const comment12 = await prisma.comment.create({
    data: {
      content: 'Is there a limit on how many presentations one person can submit?',
      authorId: student1.id,
      postId: post6.id,
    },
  });

  const comment13 = await prisma.comment.create({
    data: {
      content: 'You can submit up to two presentation proposals per person. Looking forward to seeing your talk!',
      authorId: student2.id,
      postId: post6.id,
      parentCommentId: comment12.id,
    },
  });

  // 9. Create Likes on Posts
  await prisma.like.create({ data: { userId: student1.id, postId: post2.id } });
  await prisma.like.create({ data: { userId: student2.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: lecturer.id, postId: post1.id } });
  await prisma.like.create({ data: { userId: student1.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: student2.id, postId: post4.id } });
  await prisma.like.create({ data: { userId: lecturer.id, postId: post3.id } });
  await prisma.like.create({ data: { userId: student1.id, postId: post5.id } });
  await prisma.like.create({ data: { userId: student2.id, postId: post5.id } });
  await prisma.like.create({ data: { userId: lecturer.id, postId: post5.id } });
  await prisma.like.create({ data: { userId: student1.id, postId: post6.id } });
  await prisma.like.create({ data: { userId: lecturer.id, postId: post6.id } });
  await prisma.like.create({ data: { userId: student2.id, postId: post2.id } });

  // 10. Create Notifications for engagement
  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Kamal Perera liked your article "Mastering React Hooks: A Comprehensive Guide for 2024"',
      userId: student1.id,
      postId: post1.id,
      triggeredByUserId: student2.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Dr. Sarah liked your article "Mastering React Hooks: A Comprehensive Guide for 2024"',
      userId: student1.id,
      postId: post1.id,
      triggeredByUserId: lecturer.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'comment',
      title: 'New comment on your article',
      message: 'Kamal Perera commented on your article "Mastering React Hooks: A Comprehensive Guide for 2024"',
      userId: student1.id,
      postId: post1.id,
      commentId: comment1.id,
      triggeredByUserId: student2.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Sams Senarath liked your article "Database Design Fundamentals: From Normalization to Indexing"',
      userId: lecturer.id,
      postId: post2.id,
      triggeredByUserId: student1.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'comment',
      title: 'New comment on your article',
      message: 'Kamal Perera commented on your article "Database Design Fundamentals: From Normalization to Indexing"',
      userId: lecturer.id,
      postId: post2.id,
      commentId: comment4.id,
      triggeredByUserId: student2.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Sams Senarath liked your article "Getting Started with TypeScript: From JavaScript to Type Safety"',
      userId: student2.id,
      postId: post3.id,
      triggeredByUserId: student1.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'comment',
      title: 'New comment on your article',
      message: 'Sams Senarath commented on your article "Getting Started with TypeScript: From JavaScript to Type Safety"',
      userId: student2.id,
      postId: post3.id,
      commentId: comment9.id,
      triggeredByUserId: student1.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Kamal Perera liked your article "Cybersecurity in Modern Web Applications: A Practical Defense Guide"',
      userId: lecturer.id,
      postId: post4.id,
      triggeredByUserId: student2.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'like',
      title: 'New like on your article',
      message: 'Kamal Perera liked your article "Building Scalable Systems: Architecture Patterns for Growing Applications"',
      userId: student1.id,
      postId: post5.id,
      triggeredByUserId: student2.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'reply',
      title: 'New reply to your comment',
      message: 'Kamal Perera replied to your comment on "Upcoming Tech Fest 2024: Call for Presentations and Workshops"',
      userId: student1.id,
      postId: post6.id,
      commentId: comment13.id,
      triggeredByUserId: student2.id,
    },
  });

  // 11. Update post like and comment counts
  await prisma.post.update({ where: { id: post1.id }, data: { likeCount: 2, commentCount: 4 } });
  await prisma.post.update({ where: { id: post2.id }, data: { likeCount: 2, commentCount: 3 } });
  await prisma.post.update({ where: { id: post3.id }, data: { likeCount: 2, commentCount: 2 } });
  await prisma.post.update({ where: { id: post4.id }, data: { likeCount: 1, commentCount: 1 } });
  await prisma.post.update({ where: { id: post5.id }, data: { likeCount: 3, commentCount: 1 } });
  await prisma.post.update({ where: { id: post6.id }, data: { likeCount: 2, commentCount: 2 } });
  await prisma.post.update({ where: { id: post7.id }, data: { likeCount: 0, commentCount: 0 } });
  await prisma.post.update({ where: { id: post8.id }, data: { likeCount: 0, commentCount: 0 } });
  await prisma.post.update({ where: { id: post9.id }, data: { likeCount: 0, commentCount: 0 } });
  await prisma.post.update({ where: { id: post10.id }, data: { likeCount: 0, commentCount: 0 } });

  console.log('✅ Database seeded successfully with expanded test data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
