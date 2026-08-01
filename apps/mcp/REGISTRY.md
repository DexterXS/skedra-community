# Official MCP Registry submission

Skedra is prepared as a remote-only MCP Registry entry. The registry stores
metadata; users connect directly to the public Streamable HTTP endpoint at
`https://skedra.xyz/api/mcp`.

The metadata lives in `apps/mcp/server.json` and uses the GitHub-authenticated
name `io.github.moonriddim/skedra`.

## Preflight

1. Deploy the current API and confirm the MCP endpoint is publicly reachable.
   An authentication response is acceptable; a network or 5xx error is not.
2. Confirm OAuth discovery and sign-in work from at least one fresh MCP client.
3. Run `pnpm --filter @skedra/mcp test` and
   `pnpm --filter @skedra/mcp build` from the repository root.
4. Confirm the version in `server.json` matches the release being submitted.
5. Validate `server.json` against its `$schema` or with the current
   `mcp-publisher` release.

## Publish manually

Publishing changes an external registry and therefore stays a deliberate,
authenticated release action:

```powershell
cd apps/mcp
mcp-publisher --help
mcp-publisher login github
mcp-publisher publish
```

The GitHub account used for login must control the `moonriddim` namespace.

For repeatable releases, run the repository's **Publish MCP Registry** GitHub
Actions workflow. It downloads the pinned publisher with SHA-256 verification,
authenticates through GitHub OIDC, validates the metadata, publishes it and
checks that the new entry is searchable.

Verify the published entry:

```powershell
Invoke-RestMethod "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.moonriddim/skedra"
```

## Release checklist

- [ ] Managed API release is healthy
- [ ] Remote OAuth login works in Codex or another client
- [ ] Tool list contains all 23 expected tools
- [ ] A test board can be created and edited
- [ ] `server.json` version is final
- [ ] GitHub-authenticated publisher login completed
- [ ] Registry entry published and searchable
- [ ] Landing page and documentation link to the live entry

Official references:

- https://modelcontextprotocol.io/registry/remote-servers
- https://modelcontextprotocol.io/registry/authentication
- https://modelcontextprotocol.io/registry/quickstart
