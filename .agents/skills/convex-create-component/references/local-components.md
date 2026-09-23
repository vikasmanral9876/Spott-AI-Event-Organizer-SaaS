# Local Convex Components

Read this file when the component should live inside the current app and does
not need to be published as an npm package.

## When to Choose This

- The user wants the simplest path
- The component only needs to work in this repo
- The goal is extracting app logic into a cleaner boundary

## Default Layout

Use this structure unless the repo already has a clear alternative pattern:

```text
convex/
  convex.config.ts
  components/
    <name>/
      convex.config.ts
      schema.ts
      <feature>.ts
```

## Workflow Notes

- Define the component with `defineComponent("<name>")`
- Install it from the app with `defineApp()` and `app.use(...)`
- Keep auth, environment access, public API wrappers, and HTTP route mounting in the app
- Let the component own isolated tables and reusable backend workflows
- Add app wrappers if clients need to call into the component

## Environment access guidance

- Components cannot access arbitrary app environment variables directly.
- Component-declared environment variables are available to component code via `process.env` or the generated `env` object when the component contract exposes them.
- Keep auth and public API wiring in the app, and pass explicit env values into components as needed.

## Checklist

- [ ] Component is inside `convex/components/<name>/`
- [ ] App installs it with `app.use(...)`
- [ ] Component owns only its own tables
- [ ] App wrappers handle client-facing calls when needed
