



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