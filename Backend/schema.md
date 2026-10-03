# Line-by-line explanation

## The `users` table

```sql
-- Users
```
`--` starts a comment. Postgres ignores everything after it on that line.

```sql
CREATE TABLE users (
```
`CREATE TABLE` tells Postgres to make a new table. `users` is its name. The `(` opens the list of columns, and the matching `);` at the end closes it.

```sql
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
```
- `id` is the column name.
- `BIGINT` is the data type, a whole number stored in 8 bytes (up to about 9 quintillion). It won't run out of IDs.
- `GENERATED ALWAYS AS IDENTITY` makes Postgres assign the number itself (1, 2, 3...) for every new row. `ALWAYS` means you can't insert your own value by accident.
- `PRIMARY KEY` marks this column as the unique identifier for each row. It combines `UNIQUE` and `NOT NULL` and automatically gets an index for fast lookups.

```sql
username VARCHAR(50) NOT NULL UNIQUE,
```
- `VARCHAR(50)` is text of variable length, up to 50 characters. Longer values are rejected.
- `NOT NULL` means the column must have a value. A row without a username can't be inserted.
- `UNIQUE` means no two users can share the same username. Postgres rejects the duplicate.

```sql
email VARCHAR(255) NOT NULL,
```
Same idea, with a 255-character limit (the practical maximum length of an email address). I left `UNIQUE` off here because it's handled by the index further down.

```sql
password_hash TEXT NOT NULL,
```
`TEXT` is a string with no length limit. Hashes can vary in length depending on the algorithm, so this avoids truncation. The text after `--` on that line is a comment.

```sql
profile_picture TEXT,
```
There is no `NOT NULL`, so this column is optional. A user can have no picture, and the value is then `NULL`.

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```
- `TIMESTAMPTZ` is a date and time stored with time zone awareness. It's the safest choice for anything with users in different places.
- `DEFAULT now()` means that if you don't supply a value, Postgres fills in the current time automatically.
- There's no comma at the end because it's the last column.

## The email index

```sql
CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email));
```
- `CREATE INDEX` builds a lookup structure on a table, like the index at the back of a book.
- `UNIQUE` makes the index reject duplicates.
- `users_email_unique` is the name of the index.
- `ON users` says which table it belongs to.
- `(LOWER(email))` indexes the lowercase version of each email. This is an expression index. Because `Bob@mail.com` and `bob@mail.com` both become `bob@mail.com`, they count as duplicates and the second is rejected.

## The `messages` table

```sql
sent_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- `BIGINT` matches the type of `users.id`, which it has to, to link them.
- `NOT NULL` means every message must have a sender.
- `REFERENCES users(id)` creates a foreign key. The value must exist in the `id` column of `users`. You can't send a message from user 999 if that user doesn't exist.
- `ON DELETE CASCADE` says what happens when the referenced user is deleted. All of that user's messages are deleted automatically. Without it, Postgres would block the deletion.

```sql
sent_to BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
Identical, but for the recipient. Both columns point to the same `users` table.

```sql
subject VARCHAR(255) NOT NULL DEFAULT '',
```
The subject line, up to 255 characters. `DEFAULT ''` means that if none is given, it becomes an empty string rather than `NULL`. Together with `NOT NULL`, this lets you send a message with no subject.

```sql
body TEXT NOT NULL DEFAULT '',
```
The message content, with unlimited length and an empty-string default.

```sql
starred BOOLEAN NOT NULL DEFAULT FALSE,
```
`BOOLEAN` holds only `TRUE` or `FALSE`. New messages start unstarred. Your app flips it to `TRUE` when the user stars a message.

```sql
is_read BOOLEAN NOT NULL DEFAULT FALSE,
```
Works the same way. New messages start as unread.

```sql
sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
```
The time the message was sent, filled in automatically.

## The message indexes

```sql
CREATE INDEX messages_sent_to_idx ON messages (sent_to, sent_at DESC);
```
- This is a regular (non-unique) index, since many messages share the same recipient.
- `(sent_to, sent_at DESC)` is a composite index covering two columns. It's sorted by recipient first, then by date from newest to oldest (`DESC` means descending).
- It speeds up the inbox query: *"get all messages for user 5, newest first."* Postgres can read them already sorted instead of scanning the whole table.

```sql
CREATE INDEX messages_sent_by_idx ON messages (sent_by, sent_at DESC);
```
The same thing for the sent folder: *"get all messages user 5 sent, newest first."*

## Why `NOT NULL`, `DEFAULT` and constraints matter

They push your rules into the database itself. Even if your app code has a bug, Postgres won't let a message exist without a sender, or two users share an email. This is much safer than relying only on application code.




`saveUser` is an `async` function, so it returns a **Promise**. You aren't awaiting it, so `inputUser` is a pending Promise object, and `JSON.stringify` turns a Promise into `{}`.

## The fix

Add `await`:

```javascript
const inputUser = await saveUser(username, email, hashedPassword, profilePicture.path);

res.status(201).json({ message: 'USER CREATED PINTAW', output: inputUser });
```

## Other problems worth fixing

**1. Errors are swallowed in `saveUser`.** If the insert fails (e.g. duplicate email), your `catch` just logs and returns `undefined`. The controller will then respond with `201` and `output: undefined`. Rethrow so the controller's `catch` can handle it:

```javascript
} catch (error) {
    console.log(`error: ${error}`);
    throw error;
}
```

**2. The controller's `catch` never sends a response.** If anything throws, the request hangs until it times out:

```javascript
} catch (error) {
    console.log(`error: ${error}`);
    return res.status(500).json({ message: 'SERVER_ERROR' });
}
```

**3. `profilePicture` may be undefined.** If no file is uploaded, `profilePicture.path` throws. Use optional chaining:

```javascript
profilePicture?.path ?? null
```

**4. Don't return the password hash.** `RETURNING *` includes `password_hash`, which then goes straight into the response. Return only what you need:

```javascript
RETURNING id, username, email, profile_picture
```

**5. Use the async bcrypt version.** `hashSync` blocks the event loop. Use `await bcrypt.hash(password, 10)` instead. Also, `hashedPassword` will never be falsy (it throws on failure), so the "check if encryption worked" line is redundant.

**6. Status codes.** Missing fields should return `400`, not the default `200`. A duplicate email would ideally return `409`.